#!/usr/bin/env node
/**
 * Category definitions and segment-to-category mappings for UNSPSC hierarchy
 * Categories use simple integer IDs (1-10) to group UNSPSC segments
 */

export interface Category {
  id: number;
  name: string;
}

export const categories: Category[] = [
  { id: 1, name: "Raw Materials, Chemicals, Paper, Fuel" },
  { id: 2, name: "Industrial Equipment & Tools" },
  { id: 3, name: "Components & Supplies" },
  { id: 4, name: "Construction, Transportation & Facility Equipment & Supplies" },
  { id: 5, name: "Medical, Laboratory & Test Equipment & Supplies & Pharmaceuticals" },
  { id: 6, name: "Food, Cleaning & Service Industry Equipment & Supplies" },
  { id: 7, name: "Business, Communication & Technology Equipment & Supplies" },
  { id: 8, name: "Defense, Security & Safety Equipment & Supplies" },
  { id: 9, name: "Personal, Domestic & Consumer Equipment & Supplies" },
  { id: 10, name: "Services" },
];

/**
 * Maps UNSPSC segment codes to category IDs
 * Based on the standard UNSPSC hierarchy structure
 */
export const segmentToCategoryMap: Record<string, number> = {
  // Category 1: Raw Materials, Chemicals, Paper, Fuel
  "10000000": 1, // Live Plant and Animal Material and Accessories and Supplies
  "11000000": 1, // Mineral and Textile and Inedible Plant and Animal Materials
  "12000000": 1, // Chemicals including Bio Chemicals and Gas Materials
  "13000000": 1, // Resin and Rosin and Rubber and Foam and Film and Elastomeric Materials
  "14000000": 1, // Paper Materials and Products
  "15000000": 1, // Fuels and Fuel Additives and Lubricants and Anti corrosive Materials

  // Category 2: Industrial Equipment & Tools
  "20000000": 2, // Mining and Well Drilling Machinery and Accessories
  "21000000": 2, // Farming and Fishing and Forestry and Wildlife Machinery and Accessories
  "22000000": 2, // Building and Construction Machinery and Accessories
  "23000000": 2, // Industrial Manufacturing and Processing Machinery and Accessories
  "24000000": 2, // Material Handling and Conditioning and Storage Machinery and their Accessories and Supplies
  "25000000": 2, // Commercial and Military and Private Vehicles and their Accessories and Components
  "26000000": 2, // Power Generation and Distribution Machinery and Accessories
  "27000000": 2, // Tools and General Machinery

  // Category 3: Components & Supplies
  "30000000": 3, // Structures and Building and Construction and Manufacturing Components and Supplies
  "31000000": 3, // Manufacturing Components and Supplies
  "32000000": 3, // Electronic Components and Supplies
  "39000000": 3, // Electrical Systems and Lighting and Components and Accessories and Supplies

  // Category 4: Construction, Transportation & Facility Equipment & Supplies
  "40000000": 4, // Distribution and Conditioning Systems and Equipment and Components

  // Category 5: Medical, Laboratory & Test Equipment & Supplies & Pharmaceuticals
  "41000000": 5, // Laboratory and Measuring and Observing and Testing Equipment
  "42000000": 5, // Medical Equipment and Accessories and Supplies
  "51000000": 5, // Drugs and Pharmaceutical Products

  // Category 6: Food, Cleaning & Service Industry Equipment & Supplies
  "47000000": 6, // Cleaning Equipment and Supplies
  "48000000": 6, // Service Industry Machinery and Equipment and Supplies
  "50000000": 6, // Food Beverage and Tobacco Products

  // Category 7: Business, Communication & Technology Equipment & Supplies
  "43000000": 7, // Information Technology Broadcasting and Telecommunications
  "44000000": 7, // Office Equipment and Accessories and Supplies
  "45000000": 7, // Printing and Photographic and Audio and Visual Equipment and Supplies
  "55000000": 7, // Published Products

  // Category 8: Defense, Security & Safety Equipment & Supplies
  "46000000": 8, // Defense and Law Enforcement and Security and Safety Equipment and Supplies

  // Category 9: Personal, Domestic & Consumer Equipment & Supplies
  "49000000": 9, // Sports and Recreational Equipment and Supplies and Accessories
  "52000000": 9, // Domestic Appliances and Supplies and Consumer Electronic Products
  "53000000": 9, // Apparel and Luggage and Personal Care Products
  "54000000": 9, // Timepieces and Jewelry and Gemstone Products
  "56000000": 9, // Furniture and Furnishings
  "60000000": 9, // Musical Instruments and Games and Toys and Arts and Crafts and Educational Equipment and Materials and Accessories and Supplies

  // Category 10: Services
  "64000000": 10, // Financial Instruments
  "70000000": 10, // Farming and Fishing and Forestry and Wildlife Contracting Services
  "71000000": 10, // Mining and oil and gas services
  "72000000": 10, // Building and Facility Construction and Maintenance Services
  "73000000": 10, // Industrial Production and Manufacturing Services
  "76000000": 10, // Industrial Cleaning Services
  "77000000": 10, // Environmental Services
  "78000000": 10, // Transportation and Storage and Mail Services
  "80000000": 10, // Management and Business Professionals and Administrative Services
  "81000000": 10, // Engineering and Research and Technology Based Services
  "82000000": 10, // Editorial and Design and Graphic and Fine Art Services
  "83000000": 10, // Public Utilities and Public Sector Related Services
  "84000000": 10, // Financial and Insurance Services
  "85000000": 10, // Healthcare Services
  "86000000": 10, // Education and Training Services
  "90000000": 10, // Travel and Food and Lodging and Entertainment Services
  "91000000": 10, // Personal and Domestic Services
  "92000000": 10, // National Defense and Public Order and Security and Safety Services
  "93000000": 10, // Politics and Civic Affairs Services
  "94000000": 10, // Organizations and Clubs
  "95000000": 10, // Land and Buildings and Structures and Thoroughfares
};

/**
 * Get category ID for a given segment code
 */
export function getCategoryIdForSegment(segmentCode: string): number {
  const categoryId = segmentToCategoryMap[segmentCode];
  if (!categoryId) {
    throw new Error(`No category mapping found for segment: ${segmentCode}`);
  }
  return categoryId;
}
