#!/usr/bin/env node
/**
 * Optimized purchases seeding that pre-resolves IDs from the database
 * This avoids slow subqueries in INSERT statements
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { normalizeMunicipalityName, normalizeRegionName, getRegionDisplayName } from '../app/lib/name-normalizer';

// Region name to ID mapping (1-16)
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

function normalizeRegionNameLocal(regionName: string): string {
  if (!regionName) return '';
  let normalized = regionName.replace(/^Región\s+/i, 'Region ');
  if (normalized === 'Region de Los Rios') {
    return 'Region de los Rios';
  }
  return normalized;
}

interface CSVRow {
  institucion: string;
  regionUnidadCompra: string;
  proveedor: string;
  codigoProductoONU: string;
  cantidadItem: number;
  precioUnitarioTotal: number;
}

interface PurchaseRecord {
  municipalityId: number;
  supplierId: number;
  commodityId: string;
  amount: number;
  unitPrice: number;
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
  console.log('📖 Reading CSV file...');
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  console.log(`✅ File loaded with ${lines.length.toLocaleString()} lines`);
  
  const headerParts = parseCsvLine(lines[0]);
  const colIndices = {
    institucion: headerParts.indexOf('Institucion'),
    regionUnidadCompra: headerParts.indexOf('RegionUnidadCompra'),
    proveedor: headerParts.indexOf('Proveedor'),
    codigoProductoONU: headerParts.indexOf('CodigoProductoONU'),
    cantidadItem: headerParts.indexOf('CantidadItem'),
    precioUnitarioTotal: headerParts.indexOf('Precio_Unitario_TOTAL'),
  };
  
  const rows: CSVRow[] = [];
  let skipped = 0;
  
  for (let i = 1; i < lines.length; i++) {
    if (i % 50000 === 0) {
      console.log(`  Processing row ${i.toLocaleString()}...`);
    }
    
    const parts = parseCsvLine(lines[i]);
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
      precioUnitarioTotal: Math.round(precioUnitarioTotal),
    });
  }
  
  console.log(`✅ Parsed ${rows.length.toLocaleString()} valid rows (skipped ${skipped.toLocaleString()})\n`);
  return rows;
}

function fetchMunicipalityIds(isRemote: boolean): Map<string, number> {
  console.log('🔍 Fetching municipality IDs from database...');
  const flag = isRemote ? '--remote' : '--local';
  const outputFile = join(__dirname, 'temp-municipalities.json');
  const command = `wrangler d1 execute DB ${flag} --command "SELECT id, name, region_id FROM municipalities" --json > ${outputFile}`;
  
  execSync(command, { 
    cwd: join(__dirname, '..'),
    shell: '/bin/bash'
  });
  
  const output = readFileSync(outputFile, 'utf-8');
  const data = JSON.parse(output);
  
  const municipalityIds = new Map<string, number>();
  
  if (data && data[0] && data[0].results) {
    for (const row of data[0].results) {
      const key = `${row.name}|${row.region_id}`;
      municipalityIds.set(key, row.id);
    }
  }
  
  console.log(`✅ Loaded ${municipalityIds.size} municipality IDs\n`);
  return municipalityIds;
}

function fetchSupplierIds(isRemote: boolean): Map<string, number> {
  console.log('🔍 Fetching supplier IDs from database...');
  const flag = isRemote ? '--remote' : '--local';
  const outputFile = join(__dirname, 'temp-suppliers.json');
  const command = `wrangler d1 execute DB ${flag} --command "SELECT id, name FROM suppliers" --json > ${outputFile}`;
  
  execSync(command, { 
    cwd: join(__dirname, '..'),
    shell: '/bin/bash'
  });
  
  const output = readFileSync(outputFile, 'utf-8');
  const data = JSON.parse(output);
  
  const supplierIds = new Map<string, number>();
  
  if (data && data[0] && data[0].results) {
    for (const row of data[0].results) {
      supplierIds.set(row.name, row.id);
    }
  }
  
  console.log(`✅ Loaded ${supplierIds.size} supplier IDs\n`);
  return supplierIds;
}

function fetchCommodityIds(isRemote: boolean): Set<string> {
  console.log('🔍 Fetching commodity IDs from database...');
  const flag = isRemote ? '--remote' : '--local';
  const outputFile = join(__dirname, 'temp-commodities.json');
  const command = `wrangler d1 execute DB ${flag} --command "SELECT id FROM commodities" --json > ${outputFile}`;
  
  execSync(command, { 
    cwd: join(__dirname, '..'),
    shell: '/bin/bash'
  });
  
  const output = readFileSync(outputFile, 'utf-8');
  const data = JSON.parse(output);
  
  const commodityIds = new Set<string>();
  
  if (data && data[0] && data[0].results) {
    for (const row of data[0].results) {
      commodityIds.add(row.id);
    }
  }
  
  console.log(`✅ Loaded ${commodityIds.size} commodity IDs\n`);
  return commodityIds;
}

function resolvePurchases(
  csvRows: CSVRow[],
  municipalityIds: Map<string, number>,
  supplierIds: Map<string, number>,
  commodityIds: Set<string>
): PurchaseRecord[] {
  console.log('🔗 Resolving foreign key relationships...');
  
  const purchases: PurchaseRecord[] = [];
  let skipped = 0;
  let missingCommodities = 0;
  
  for (let i = 0; i < csvRows.length; i++) {
    if (i % 50000 === 0 && i > 0) {
      console.log(`  Resolved ${i.toLocaleString()} purchases...`);
    }
    
    const row = csvRows[i];
    const normalizedMunicipalityName = normalizeMunicipalityName(row.institucion);
    const normalizedRegionName = normalizeRegionNameLocal(normalizeRegionName(row.regionUnidadCompra));
    const regionId = REGION_ID_MAP[normalizedRegionName];
    
    if (!regionId) {
      skipped++;
      continue;
    }
    
    const municipalityKey = `${normalizedMunicipalityName}|${regionId}`;
    const municipalityId = municipalityIds.get(municipalityKey);
    const supplierId = supplierIds.get(row.proveedor);
    
    if (!municipalityId || !supplierId) {
      skipped++;
      continue;
    }
    
    // Check if commodity exists
    if (!commodityIds.has(row.codigoProductoONU)) {
      missingCommodities++;
      continue;
    }
    
    purchases.push({
      municipalityId,
      supplierId,
      commodityId: row.codigoProductoONU,
      amount: row.cantidadItem,
      unitPrice: row.precioUnitarioTotal,
    });
  }
  
  console.log(`✅ Resolved ${purchases.length.toLocaleString()} purchases`);
  console.log(`   Skipped: ${skipped.toLocaleString()} (missing municipality/supplier)`);
  console.log(`   Skipped: ${missingCommodities.toLocaleString()} (missing commodity)\n`);
  return purchases;
}

function generatePurchasesSQL(purchases: PurchaseRecord[]): string {
  console.log('📝 Generating optimized SQL for purchases...');
  
  const lines: string[] = [];
  const batchSize = 500;
  
  for (let i = 0; i < purchases.length; i += batchSize) {
    if (i % 10000 === 0 && i > 0) {
      console.log(`  Generated SQL for ${i.toLocaleString()} purchases...`);
    }
    
    const batch = purchases.slice(i, i + batchSize);
    const values = batch.map(p => 
      `(${p.municipalityId}, ${p.supplierId}, '${p.commodityId}', ${p.amount}, ${p.unitPrice})`
    ).join(',\n  ');
    
    lines.push(`INSERT OR IGNORE INTO purchases (municipality_id, supplier_id, commodity_id, amount, unit_price) VALUES\n  ${values};`);
  }
  
  return lines.join('\n\n') + '\n\n';
}

interface TreemapNode {
  id: string;
  name: string;
  value: number;
  overpricingRate: number;
  children?: TreemapNode[];
  type: 'segment' | 'family' | 'class';
}

interface TreemapHierarchy {
  name: string;
  children: TreemapNode[];
}

function computeCountryTreemap(purchases: PurchaseRecord[], commodityIds: Set<string>, isRemote: boolean): void {
  console.log('\n📊 Computing country-level treemap data...');
  
  // Fetch UNSPSC hierarchy from database
  // Write query to file to avoid ENOBUFS error with large results
  const hierarchyQuery = `
    SELECT 
      s.id as segment_id,
      s.name as segment_name,
      f.id as family_id,
      f.name as family_name,
      c.id as class_id,
      c.name as class_name,
      com.id as commodity_id
    FROM segments s
    JOIN families f ON f.segment_id = s.id
    JOIN classes c ON c.family_id = f.id
    JOIN commodities com ON com.class_id = c.id
  `;
  
  const queryFile = join(__dirname, 'temp-hierarchy-query.sql');
  const outputFile = join(__dirname, 'temp-hierarchy-output.json');
  
  writeFileSync(queryFile, hierarchyQuery, 'utf-8');
  
  const flag = isRemote ? '--remote' : '--local';
  
  let hierarchyResults: any[] = [];
  
  try {
    // Execute query and save output to file
    const command = `wrangler d1 execute DB ${flag} --json --file=${queryFile}`;
    const output = execSync(command, { 
      cwd: join(__dirname, '..'),
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer
    }).toString();
    
    writeFileSync(outputFile, output, 'utf-8');
    
    // Read results from file
    const hierarchyData = JSON.parse(output);
    hierarchyResults = hierarchyData[0]?.results || [];
    
    console.log(`✅ Loaded ${hierarchyResults.length.toLocaleString()} commodity hierarchy mappings from database`);
    
    // Clean up temp files
    execSync(`rm -f ${queryFile} ${outputFile}`, { cwd: join(__dirname, '..') });
  } catch (error) {
    // Clean up temp files on error
    execSync(`rm -f ${queryFile} ${outputFile}`, { cwd: join(__dirname, '..') });
    throw error;
  }
  
  // Build commodity to hierarchy mapping
  const commodityHierarchy = new Map<string, {
    segmentId: string;
    segmentName: string;
    familyId: string;
    familyName: string;
    classId: string;
    className: string;
  }>();
  
  for (const row of hierarchyResults) {
    commodityHierarchy.set(row.commodity_id, {
      segmentId: row.segment_id,
      segmentName: row.segment_name,
      familyId: row.family_id,
      familyName: row.family_name,
      classId: row.class_id,
      className: row.class_name,
    });
  }
  
  // Aggregate purchases by segment only (simplified)
  const segmentAggregates = new Map<string, {
    segmentName: string;
    totalValue: number;
  }>();
  
  for (const purchase of purchases) {
    const hierarchy = commodityHierarchy.get(purchase.commodityId);
    if (!hierarchy) continue;
    
    const purchaseValue = purchase.amount * purchase.unitPrice;
    
    if (!segmentAggregates.has(hierarchy.segmentId)) {
      segmentAggregates.set(hierarchy.segmentId, {
        segmentName: hierarchy.segmentName,
        totalValue: 0,
      });
    }
    
    const aggregate = segmentAggregates.get(hierarchy.segmentId)!;
    aggregate.totalValue += purchaseValue;
  }
  
  console.log(`✅ Aggregated into ${segmentAggregates.size.toLocaleString()} segments`);
  
  // Build treemap hierarchy (simple segment list)
  const segments: TreemapNode[] = [];
  
  for (const [segmentId, aggregate] of segmentAggregates) {
    segments.push({
      id: segmentId,
      name: aggregate.segmentName,
      value: aggregate.totalValue,
      overpricingRate: 0, // Not used for spending visualization
      type: 'segment',
    });
  }
  
  const treemapData: TreemapHierarchy = {
    name: 'Chile',
    children: segments,
  };
  
  // Write to file
  const outputPath = join(__dirname, '..', 'app', 'data', 'treemap_country.json');
  writeFileSync(outputPath, JSON.stringify(treemapData, null, 2), 'utf-8');
  console.log(`✅ Country treemap data written to ${outputPath}`);
}

function main() {
  const isRemote = process.argv.includes('--remote');
  const environment = isRemote ? 'remote' : 'local';
  
  console.log(`🌱 Seeding purchases table to ${environment} database (optimized)...\n`);

  // Read CSV
  const csvPath = join(__dirname, '..', 'schemas', 'data', 'data_with_expensive_flag.csv');
  const csvRows = parseCsv(csvPath);

  // Fetch IDs from database
  const municipalityIds = fetchMunicipalityIds(isRemote);
  const supplierIds = fetchSupplierIds(isRemote);
  const commodityIds = fetchCommodityIds(isRemote);

  // Resolve purchases with actual IDs
  const purchases = resolvePurchases(csvRows, municipalityIds, supplierIds, commodityIds);

  // Generate SQL
  const sql = generatePurchasesSQL(purchases);
  
  const sqlPath = join(__dirname, 'seed-purchases-optimized.sql');
  writeFileSync(sqlPath, sql, 'utf-8');
  console.log(`✅ SQL written to ${sqlPath}\n`);

  // Execute via Wrangler
  console.log(`🚀 Executing SQL via Wrangler (${environment})...\n`);
  const flag = isRemote ? '--remote' : '--local';
  
  try {
    const command = `wrangler d1 execute DB ${flag} --file=${sqlPath}`;
    execSync(command, { 
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    });
    
    console.log(`\n✅ Successfully seeded purchases to ${environment} database!`);
    
    // Compute country treemap data after seeding
    computeCountryTreemap(purchases, commodityIds, isRemote);
    
  } catch (error) {
    console.error(`\n❌ Error executing SQL:`, error);
    process.exit(1);
  }
}

main();
