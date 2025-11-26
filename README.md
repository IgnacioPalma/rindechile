# Transparenta Website

Interactive visualization platform for Chilean government procurement data. Explore public purchases across regions and municipalities with detailed insights into suppliers, commodities, and spending patterns.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Database Management](#database-management)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Project Structure](#project-structure)

## Features

- 🗺️ **Interactive Map**: Navigate Chile's 16 regions and 400+ municipalities
- 📊 **Procurement Data**: 620K+ purchases from 30K+ suppliers
- 🔍 **Advanced Filtering**: Filter by region, municipality, and UNSPSC categories
- 📈 **Data Insights**: Analyze spending patterns and supplier distribution
- 🎨 **Responsive Design**: Optimized for desktop and mobile experiences

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (serverless SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com) via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Data Visualization**: [D3.js](https://d3js.org) for map rendering
- **UI Components**: [Radix UI](https://www.radix-ui.com)

## Architecture Overview

### How It Works

Transparenta uses a **hybrid data architecture** optimizing for performance and real-time capabilities:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────┐       │
│  │   Map View       │         │   Treemap View      │       │
│  │  (Static JSON)   │         │   (Dynamic API)     │       │
│  └────────┬─────────┘         └──────────┬──────────┘       │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌─────────────────────────────────────────────┐            │
│  │          MapContext (State Management)       │            │
│  │  - Region/Municipality selection            │            │
│  │  - GeoJSON caching                          │            │
│  │  - Navigation state                         │            │
│  └─────────────────────────────────────────────┘            │
│           │                              │                   │
└───────────┼──────────────────────────────┼───────────────────┘
            │                              │
            ▼                              ▼
   ┌────────────────┐           ┌──────────────────┐
   │  Static Files  │           │   API Routes     │
   │  GeoJSON +     │           │  /api/treemap    │
   │  Pre-computed  │           │                  │
   │  Region Data   │           └────────┬─────────┘
   └────────────────┘                    │
                                         ▼
                              ┌─────────────────────┐
                              │  Cloudflare D1      │
                              │  (SQLite Database)  │
                              │  - Drizzle ORM      │
                              │  - 620K purchases   │
                              │  - Real-time queries│
                              └─────────────────────┘
```

### Key Architectural Patterns

#### 1. **MapContext State Management** (`app/contexts/MapContext.tsx`)

Centralized state container managing all map interactions:

- **State**: Selected region/municipality, loading states, error handling
- **Data Loading**: Fetches and caches GeoJSON, enriches with procurement data
- **Navigation**: Syncs selection with URL parameters via `lib/region-slugs.ts`
- **Custom Hooks**: Provides `useMapData()`, `useMapNavigation()` for component access

**Why?** Prevents prop drilling, enables global state coordination, optimizes re-renders.

#### 2. **Hybrid Data Strategy**

**Static JSON** (Regions & Municipalities):
- Pre-computed aggregations in `app/data/*.json`
- Client-side fetch, instant rendering
- Used for: Map visualization, quick navigation

**API Routes** (Treemap):
- Real-time D1 queries via `/api/treemap`
- Server-side aggregation with Drizzle ORM
- Used for: Hierarchical drill-downs, dynamic filtering

**Trade-off**: Static = fast initial load, API = flexible queries without rebuild.

#### 3. **URL-Based Navigation** (`lib/region-slugs.ts`)

SEO-friendly routing with bidirectional mapping:

```
Region Code → URL Slug
01 → arica-y-parinacota
13 → metropolitana-de-santiago
```

Integrated with Next.js App Router dynamic routes (`app/[region]/page.tsx`).

#### 4. **Custom Hooks Pattern**

Reusable logic abstraction in `app/lib/hooks/`:

- `useAsyncData<T>` - Generic async fetch with cleanup
- `useFormatters()` - Centralized i18n number formatting
- `useSeverityLevel()` - Business logic for color scales
- `useMapNavigation()` - Complex navigation state

**Best Practice**: Encapsulate side effects, enable composition, improve testability.

#### 5. **Performance Optimizations**

- **GeoJSON Caching**: Map-based in-memory cache prevents redundant fetches
- **ID Pre-resolution**: `seed-purchases-optimized.ts` resolves 623K IDs upfront
- **D3 Memoization**: Projection calculations cached per viewport
- **Responsive Hooks**: Debounced resize handlers prevent thrashing

### Data Flow Examples

**Region Selection Flow**:
```
User clicks region → MapContext updates state → URL updates via router.push() 
→ GeoJSON fetch (if not cached) → Data enrichment → D3 re-render
```

**Treemap Drill-Down**:
```
User clicks category → API request with level param → D1 aggregation query 
→ Drizzle ORM joins → JSON response → Chart update
```

## Database Schema

The database includes five main tables:

- **UNSPSC Taxonomy**: 70K+ commodities organized into segments, families, and classes
- **Regions**: 16 Chilean regions with proper accented display names
- **Municipalities**: 432 municipalities with geographic relationships
- **Suppliers**: 30K+ government suppliers
- **Purchases**: 620K+ procurement records with amounts and commodity classifications

**UNSPSC Standard**: United Nations Standard Products and Services Code - international classification system for procurement commodities. Critical for data normalization and cross-municipality comparisons.

## Getting Started

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm 9+** - Install via `npm install -g pnpm`
- **Cloudflare Account** - [Sign up free](https://dash.cloudflare.com/sign-up)
  - Required for D1 database (generous free tier: 100K reads/day, 5GB storage)
  - Required for deployment to Cloudflare Pages

### Environment Setup

#### 1. Create Cloudflare D1 Database

```bash
# Authenticate with Cloudflare (opens browser)
npx wrangler login

# Create D1 database
npx wrangler d1 create transparenta-db

# Copy the database_id from output - you'll need this next
```

The command outputs:
```
[[d1_databases]]
binding = "DB"
database_name = "transparenta-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← Copy this
```

#### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
```

Required variables (get from [Cloudflare Dashboard](https://dash.cloudflare.com/)):

- `CLOUDFLARE_ACCOUNT_ID` - Account ID (sidebar after selecting account)
- `CLOUDFLARE_DATABASE_ID` - D1 database ID from step 1
- `CLOUDFLARE_D1_TOKEN` - API token (create at Profile → API Tokens)
  - Template: "Edit Cloudflare Workers"
  - Permissions: Account.D1 Edit

#### 3. Update Wrangler Configuration

Edit `wrangler.toml` with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "transparenta-db"
database_id = "YOUR_DATABASE_ID_HERE"  # ← Paste from step 1
```

### Installation

```bash
# Install dependencies
pnpm install

# Generate municipality name mapping (required for data seeding)
pnpm generate:mapping
```

**What does `generate:mapping` do?**  
Creates `public/data/municipality_name_mapping.json` by normalizing municipality names from GeoJSON files. Handles 15+ prefix variations ("Ilustre Municipalidad de", "I. Municipalidad", etc.) and accent differences. Essential for matching GeoJSON features with database records.

### Local Development Setup

#### Option A: Local Database (Recommended for Development)

Uses Wrangler's local D1 emulator (SQLite file in `.wrangler/state/`):

```bash
# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

#### Option B: Remote Database (Production-like)

Connect to your Cloudflare D1 database:

```bash
# All seed commands support --remote flag
pnpm db:seed:remote
pnpm db:seed:data:remote
pnpm db:seed:purchases:remote

# Run dev server against remote DB
pnpm dev
```

**When to use remote?**
- Testing production environment
- Sharing database across team
- CI/CD pipelines

### Database Setup

#### 1. Seed UNSPSC Taxonomy

Populate the product classification hierarchy (segments, families, classes, commodities):

```bash
# Local database
pnpm db:seed

# Remote database
pnpm db:seed:remote
```

This seeds **70,332 commodities** organized into 5,288 classes, 461 families, and 57 segments from `schemas/data/clean_unspsc_data.csv`.

#### 2. Seed Data Tables

Populate regions, municipalities, and suppliers:

```bash
# Local database
pnpm db:seed:data

# Remote database
pnpm db:seed:data:remote
```

This seeds:
- **16 regions** with proper Spanish accents (e.g., "Región del Bío-Bío")
- **432 municipalities** with normalized names
- **30,638 suppliers** from procurement records

#### 3. Seed Purchases

Populate purchase records (requires previous steps completed):

```bash
# Local database
pnpm db:seed:purchases

# Remote database
pnpm db:seed:purchases:remote
```

This seeds **623,416 purchases** from `schemas/data/data_with_expensive_flag.csv` with validated foreign key relationships.

**Note**: The optimized script pre-resolves all IDs and skips ~78K purchases referencing non-existent UNSPSC commodity codes.

**Why the optimization?**  
Original approach: 623K INSERT queries each with 3 subqueries = 1.8M+ database hits.  
Optimized approach: Pre-fetch all IDs into Maps, validate before INSERT = ~625K queries total.  
Result: 10x faster seeding, prevents foreign key violations.

### Verify Setup

```bash
# Open Drizzle Studio to browse database
pnpm drizzle:dev
```

Navigate to [https://local.drizzle.studio](https://local.drizzle.studio) to verify:
- ✅ 70,332 commodities in `unspsc_commodities`
- ✅ 16 regions in `regions`
- ✅ 432 municipalities in `municipalities`
- ✅ 30,638 suppliers in `suppliers`
- ✅ 623,416 purchases in `purchases`

## Development Workflow

### Available Scripts

```bash
# Development
pnpm dev                    # Start Next.js dev server (localhost:3000)
pnpm build                  # Build for production
pnpm preview               # Preview production build locally
pnpm lint                  # Run ESLint

# Database Management
pnpm drizzle:dev           # Open Drizzle Studio (database GUI)
pnpm drizzle:generate      # Generate migrations from schema changes
pnpm drizzle:migrate       # Apply migrations to local database
pnpm drizzle:migrate:remote # Apply migrations to remote database

# Data Seeding (see Database Setup section)
pnpm db:seed               # Seed UNSPSC taxonomy (local)
pnpm db:seed:remote        # Seed UNSPSC taxonomy (remote)
pnpm db:seed:data          # Seed regions/municipalities/suppliers (local)
pnpm db:seed:data:remote   # Seed regions/municipalities/suppliers (remote)
pnpm db:seed:purchases     # Seed purchases (local)
pnpm db:seed:purchases:remote # Seed purchases (remote)

# Code Generation
pnpm generate:mapping      # Generate municipality name mapping (run after GeoJSON changes)
pnpm cf-typegen           # Generate Cloudflare Worker types from wrangler.toml

# Deployment
pnpm deploy               # Deploy to Cloudflare Pages
```

### Common Development Tasks

#### Making Schema Changes

```bash
# 1. Edit schemas/drizzle.ts
# 2. Generate migration files
pnpm drizzle:generate

# 3. Review generated SQL in schemas/migrations/
# 4. Apply to local database
pnpm drizzle:migrate

# 5. Test locally
pnpm dev

# 6. Apply to remote database
pnpm drizzle:migrate:remote
```

#### Adding New GeoJSON Data

```bash
# 1. Add/update files in public/data/
# 2. Regenerate municipality mapping
pnpm generate:mapping

# 3. Verify mapping in public/data/municipality_name_mapping.json
# 4. Test map rendering
pnpm dev
```

#### Updating Cloudflare Bindings

```bash
# 1. Edit wrangler.toml
# 2. Regenerate TypeScript types
pnpm cf-typegen

# 3. Check cloudflare-env.d.ts for updated types
# 4. Restart dev server
pnpm dev
```

## Database Management

### Drizzle Studio (Database GUI)

Visual database browser for D1:

```bash
pnpm drizzle:dev
```

Features:
- Browse all tables with pagination
- Run custom SQL queries
- Edit records inline
- View relationships
- Export data

**Local vs Remote**: Automatically connects to local D1 instance. For remote access, use Cloudflare dashboard or configure Drizzle with D1 HTTP API.

### Creating Migrations

When modifying database schema:

```bash
# Generates SQL migration based on schema diff
pnpm drizzle:generate
```

Creates timestamped migration file in `schemas/migrations/`. Review before applying.

### Common Migration Patterns

**Adding a column**:
```typescript
// schemas/drizzle.ts
export const purchases = sqliteTable('purchases', {
  // ... existing columns
  newColumn: text('new_column'),
});
```

**Adding an index** (performance):
```typescript
export const purchases = sqliteTable('purchases', {
  // ... columns
}, (table) => ({
  municipalityIdx: index('municipality_idx').on(table.municipality_id),
}));
```

See `schemas/migrations/add-treemap-indexes.sql` for production index examples.

## API Reference

### `/api/treemap` - Hierarchical Procurement Data

Returns aggregated purchase data for treemap visualization with drill-down support.

#### Request

```http
GET /api/treemap?level=country&regionId=13&municipalityId=101
```

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `level` | string | Yes | Aggregation level: `country`, `region`, or `municipality` |
| `regionId` | string | Conditional | Required when `level=region` or `level=municipality` |
| `municipalityId` | string | Conditional | Required when `level=municipality` |

#### Response

```typescript
{
  "level": "country" | "region" | "municipality",
  "data": {
    "name": string,              // Display name
    "children": [
      {
        "name": string,          // Region/Municipality/Category name
        "value": number,         // Total amount in CLP
        "id"?: string,           // Entity ID for drill-down
        "children"?: [...],      // Nested data (for municipality level)
      }
    ]
  }
}
```

#### Examples

**Country Level** (shows regions):
```bash
curl "http://localhost:3000/api/treemap?level=country"
```

Response:
```json
{
  "level": "country",
  "data": {
    "name": "Chile",
    "children": [
      {
        "name": "Región Metropolitana de Santiago",
        "value": 150000000,
        "id": "13"
      },
      // ... more regions
    ]
  }
}
```

**Region Level** (shows municipalities):
```bash
curl "http://localhost:3000/api/treemap?level=region&regionId=13"
```

**Municipality Level** (shows categories):
```bash
curl "http://localhost:3000/api/treemap?level=municipality&regionId=13&municipalityId=101"
```

Returns UNSPSC categories with purchase totals.

#### Error Responses

```json
// Missing required parameter
{
  "error": "Region ID is required for region level",
  "status": 400
}

// Invalid level
{
  "error": "Invalid level parameter",
  "status": 400
}

// Database error
{
  "error": "Failed to fetch treemap data",
  "details": "...",
  "status": 500
}
```

### Implementation Notes

- **Aggregation**: Server-side using Drizzle ORM `sum()` and `groupBy()`
- **Performance**: Indexed on `region_id`, `municipality_id`, `category_id`
- **Caching**: None currently - responses are real-time
- **Database**: Queries Cloudflare D1 via `env.DB` binding

## Troubleshooting

### Common Issues

#### 🔴 "Error: Cannot find module 'municipality_name_mapping.json'"

**Cause**: Municipality mapping not generated.

**Solution**:
```bash
pnpm generate:mapping
```

This creates `public/data/municipality_name_mapping.json` required for data seeding.

---

#### 🔴 Seeding fails with "FOREIGN KEY constraint failed"

**Cause**: Seeding order incorrect or previous steps incomplete.

**Solution**: Seed in correct order:
```bash
# 1. UNSPSC taxonomy first (provides commodity IDs)
pnpm db:seed

# 2. Data tables second (provides region/municipality/supplier IDs)
pnpm db:seed:data

# 3. Purchases last (references all above tables)
pnpm db:seed:purchases
```

**Verify**: Check Drizzle Studio for data in each table before proceeding.

---

#### 🔴 "~78K purchases skipped - non-existent UNSPSC codes"

**Cause**: Source data contains invalid commodity codes.

**Solution**: This is **expected behavior**. The optimized script validates IDs before insertion:

```
Total purchases in CSV: 703,181
Valid UNSPSC codes: 623,416
Skipped (invalid): 78,765
```

Check console output for validation summary. Invalid purchases are logged but not inserted.

---

#### 🔴 GeoJSON features don't match database municipalities

**Cause**: Name normalization mismatch between GeoJSON properties and database.

**Solution**: 

1. Check name mapping:
```bash
cat public/data/municipality_name_mapping.json | grep "PROBLEM_NAME"
```

2. Update normalization in `scripts/generate-municipality-mapping.ts`:
```typescript
// Add new prefix variations to PREFIXES array
const PREFIXES = [
  "ILUSTRE MUNICIPALIDAD DE",
  "I. MUNICIPALIDAD DE",
  // ... add your variation
];
```

3. Regenerate mapping:
```bash
pnpm generate:mapping
```

---

#### 🔴 "Error: No database binding found"

**Cause**: Cloudflare D1 binding not configured.

**Solution**:

1. Verify `wrangler.toml` has D1 binding:
```toml
[[d1_databases]]
binding = "DB"
database_id = "your-database-id"
```

2. Regenerate types:
```bash
pnpm cf-typegen
```

3. Restart dev server:
```bash
pnpm dev
```

---

#### 🔴 Wrangler authentication errors

**Cause**: Not logged into Cloudflare CLI.

**Solution**:
```bash
npx wrangler login
```

Follow browser prompt to authenticate.

**Alternative** (CI/CD):
```bash
export CLOUDFLARE_API_TOKEN=your_token
npx wrangler whoami
```

---

#### 🔴 Map not rendering or showing "Loading..."

**Cause**: GeoJSON fetch failure or data enrichment error.

**Solution**:

1. Check browser console for errors
2. Verify GeoJSON files exist:
```bash
ls -la public/data/chile_regions.json
ls -la public/data/municipalities_by_region/
```

3. Check network tab for 404s
4. Verify static data files:
```bash
ls -la app/data/data_regions.json
ls -la app/data/data_municipalities.json
```

5. Check MapContext error state in React DevTools

---

#### 🔴 Treemap shows "No data available"

**Cause**: API route error or empty database.

**Solution**:

1. Check purchases table:
```bash
pnpm drizzle:dev
# Browse purchases table
```

2. Test API directly:
```bash
curl "http://localhost:3000/api/treemap?level=country"
```

3. Check server logs in terminal running `pnpm dev`

4. Verify D1 binding in route:
```typescript
// app/api/treemap/route.ts should access env.DB
```

---

### Performance Issues

#### Slow initial page load

**Check**:
- GeoJSON file sizes (should be <500KB each)
- Network throttling in DevTools
- Static data imports (should be pre-loaded)

**Optimization**:
- GeoJSON already uses simplified geometries
- Consider adding service worker caching

#### Slow treemap rendering

**Check**:
- Database indexes (see `add-treemap-indexes.sql`)
- Query performance in Drizzle Studio

**Optimization**:
```sql
-- Verify indexes exist
SELECT name FROM sqlite_master WHERE type='index';
```

Should see: `municipality_idx`, `region_idx`, `category_idx`

## Deployment

## Contributing

### Code Conventions

#### TypeScript

- **Strict mode enabled** - all code must type-check
- **Explicit types** for function parameters and returns
- **Interface over Type** for object shapes
- **No `any`** - use `unknown` or proper types

Example:
```typescript
// ✅ Good
interface MapData {
  regions: GeoJSON.FeatureCollection;
  municipalities: Map<string, GeoJSON.FeatureCollection>;
}

async function loadMapData(): Promise<MapData> {
  // implementation
}

// ❌ Bad
function loadMapData(): any {
  // implementation
}
```

#### Component Organization

```
app/components/
├── map/              # Feature-specific components
│   ├── ChileMap.tsx
│   ├── hooks/        # Feature-specific hooks
│   └── filters/      # Feature-specific sub-components
├── navigation/       # Shared navigation components
└── ui/              # Generic reusable components (shadcn)
```

**Rules**:
- One component per file
- Co-locate related files (component + hooks + sub-components)
- Use `index.ts` for clean exports
- Client components: `"use client"` directive at top
- Server components: default (no directive)

#### Custom Hooks Pattern

Follow established patterns in `app/lib/hooks/`:

```typescript
// ✅ Follow this pattern
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    fetchFn()
      .then(result => !cancelled && setData(result))
      .catch(err => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    
    return () => { cancelled = true; };
  }, dependencies);

  return { data, loading, error };
}
```

**Key principles**:
- Cleanup on unmount (prevent memory leaks)
- Explicit dependency arrays
- Return object with named properties
- Generic types for reusability

#### File Naming

- **Components**: `PascalCase.tsx` (e.g., `ChileMap.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useMapData.ts`)
- **Utils**: `kebab-case.ts` (e.g., `data-service.ts`)
- **Types**: `kebab-case.ts` (e.g., `map.ts` in `types/`)
- **Constants**: `SCREAMING_SNAKE_CASE` variables

#### D3 Integration Pattern

When integrating D3 with React:

```typescript
// ✅ Correct pattern
export function ChileMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data) return;
    
    const svg = d3.select(svgRef.current);
    
    // D3 rendering logic
    svg.selectAll('path')
      .data(features)
      .join('path')
      .attr('d', pathGenerator);
    
    // Cleanup
    return () => {
      svg.selectAll('*').remove();
    };
  }, [data, dimensions]);
  
  return <svg ref={svgRef} />;
}
```

**Key principles**:
- Use `useRef` for SVG element
- D3 rendering in `useEffect`
- Cleanup on unmount
- React manages lifecycle, D3 manages rendering

#### Error Handling

```typescript
// ✅ User-friendly error messages
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw new Error('Unable to load map data. Please refresh and try again.');
}

// ✅ Component error states
if (error) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
```

#### Accessibility

- **Semantic HTML**: Use proper elements (`<nav>`, `<main>`, `<article>`)
- **ARIA labels**: For interactive SVG elements
- **Keyboard navigation**: Support ESC, Enter, arrow keys
- **Focus management**: Restore focus after modal close
- **Screen readers**: `aria-live` regions for dynamic updates

Example:
```typescript
<div
  role="button"
  tabIndex={0}
  aria-label={`View ${region.name} details`}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  {region.name}
</div>
```

### Making Your First Contribution

#### 1. Set Up Development Environment

Follow [Getting Started](#getting-started) to set up local environment and seed database.

#### 2. Find an Issue or Task

- Check existing issues (if any)
- Look for areas needing improvement
- Ask maintainers for guidance

#### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

#### 4. Make Changes

Example: Adding a new filter to the map

```bash
# 1. Create component
touch app/components/map/filters/NewFilter.tsx

# 2. Implement following conventions above
# 3. Export from index
echo "export { NewFilter } from './NewFilter';" >> app/components/map/filters/index.ts

# 4. Integrate into MapContainer
# 5. Test locally
pnpm dev

# 6. Lint
pnpm lint
```

#### 5. Test Thoroughly

- ✅ Visual testing in browser
- ✅ Test responsive breakpoints (mobile, tablet, desktop)
- ✅ Check browser console for errors
- ✅ Test keyboard navigation
- ✅ Verify accessibility with screen reader

#### 6. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add category filter to map view

- Add NewFilter component with dropdown
- Integrate with MapContext
- Add keyboard navigation support
- Update types for filter state"
```

**Commit message format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Adding tests

#### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create pull request on GitHub with:
- Clear description of changes
- Screenshots (for UI changes)
- Testing steps
- Related issues

### Code Review Checklist

Before submitting PR, verify:

- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] No console errors in browser
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Follows code conventions above
- [ ] Accessibility requirements met
- [ ] Comments explain complex logic
- [ ] No sensitive data committed (API keys, tokens)

### Project Architecture for Contributors

Understanding key files:

| File | Purpose | When to Edit |
|------|---------|--------------|
| `app/contexts/MapContext.tsx` | Global map state | Adding map features, filters |
| `app/lib/data-service.ts` | Data fetching/enrichment | Changing data loading logic |
| `lib/region-slugs.ts` | URL slug mapping | Adding new regions |
| `schemas/drizzle.ts` | Database schema | Adding tables/columns |
| `app/api/treemap/route.ts` | Treemap API endpoint | Changing aggregation logic |
| `wrangler.toml` | Cloudflare config | Adding bindings, env vars |

### Getting Help

- Check [Troubleshooting](#troubleshooting) first
- Review existing code for patterns
- Ask questions in issues or discussions
- Contact maintainers

## Project Structure

### Build & Preview

```bash
# Build for production
pnpm build

# Preview locally
pnpm preview
```

### Deploy to Cloudflare Pages

```bash
# Deploy to Cloudflare
pnpm deploy
```

The application uses [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) for seamless Next.js deployment on Cloudflare's edge network.

## Project Structure

```
app/
├── components/         # React components
│   ├── map/           # Map visualization components
│   ├── navigation/    # Header and navigation
│   └── ui/           # Reusable UI components
├── contexts/          # React contexts (MapContext)
├── data/             # Static data files (regions, municipalities)
├── lib/              # Utilities and data services
└── styles/           # Global styles

schemas/
├── drizzle.ts        # Database schema
└── data/            # CSV data sources

scripts/
├── seed-unspsc.ts              # Seed UNSPSC taxonomy
├── seed-data-tables.ts         # Seed regions/municipalities/suppliers
└── seed-purchases-optimized.ts # Seed purchases with ID pre-resolution

public/
└── data/
    ├── chile_regions.json              # GeoJSON for regions
    └── municipalities_by_region/       # GeoJSON for municipalities
```

## Data Sources

- **UNSPSC Taxonomy**: `schemas/data/clean_unspsc_data.csv` (71,502 rows)
- **Procurement Data**: `schemas/data/data_with_expensive_flag.csv` (703,181 rows)
- **Geographic Data**: GeoJSON files in `public/data/`

## Deployment

### Build & Preview

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

The build process:
1. Next.js generates optimized static pages and API routes
2. OpenNext adapter transforms for Cloudflare Workers compatibility
3. Output in `.vercel/output/` (despite name, works on Cloudflare)

### Deploy to Cloudflare Pages

#### First-Time Setup

1. **Link to Cloudflare Pages**:
```bash
npx wrangler pages project create transparenta-website
```

2. **Configure D1 binding** in Cloudflare dashboard:
   - Pages → transparenta-website → Settings → Functions
   - Add D1 binding: `DB` → Select your database

3. **Deploy**:
```bash
pnpm deploy
```

#### Subsequent Deployments

```bash
# Build and deploy in one command
pnpm deploy
```

Deploys to: `https://transparenta-website.pages.dev`

#### Custom Domain

1. Cloudflare dashboard → Pages → transparenta-website → Custom domains
2. Add domain (Cloudflare automatically handles DNS if domain on Cloudflare)
3. SSL certificate auto-provisioned

### Environment Variables (Production)

Set via Cloudflare dashboard:
- Pages → transparenta-website → Settings → Environment variables

Or via CLI:
```bash
npx wrangler pages secret put CLOUDFLARE_ACCOUNT_ID
# Paste value when prompted
```

### CI/CD

For automated deployments, use GitHub Actions with Wrangler:

```yaml
# .github/workflows/deploy.yml (example)
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy .vercel/output/static --project-name=transparenta-website
```

## Configuration

- `wrangler.toml` / `wrangler.jsonc`: Cloudflare Workers configuration
- `drizzle.config.ts`: Drizzle ORM configuration
- `next.config.ts`: Next.js configuration
- `open-next.config.ts`: OpenNext Cloudflare adapter config

## Additional Resources

### Documentation Links

- [Next.js App Router](https://nextjs.org/docs/app) - Framework documentation
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - Database platform
- [Drizzle ORM](https://orm.drizzle.team/docs/overview) - ORM documentation
- [D3.js](https://d3js.org/) - Data visualization library
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare) - Deployment adapter

### Community & Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Maintainers**: Contact project maintainers for contribution guidance

### Related Projects

- [UNSPSC](https://www.unspsc.org/) - Product classification standard
- [Chilean Government Procurement](https://www.mercadopublico.cl/) - Data source

## License

Private project

---

**Built with ❤️ for government transparency in Chile**
