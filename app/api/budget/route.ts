import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { municipalities, regions } from '@/schemas/drizzle';
import { eq, sum, sql } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const code = searchParams.get('code');

    if (!level || !['country', 'region', 'municipality'].includes(level)) {
      return NextResponse.json(
        { success: false, error: 'Invalid level parameter' },
        { status: 400 }
      );
    }

    if (level === 'country') {
      // Sum all municipality budgets for country-level
      const result = await db
        .select({
          total_budget: sum(municipalities.budget),
        })
        .from(municipalities);

      const totalBudget = result[0]?.total_budget ? Number(result[0].total_budget) : null;

      return NextResponse.json({
        success: true,
        data: {
          budget: totalBudget,
        },
      });
    }

    if (level === 'region') {
      if (!code) {
        return NextResponse.json(
          { success: false, error: 'Region code is required' },
          { status: 400 }
        );
      }

      const regionId = parseInt(code, 10);
      if (isNaN(regionId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid region code' },
          { status: 400 }
        );
      }

      // Sum all municipality budgets in the region
      const result = await db
        .select({
          total_budget: sum(municipalities.budget),
        })
        .from(municipalities)
        .where(eq(municipalities.region_id, regionId));

      const totalBudget = result[0]?.total_budget ? Number(result[0].total_budget) : null;

      return NextResponse.json({
        success: true,
        data: {
          budget: totalBudget,
        },
      });
    }

    if (level === 'municipality') {
      if (!code) {
        return NextResponse.json(
          { success: false, error: 'Municipality code is required' },
          { status: 400 }
        );
      }

      const municipalityId = parseInt(code, 10);
      if (isNaN(municipalityId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid municipality code' },
          { status: 400 }
        );
      }

      // Get municipality budget
      const result = await db
        .select({
          budget: municipalities.budget,
          budget_per_capita: municipalities.budget_per_capita,
        })
        .from(municipalities)
        .where(eq(municipalities.id, municipalityId))
        .limit(1);

      if (!result.length) {
        return NextResponse.json(
          { success: false, error: 'Municipality not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          budget: result[0].budget,
          budget_per_capita: result[0].budget_per_capita,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
