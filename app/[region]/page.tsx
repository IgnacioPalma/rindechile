import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCodeFromSlug, getRegionNameFromCode, REGION_SLUGS } from '@/lib/region-slugs';
import MapContainerSuspense from '../components/map/MapContainerSuspense';

interface RegionPageProps {
  params: Promise<{
    region: string;
  }>;
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { region: slug } = await params;
  const regionCode = getCodeFromSlug(slug);
  
  if (!regionCode) {
    return {
      title: 'Región no encontrada - Transparenta',
      description: 'La región solicitada no existe.',
    };
  }
  
  const regionName = getRegionNameFromCode(regionCode);
  
  return {
    title: `${regionName} - Transparenta`,
    description: `Explora datos de transparencia y sobreprecios en compras públicas para ${regionName}.`,
  };
}

export async function generateStaticParams() {
  return REGION_SLUGS.map((region) => ({
    region: region.slug,
  }));
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region: slug } = await params;
  const regionCode = getCodeFromSlug(slug);
  
  // Redirect to home if invalid slug
  if (!regionCode) {
    redirect('/');
  }
  
  return (
    <main className="w-full h-screen">
      <MapContainerSuspense initialRegionCode={regionCode} />
    </main>
  );
}
