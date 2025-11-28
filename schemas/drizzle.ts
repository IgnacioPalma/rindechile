import { text, integer, real, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";

// 
// UNSPSC Tables
//

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export const segments = sqliteTable("segments", {
  id: integer("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  name: text("name").notNull(),
});

export const families = sqliteTable("families", {
  id: integer("id").primaryKey(),
  segmentId: integer("segment_id")
    .notNull()
    .references(() => segments.id),
  name: text("name").notNull(),
});

export const classes = sqliteTable("classes", {
  id: integer("id").primaryKey(),
  familyId: integer("family_id")
    .notNull()
    .references(() => families.id),
  name: text("name").notNull(),
});

export const commodities = sqliteTable("commodities", {
  id: integer("id").primaryKey(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id),
  name: text("name").notNull(),
});

// 
// Regions & Municipalities Tables
//

export const regions = sqliteTable("regions", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

export const municipalities = sqliteTable("municipalities", {
  id: integer("id").primaryKey(),
  region_id: integer("region_id")
    .notNull()
    .references(() => regions.id),
  name: text("name").notNull(),
  budget: real("budget"),
  budget_per_capita: real("budget_per_capita"),
});

// 
// Item Table
//

export const items = sqliteTable("items", {
  id: integer("id").primaryKey(),
  commodity_id: integer("commodity_id")
    .references(() => commodities.id),
  expected_min_range: integer("expected_min_range"),
  expected_max_range: integer("expected_max_range"),
  max_acceptable_price: real("max_acceptable_price"),
  name: text("name").notNull(),
  has_sufficient_data: integer("has_sufficient_data").notNull(), // boolean as 0/1
});

// 
// Supplier Table
//

export const suppliers = sqliteTable("suppliers", {
  rut: text("rut").primaryKey(),
  name: text("name"),
  size: text("size"),
});

// 
// Purchases Tables
//

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey(),
  item_id: integer("item_id")
    .notNull()
    .references(() => items.id),
  municipality_id: integer("municipality_id")
    .notNull()
    .references(() => municipalities.id),
  supplier_rut: text("supplier_rut")
    .notNull()
    .references(() => suppliers.rut),
  quantity: integer("quantity").notNull(),
  unit_total_price: real("unit_total_price"),
  is_expensive: integer("is_expensive"), 
  price_excess_amount: real("price_excess_amount"),
  price_excess_percentage: real("price_excess_percentage"),
  chilecompra_code: text("chilecompra_code").notNull(),
});