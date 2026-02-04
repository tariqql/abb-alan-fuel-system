import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  vehiclePlate: text("vehicle_plate"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Fuel Stations
export const fuelStations = pgTable("fuel_stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  fuelTypes: text("fuel_types").array().notNull(),
  pricePerLiter: real("price_per_liter").notNull(),
  isOpen: boolean("is_open").default(true),
});

export const insertFuelStationSchema = createInsertSchema(fuelStations).omit({ id: true });
export type InsertFuelStation = z.infer<typeof insertFuelStationSchema>;
export type FuelStation = typeof fuelStations.$inferSelect;

// Invoices - Individual Bill Installment Service
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  stationId: varchar("station_id").notNull(),
  amount: real("amount").notNull(),
  fuelType: text("fuel_type").notNull(),
  liters: real("liters").notNull(),
  totalInstallments: integer("total_installments").notNull(),
  paidInstallments: integer("paid_installments").default(0),
  monthlyAmount: real("monthly_amount").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  dueDate: timestamp("due_date"),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, paidInstallments: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Installment Payments
export const installmentPayments = pgTable("installment_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  amount: real("amount").notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  status: text("status").notNull().default("completed"),
});

export const insertPaymentSchema = createInsertSchema(installmentPayments).omit({ id: true, paymentDate: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof installmentPayments.$inferSelect;

// Journey Plans - Design Your Journey Service
export const journeyPlans = pgTable("journey_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  startPoint: text("start_point").notNull(),
  endPoint: text("end_point").notNull(),
  totalDistance: real("total_distance"),
  estimatedFuel: real("estimated_fuel"),
  estimatedCost: real("estimated_cost"),
  stops: jsonb("stops").$type<JourneyStop[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export interface JourneyStop {
  stationId: string;
  stationName: string;
  order: number;
  distanceFromPrevious: number;
}

export const insertJourneyPlanSchema = createInsertSchema(journeyPlans).omit({ id: true, createdAt: true });
export type InsertJourneyPlan = z.infer<typeof insertJourneyPlanSchema>;
export type JourneyPlan = typeof journeyPlans.$inferSelect;

// Snafi AI - Fuel Tank Measurements
export const tankMeasurements = pgTable("tank_measurements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  vehiclePlate: text("vehicle_plate").notNull(),
  tankCapacity: real("tank_capacity").notNull(),
  currentLevel: real("current_level").notNull(),
  fuelPercentage: real("fuel_percentage").notNull(),
  estimatedRange: real("estimated_range"),
  avgConsumption: real("avg_consumption"),
  recommendation: text("recommendation"),
  measurementDate: timestamp("measurement_date").defaultNow(),
});

export const insertTankMeasurementSchema = createInsertSchema(tankMeasurements).omit({ id: true, measurementDate: true });
export type InsertTankMeasurement = z.infer<typeof insertTankMeasurementSchema>;
export type TankMeasurement = typeof tankMeasurements.$inferSelect;

// Snafi AI Predictions
export const snafiPredictions = pgTable("snafi_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  predictedEmptyDate: timestamp("predicted_empty_date"),
  recommendedFillDate: timestamp("recommended_fill_date"),
  suggestedStation: varchar("suggested_station"),
  suggestedLiters: real("suggested_liters"),
  confidenceScore: real("confidence_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSnafiPredictionSchema = createInsertSchema(snafiPredictions).omit({ id: true, createdAt: true });
export type InsertSnafiPrediction = z.infer<typeof insertSnafiPredictionSchema>;
export type SnafiPrediction = typeof snafiPredictions.$inferSelect;
