import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="px-4 py-6 tablet:px-8 tablet:py-8">
        <div className="flex flex-col gap-6 tablet:flex-row tablet:justify-between tablet:items-center">
          {/* Brand and description */}
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold">RindeChile</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Plataforma dedicada a monitorear y promover la transparencia en las compras municipales en Chile.
            </p>
          </div>

          {/* Links and social */}
          <div className="flex flex-col gap-4 tablet:items-end">
            <div className="hidden flex flex-wrap gap-4 text-sm">
              <Link
                href="/metodologia"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Metodología
              </Link>
            </div>

            {/* Contact email */}
            <a
              href="mailto:hello@rindechile.cl"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="size-4" />
              <span>hello@rindechile.cl</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center tablet:text-left">
            © {new Date().getFullYear()} RindeChile. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
