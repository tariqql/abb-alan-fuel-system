import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertInvoiceSchema, insertJourneySchema, 
  insertTankMeasurementSchema, insertAiPredictionSchema,
  insertFuelRequestSchema, insertVehicleSchema
} from "@shared/schema";
import { 
  getUncachableGitHubClient, 
  getAuthenticatedUser, 
  listRepositories, 
  createRepository,
  createOrUpdateFile,
  getFileContent
} from "./github";
import * as fs from "fs";
import * as path from "path";
import { 
  nafathService, 
  complianceService, 
  creditService, 
  employmentService, 
  customerRatingService 
} from "./services";
import {
  nafathInitiateSchema,
  nafathSimulateSchema,
  complianceCheckSchema,
  creditReportSchema,
  creditEvaluateSchema,
  employmentVerifySchema,
  customerEvaluateSchema,
} from "./services/validation";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============ Invoices API ============
  
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validated = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validated);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create invoice" });
    }
  });

  app.post("/api/invoices/:id/pay", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      const newPaidAmount = (invoice.paidAmount || 0) + invoice.monthlyAmount;
      const status = newPaidAmount >= invoice.totalAmount ? "paid" : "active";

      await storage.createPayment({
        invoiceId: invoice.id,
        amount: invoice.monthlyAmount,
        paymentMethod: "wallet",
        status: "completed",
      });

      const updated = await storage.updateInvoice(req.params.id, {
        paidAmount: newPaidAmount,
        status,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // ============ Fuel Stations API ============
  
  app.get("/api/stations", async (req, res) => {
    try {
      const stations = await storage.getFuelStations();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stations" });
    }
  });

  app.get("/api/stations/:id", async (req, res) => {
    try {
      const station = await storage.getFuelStation(req.params.id);
      if (!station) {
        return res.status(404).json({ error: "Station not found" });
      }
      res.json(station);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch station" });
    }
  });

  // ============ Fuel Requests API ============
  
  app.get("/api/fuel-requests", async (req, res) => {
    try {
      const requests = await storage.getFuelRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fuel requests" });
    }
  });

  app.post("/api/fuel-requests", async (req, res) => {
    try {
      const validated = insertFuelRequestSchema.parse(req.body);
      const request = await storage.createFuelRequest(validated);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create fuel request" });
    }
  });

  app.get("/api/fuel-requests/qr/:qr", async (req, res) => {
    try {
      const request = await storage.getFuelRequestByQR(req.params.qr);
      if (!request) {
        return res.status(404).json({ error: "Fuel request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fuel request" });
    }
  });

  app.post("/api/fuel-requests/:id/complete", async (req, res) => {
    try {
      const updated = await storage.updateFuelRequest(req.params.id, {
        status: "completed",
        completedAt: new Date(),
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete fuel request" });
    }
  });

  // ============ Journeys API ============
  
  app.get("/api/journeys", async (req, res) => {
    try {
      const journeys = await storage.getJourneys();
      res.json(journeys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journeys" });
    }
  });

  app.get("/api/journeys/:id", async (req, res) => {
    try {
      const journey = await storage.getJourney(req.params.id);
      if (!journey) {
        return res.status(404).json({ error: "Journey not found" });
      }
      res.json(journey);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journey" });
    }
  });

  app.post("/api/journeys", async (req, res) => {
    try {
      const validated = insertJourneySchema.parse(req.body);
      const journey = await storage.createJourney(validated);
      res.status(201).json(journey);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create journey" });
    }
  });

  app.delete("/api/journeys/:id", async (req, res) => {
    try {
      await storage.deleteJourney(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete journey" });
    }
  });

  // ============ Tank Measurements API (Snafi) ============
  
  app.get("/api/tank-measurements", async (req, res) => {
    try {
      const measurements = await storage.getTankMeasurements();
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch measurements" });
    }
  });

  app.post("/api/tank-measurements", async (req, res) => {
    try {
      const validated = insertTankMeasurementSchema.parse(req.body);
      const measurement = await storage.createTankMeasurement(validated);

      // Generate AI prediction
      const prediction = await storage.createAiPrediction({
        vehicleId: measurement.vehicleId,
        measurementId: measurement.id,
        predictedConsumption: 8.5,
        remainingRange: (measurement.fuelLevel / 8.5) * 100,
        recommendations: ["تفقد ضغط الإطارات", "قيادة هادئة توفر الوقود"],
      });

      res.status(201).json({ measurement, prediction });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create measurement" });
    }
  });

  // ============ AI Predictions API ============
  
  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await storage.getAiPredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch predictions" });
    }
  });

  // ============ Vehicles API ============
  
  app.get("/api/vehicles", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const vehicles = await storage.getVehicles(userId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validated = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validated);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create vehicle" });
    }
  });

  // ============ Partners API (Business App) ============
  
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  // ============ Snafi Approvals API ============
  
  app.get("/api/snafi-approvals", async (req, res) => {
    try {
      const approvals = await storage.getSnafiApprovals();
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch approvals" });
    }
  });

  // ============ GitHub API ============
  
  app.get("/api/github/user", async (req, res) => {
    try {
      const user = await getAuthenticatedUser();
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get GitHub user" });
    }
  });
  
  app.get("/api/github/repos", async (req, res) => {
    try {
      const repos = await listRepositories();
      res.json(repos);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to list repositories" });
    }
  });
  
  app.post("/api/github/repos", async (req, res) => {
    try {
      const { name, description, isPrivate } = req.body;
      const repo = await createRepository(name, description, isPrivate);
      res.status(201).json(repo);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to create repository" });
    }
  });
  
  app.post("/api/github/push", async (req, res) => {
    try {
      const { owner, repo, filePath, message } = req.body;
      
      const localPath = path.join(process.cwd(), filePath);
      const content = fs.readFileSync(localPath, 'utf-8');
      
      const existingFile = await getFileContent(owner, repo, filePath);
      const sha = existingFile && 'sha' in existingFile ? existingFile.sha : undefined;
      
      const result = await createOrUpdateFile(
        owner,
        repo,
        filePath,
        content,
        message || `Update ${filePath}`,
        sha as string | undefined
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to push file" });
    }
  });
  
  app.post("/api/github/push-all", async (req, res) => {
    try {
      const { owner, repo, files, message } = req.body;
      const results = [];
      
      for (const filePath of files) {
        const localPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(localPath)) continue;
        
        const content = fs.readFileSync(localPath, 'utf-8');
        const existingFile = await getFileContent(owner, repo, filePath);
        const sha = existingFile && 'sha' in existingFile ? existingFile.sha : undefined;
        
        const result = await createOrUpdateFile(
          owner,
          repo,
          filePath,
          content,
          message || `Update ${filePath}`,
          sha as string | undefined
        );
        results.push({ filePath, success: true });
      }
      
      res.json({ results });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to push files" });
    }
  });

  // ============ Verification & KYC API ============
  // ملاحظة: في بيئة الإنتاج، يجب إضافة middleware للمصادقة والتفويض
  // للتأكد من أن المستخدم مسجل دخوله وله صلاحية الوصول للبيانات

  // بدء التحقق من الهوية عبر نفاذ
  app.post("/api/verification/nafath/initiate", async (req, res) => {
    try {
      const validated = nafathInitiateSchema.parse(req.body);
      const result = await nafathService.initiateVerification(validated.userId, validated.nationalId);
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to initiate verification" });
    }
  });

  // التحقق من حالة نفاذ
  app.get("/api/verification/nafath/status/:requestId", async (req, res) => {
    try {
      const result = await nafathService.checkVerificationStatus(req.params.requestId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to check status" });
    }
  });

  // محاكاة تأكيد نفاذ (للتطوير فقط)
  app.post("/api/verification/nafath/simulate", async (req, res) => {
    try {
      const validated = nafathSimulateSchema.parse(req.body);
      const result = await nafathService.simulateVerification(validated.requestId, validated.approved);
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to simulate verification" });
    }
  });

  // التحقق من العمر
  app.get("/api/verification/age/:userId", async (req, res) => {
    try {
      const result = await nafathService.verifyAge(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to verify age" });
    }
  });

  // فحص الامتثال الشامل
  app.post("/api/verification/compliance/check", async (req, res) => {
    try {
      const validated = complianceCheckSchema.parse(req.body);
      const result = await complianceService.performFullCheck(validated.userId, validated.nationalId);
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to perform compliance check" });
    }
  });

  // الحصول على آخر فحص امتثال
  app.get("/api/verification/compliance/:userId", async (req, res) => {
    try {
      const result = await complianceService.getLastCheck(req.params.userId);
      if (!result) {
        return res.status(404).json({ error: "No compliance check found" });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get compliance check" });
    }
  });

  // جلب التقرير الائتماني
  app.post("/api/verification/credit/report", async (req, res) => {
    try {
      const validated = creditReportSchema.parse(req.body);
      const result = await creditService.getCreditReport(validated.userId, validated.nationalId);
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to get credit report" });
    }
  });

  // تقييم أهلية التمويل
  app.post("/api/verification/credit/evaluate", async (req, res) => {
    try {
      const validated = creditEvaluateSchema.parse(req.body);
      const result = await creditService.evaluateCreditEligibility(validated.userId, validated.requestedAmount);
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to evaluate credit" });
    }
  });

  // التحقق من المتعثرات
  app.get("/api/verification/credit/defaults/:userId", async (req, res) => {
    try {
      const result = await creditService.hasDefaultedLoans(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to check defaults" });
    }
  });

  // التحقق من التوظيف
  app.post("/api/verification/employment/verify", async (req, res) => {
    try {
      const validated = employmentVerifySchema.parse(req.body);
      const result = await employmentService.verifyEmployment(validated.userId, validated.nationalId);
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to verify employment" });
    }
  });

  // حساب أولوية العميل
  app.get("/api/verification/employment/priority/:userId", async (req, res) => {
    try {
      const result = await employmentService.calculatePriority(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to calculate priority" });
    }
  });

  // التقييم الشامل للعميل
  app.post("/api/verification/customer/evaluate", async (req, res) => {
    try {
      const validated = customerEvaluateSchema.parse(req.body);
      const result = await customerRatingService.performFullEvaluation(validated.userId, validated.nationalId);
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "بيانات غير صحيحة", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Failed to evaluate customer" });
    }
  });

  // الحصول على تقييم العميل
  app.get("/api/verification/customer/rating/:userId", async (req, res) => {
    try {
      const result = await customerRatingService.getRating(req.params.userId);
      if (!result) {
        return res.status(404).json({ error: "No rating found" });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get rating" });
    }
  });

  // فحص سريع للأهلية
  app.get("/api/verification/customer/eligibility/:userId", async (req, res) => {
    try {
      const result = await customerRatingService.quickEligibilityCheck(req.params.userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to check eligibility" });
    }
  });

  return httpServer;
}
