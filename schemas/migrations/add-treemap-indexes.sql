-- Migration: Add indexes for treemap query optimization
-- Created: 2025-11-24
-- Purpose: Optimize hierarchical queries for UNSPSC treemap visualization

-- Index on purchases.municipality_id for filtering by municipality
CREATE INDEX IF NOT EXISTS idx_purchases_municipality_id ON purchases(municipality_id);

-- Index on purchases.commodity_id for joining with commodities
CREATE INDEX IF NOT EXISTS idx_purchases_commodity_id ON purchases(commodity_id);

-- Index on commodities.class_id for joining with classes
CREATE INDEX IF NOT EXISTS idx_commodities_class_id ON commodities(class_id);

-- Index on classes.family_id for joining with families
CREATE INDEX IF NOT EXISTS idx_classes_family_id ON classes(family_id);

-- Index on families.segment_id for joining with segments
CREATE INDEX IF NOT EXISTS idx_families_segment_id ON families(segment_id);

-- Composite index for region-based queries (if we query by region first then municipality)
-- This helps when we need to filter municipalities by region
CREATE INDEX IF NOT EXISTS idx_municipalities_region_id ON municipalities(region_id);
