import { text, integer, real, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";

// UNSPSC Tables
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

// Data Tables -MAIRA EXTRA
export const regions = sqliteTable("regions", {
  region_id: integer("region_id").primaryKey(),
  region_name: text("region_name").notNull(),
});



export const municipalities = sqliteTable("municipalities", {
  municipality_id: integer("municipality_id").primaryKey(),
  municipality_name: text("municipality_name").notNull(),
  budget: real("budget"),
  budget_per_capita: real("budget_per_capita"),
  region_id: integer("region_id")
    .notNull()
    .references(() => regions.region_id),
});

export const items = sqliteTable("items", {
  onu_code: text("onu_code").primaryKey(),
  commodity_id: integer("commodity_id")
    .references(() => commodities.id),
  expected_min_range: integer("expected_min_range"),
  expected_max_range: integer("expected_max_range"),
  max_acceptable_price: real("max_acceptable_price"),
  commodity_code: text("commodity_code"),
  item_name: text("item_name").notNull(),
  sufficient_data: integer("sufficient_data").notNull(), // boolean as 0/1
});

export const suppliers = sqliteTable("suppliers", {
  supplier_rut: text("supplier_rut").primaryKey(),
  supplier_name: text("supplier_name"),
  supplier_size: text("supplier_size"),
});

export const purchases = sqliteTable("purchases", {
  purchase_id: integer("purchase_id").primaryKey(),
  purchase_code: text("purchase_code").notNull(),
  municipality_id: integer("municipality_id")
    .notNull()
    .references(() => municipalities.municipality_id),
  supplier_rut: text("supplier_rut")
    .notNull()
    .references(() => suppliers.supplier_rut),
  commodity_code: text("commodity_code"),
  item_quantity: integer("item_quantity").notNull(),
  unit_total_price: real("unit_total_price"),
  is_expensive: integer("is_expensive"), 
  price_excess_amount: real("price_excess_amount"),
  price_excess_percentage: real("price_excess_percentage"),
  onu_code: text("onu_code")
    .notNull()
    .references(() => items.onu_code),
});