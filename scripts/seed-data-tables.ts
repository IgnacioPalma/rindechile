#!/usr/bin/env node
/**
 * Seeds Data tables (regions, municipalities, suppliers, purchases)
 * Reads from data_with_expensive_flag.csv and populates all data tables
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Import normalization functions from app/lib
import { normalizeMunicipalityName, normalizeRegionName, getRegionDisplayName } from '../app/lib/name-normalizer';

// Load municipality cod_comuna mappings from GeoJSON files
function loadMunicipalityCodComunaMap(): Map<string, number> {
  const map = new Map<string, number>();
  const geojsonDir = join(__dirname, '..', 'public', 'data', 'municipalities_by_region');
  const files = readdirSync(geojsonDir).filter(f => f.endsWith('.geojson'));
  
  files.forEach(file => {
    const data = JSON.parse(readFileSync(join(geojsonDir, file), 'utf-8'));
    data.features.forEach((feature: any) => {
      const name = feature.properties.Comuna;
      const codComuna = feature.properties.cod_comuna;
      const regionId = feature.properties.codregion;
      
      // Normalize name same way as CSV data
      const normalized = normalizeMunicipalityName(name);
      const key = `${normalized}|${regionId}`;
      map.set(key, codComuna);
    });
  });
  
  return map;
}

const MUNICIPALITY_COD_COMUNA_MAP = loadMunicipalityCodComunaMap();

/**
 * Normalizes region names to match between GeoJSON and data sources
 * Handles variations like:
 * - "Región de Arica y Parinacota" -> "Region de Arica y Parinacota"
 * - "Region de Los Rios" -> "Region de los Rios" (case-sensitive)
 */
function normalizeRegionNameLocal(regionName: string): string {
  if (!regionName) return '';
  
  // Remove "Región" prefix and replace with "Region"
  let normalized = regionName.replace(/^Región\s+/i, 'Region ');
  
  // Handle specific case variations
  if (normalized === 'Region de Los Rios') {
    return 'Region de los Rios';
  }
  
  return normalized;
}

// Region name to ID mapping (1-16) from data-service.ts
const REGION_ID_MAP: { [regionName: string]: number } = {
  'Region de Tarapaca': 1,
  'Region de Antofagasta': 2,
  'Region de Atacama': 3,
  'Region de Coquimbo': 4,
  'Region de Valparaiso': 5,
  'Region del Libertador General Bernardo OHiggins': 6,
  'Region del Maule': 7,
  'Region del Biobio': 8,
  'Region de la Araucania': 9,
  'Region de los Lagos': 10,
  'Region Aysen del General Carlos IbaNez del Campo': 11,
  'Region de Magallanes y de la Antartica': 12,
  'Region Metropolitana de Santiago': 13,
  'Region de los Rios': 14,
  'Region de Arica y Parinacota': 15,
  'Region del Nuble': 16,
};

interface CSVRow {
  institucion: string;
  regionUnidadCompra: string;
  proveedor: string;
  codigoProductoONU: string;
  cantidadItem: number;
  precioUnitarioTotal: number;
}

interface ProcessedData {
  regions: Map<string, string>; // normalized region name -> region ID (as string)
  municipalities: Map<string, { name: string; regionId: string; codComuna: number }>; // normalized name -> {name, regionId, codComuna}
  suppliers: Set<string>; // unique supplier names
  purchases: CSVRow[]; // all purchase rows
}

function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function parseCsv(filePath: string): CSVRow[] {
  console.log('📖 Reading CSV file (this may take a moment for large files)...');
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  console.log(`✅ File loaded with ${lines.length.toLocaleString()} lines`);
  
  // Parse header to find column indices
  const headerParts = parseCsvLine(lines[0]);
  const colIndices = {
    institucion: headerParts.indexOf('Institucion'),
    regionUnidadCompra: headerParts.indexOf('RegionUnidadCompra'),
    proveedor: headerParts.indexOf('Proveedor'),
    codigoProductoONU: headerParts.indexOf('CodigoProductoONU'),
    cantidadItem: headerParts.indexOf('CantidadItem'),
    precioUnitarioTotal: headerParts.indexOf('Precio_Unitario_TOTAL'),
  };
  
  console.log('Column indices:', colIndices);
  
  const rows: CSVRow[] = [];
  let skipped = 0;
  
  // Skip header, parse data rows
  for (let i = 1; i < lines.length; i++) {
    if (i % 50000 === 0) {
      console.log(`  Processing row ${i.toLocaleString()}...`);
    }
    
    const parts = parseCsvLine(lines[i]);
    
    // Validate required fields
    const institucion = parts[colIndices.institucion]?.trim();
    const regionUnidadCompra = parts[colIndices.regionUnidadCompra]?.trim();
    const proveedor = parts[colIndices.proveedor]?.trim();
    const codigoProductoONU = parts[colIndices.codigoProductoONU]?.trim();
    const cantidadItemStr = parts[colIndices.cantidadItem]?.trim();
    const precioUnitarioTotalStr = parts[colIndices.precioUnitarioTotal]?.trim();
    
    if (!institucion || !regionUnidadCompra || !proveedor || !codigoProductoONU || !cantidadItemStr || !precioUnitarioTotalStr) {
      skipped++;
      continue;
    }
    
    // Filter out associations and non-municipalities
    if (institucion.toUpperCase().includes('ASOCIACION')) {
      skipped++;
      continue;
    }
    
    const cantidadItem = parseInt(cantidadItemStr);
    const precioUnitarioTotal = parseFloat(precioUnitarioTotalStr);
    
    if (isNaN(cantidadItem) || isNaN(precioUnitarioTotal)) {
      skipped++;
      continue;
    }
    
    rows.push({
      institucion,
      regionUnidadCompra,
      proveedor,
      codigoProductoONU,
      cantidadItem,
      precioUnitarioTotal: Math.round(precioUnitarioTotal), // Convert to integer
    });
  }
  
  console.log(`✅ Parsed ${rows.length.toLocaleString()} valid rows (skipped ${skipped.toLocaleString()})\n`);
  return rows;
}

function processData(rows: CSVRow[]): ProcessedData {
  console.log('🔍 Extracting unique entities...');
  
  const regions = new Map<string, string>();
  const municipalities = new Map<string, { name: string; regionId: string; codComuna: number }>();
  const suppliers = new Set<string>();
  const missingRegions = new Set<string>();
  const missingCodComuna = new Set<string>();
  
  for (const row of rows) {
    // Process region - use local normalization function with case fix
    const normalizedRegionName = normalizeRegionNameLocal(normalizeRegionName(row.regionUnidadCompra));
    const regionId = REGION_ID_MAP[normalizedRegionName];
    
    if (regionId) {
      regions.set(normalizedRegionName, String(regionId));
    } else {
      missingRegions.add(row.regionUnidadCompra);
    }
    
    // Process municipality with cod_comuna lookup
    const normalizedMunicipalityName = normalizeMunicipalityName(row.institucion);
    const municipalityKey = `${normalizedMunicipalityName}|${regionId}`;
    const codComuna = MUNICIPALITY_COD_COMUNA_MAP.get(municipalityKey);
    
    if (regionId && codComuna && !municipalities.has(municipalityKey)) {
      municipalities.set(municipalityKey, {
        name: normalizedMunicipalityName,
        regionId: String(regionId),
        codComuna,
      });
    } else if (regionId && !codComuna) {
      missingCodComuna.add(`${row.institucion} (${regionId})`);
    }
    
    // Process supplier
    suppliers.add(row.proveedor);
  }
  
  console.log(`✅ Found:`);
  console.log(`   - ${regions.size} regions`);
  console.log(`   - ${municipalities.size} municipalities`);
  console.log(`   - ${suppliers.size} suppliers`);
  console.log(`   - ${rows.length.toLocaleString()} purchases`);
  
  if (missingRegions.size > 0) {
    console.warn(`\n⚠️  Warning: ${missingRegions.size} unknown regions found:`);
    Array.from(missingRegions).slice(0, 10).forEach(r => console.warn(`   - "${r}"`));
    if (missingRegions.size > 10) {
      console.warn(`   ... and ${missingRegions.size - 10} more`);
    }
  }
  
  if (missingCodComuna.size > 0) {
    console.warn(`\n⚠️  Warning: ${missingCodComuna.size} municipalities without cod_comuna mapping:`);
    Array.from(missingCodComuna).slice(0, 10).forEach(m => console.warn(`   - "${m}"`));
    if (missingCodComuna.size > 10) {
      console.warn(`   ... and ${missingCodComuna.size - 10} more`);
    }
  }
  
  console.log('');
  
  return {
    regions,
    municipalities,
    suppliers,
    purchases: rows,
  };
}

function generateRegionsSQL(regions: Map<string, string>): string {
  console.log('📝 Generating SQL for regions...');
  const entries = Array.from(regions.entries());
  const values = entries
    .map(([name, id]) => {
      const displayName = getRegionDisplayName(name);
      return `('${id}', '${escapeSqlString(displayName)}')`;
    })
    .join(',\n  ');
  
  return `INSERT OR IGNORE INTO regions (id, name) VALUES\n  ${values};\n\n`;
}

function generateMunicipalitiesSQL(municipalities: Map<string, { name: string; regionId: string; codComuna: number }>): string {
  console.log('📝 Generating SQL for municipalities...');
  const entries = Array.from(municipalities.values());
  const lines: string[] = [];
  
  const batchSize = 500;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const values = batch
      .map(m => `(${m.codComuna}, '${m.regionId}', '${escapeSqlString(m.name)}')`)
      .join(',\n  ');
    lines.push(`INSERT OR IGNORE INTO municipalities (id, region_id, name) VALUES\n  ${values};`);
  }
  
  return lines.join('\n\n') + '\n\n';
}

function generateSuppliersSQL(suppliers: Set<string>): string {
  console.log('📝 Generating SQL for suppliers...');
  const entries = Array.from(suppliers);
  const lines: string[] = [];
  
  const batchSize = 500;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const values = batch
      .map(name => `('${escapeSqlString(name)}')`)
      .join(',\n  ');
    lines.push(`INSERT OR IGNORE INTO suppliers (name) VALUES\n  ${values};`);
  }
  
  return lines.join('\n\n') + '\n\n';
}

function generatePurchasesSQL(purchases: CSVRow[], municipalities: Map<string, { name: string; regionId: string; codComuna: number }>): string {
  console.log('📝 Generating SQL for purchases...');
  console.log('ℹ️  Strategy: Generate temp tables with lookups, then batch insert');
  
  const lines: string[] = [];
  let skippedCount = 0;
  
  // Filter purchases that have valid municipalities and commodities
  const validPurchases = purchases.filter(p => {
    const normalizedMunicipalityName = normalizeMunicipalityName(p.institucion);
    const normalizedRegionName = normalizeRegionNameLocal(normalizeRegionName(p.regionUnidadCompra));
    const regionId = REGION_ID_MAP[normalizedRegionName];
    const municipalityKey = `${normalizedMunicipalityName}|${regionId}`;
    
    if (!municipalities.has(municipalityKey)) {
      skippedCount++;
      return false;
    }
    return true;
  });
  
  console.log(`   Processing ${validPurchases.length.toLocaleString()} valid purchases (${skippedCount.toLocaleString()} skipped due to missing municipalities)`);
  
  // Use simpler approach: batch inserts with cod_comuna directly
  const batchSize = 100; // Reduced from 500 for better performance with subqueries
  
  for (let i = 0; i < validPurchases.length; i += batchSize) {
    if (i % 10000 === 0 && i > 0) {
      console.log(`   Generated SQL for ${i.toLocaleString()} purchases...`);
    }
    
    const batch = validPurchases.slice(i, i + batchSize);
    const values = batch.map(p => {
      const normalizedMunicipalityName = normalizeMunicipalityName(p.institucion);
      const normalizedRegionName = normalizeRegionNameLocal(normalizeRegionName(p.regionUnidadCompra));
      const regionId = REGION_ID_MAP[normalizedRegionName];
      const municipalityKey = `${normalizedMunicipalityName}|${regionId}`;
      const municipality = municipalities.get(municipalityKey)!;
      
      // Use cod_comuna directly instead of looking up auto-increment ID
      return `(${municipality.codComuna},(SELECT id FROM suppliers WHERE name='${escapeSqlString(p.proveedor)}' LIMIT 1),'${p.codigoProductoONU}',${p.cantidadItem},${p.precioUnitarioTotal})`;
    }).join(',');
    
    lines.push(`INSERT OR IGNORE INTO purchases(municipality_id,supplier_id,commodity_id,amount,unit_price)VALUES${values};`);
  }
  
  console.log(`   Generated ${lines.length.toLocaleString()} SQL statements`);
  
  // Wrap with PRAGMA statements to allow inserts with missing commodity references
  const wrappedSQL = `PRAGMA foreign_keys=OFF;\n${lines.join('\n')}\nPRAGMA foreign_keys=ON;\n`;
  return wrappedSQL;
}

function main() {
  const isRemote = process.argv.includes('--remote');
  const environment = isRemote ? 'remote' : 'local';
  
  console.log(`🌱 Seeding Data tables to ${environment} database...\n`);

  // Read CSV file
  const csvPath = join(__dirname, '..', 'schemas', 'data', 'data_with_expensive_flag.csv');
  const rows = parseCsv(csvPath);

  // Extract unique data
  const data = processData(rows);

  // Generate SQL files separately for better debugging
  console.log('📝 Generating SQL files...\n');
  
  // 1. Regions
  const regionsSQL = generateRegionsSQL(data.regions);
  const regionsSqlPath = join(__dirname, 'seed-regions.sql');
  writeFileSync(regionsSqlPath, regionsSQL, 'utf-8');
  console.log(`✅ Regions SQL written to ${regionsSqlPath}`);
  
  // 2. Municipalities
  const municipalitiesSQL = generateMunicipalitiesSQL(data.municipalities);
  const municipalitiesSqlPath = join(__dirname, 'seed-municipalities.sql');
  writeFileSync(municipalitiesSqlPath, municipalitiesSQL, 'utf-8');
  console.log(`✅ Municipalities SQL written to ${municipalitiesSqlPath}`);
  
  // 3. Suppliers
  const suppliersSQL = generateSuppliersSQL(data.suppliers);
  const suppliersSqlPath = join(__dirname, 'seed-suppliers.sql');
  writeFileSync(suppliersSqlPath, suppliersSQL, 'utf-8');
  console.log(`✅ Suppliers SQL written to ${suppliersSqlPath}`);
  
  // 4. Purchases
  const purchasesSQL = generatePurchasesSQL(data.purchases, data.municipalities);
  const purchasesSqlPath = join(__dirname, 'seed-purchases.sql');
  writeFileSync(purchasesSqlPath, purchasesSQL, 'utf-8');
  console.log(`✅ Purchases SQL written to ${purchasesSqlPath}\n`);

  // Execute via Wrangler in order
  console.log(`🚀 Executing SQL via Wrangler (${environment})...\n`);
  const flag = isRemote ? '--remote' : '--local';
  
  try {
    // Execute in order: regions -> municipalities -> suppliers -> purchases
    const sqlFiles = [
      { name: 'regions', path: regionsSqlPath },
      { name: 'municipalities', path: municipalitiesSqlPath },
      { name: 'suppliers', path: suppliersSqlPath },
      { name: 'purchases', path: purchasesSqlPath },
    ];
    
    for (const { name, path } of sqlFiles) {
      console.log(`📊 Seeding ${name}...`);
      const command = `wrangler d1 execute DB ${flag} --file=${path}`;
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });
      
      console.log(`✅ ${name} seeded successfully\n`);
    }
    
    console.log(`\n🎉 Successfully seeded all Data tables to ${environment} database!`);
  } catch (error) {
    console.error(`\n❌ Error executing SQL:`, error);
    process.exit(1);
  }
}

main();
