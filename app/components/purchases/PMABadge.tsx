"use client";

type PMABadgeProps = {
  maxAcceptablePrice: number | null;
};

export function PMABadge({ maxAcceptablePrice }: PMABadgeProps) {
  if (maxAcceptablePrice === null) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
      PMA: {formatPrice(maxAcceptablePrice)}
    </div>
  );
}
