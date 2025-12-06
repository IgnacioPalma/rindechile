import Image from "next/image";
import Link from "next/link";
import { Mail, Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="px-8 py-8 tablet:py-10">
        <div className="flex flex-col gap-8 tablet:flex-row tablet:justify-between tablet:items-start">
          {/* Brand and description */}
          <div className="flex flex-col gap-3">
            <Link 
              href="/" 
              className="flex flex-row gap-2 tablet:gap-3 items-center w-fit transition-opacity duration-200 hover:opacity-80"
            >
              <Image
                src="/logo.svg"
                alt="Transparenta Logo"
                width={24}
                height={24}
                className="fill-foreground"
              />
              <span className="text-base tablet:text-lg font-semibold">RindeChile</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Plataforma dedicada a monitorear y promover la transparencia en las compras municipales en Chile.
            </p>
          </div>

          {/* Links section */}
          <div className="flex flex-col tablet:flex-row gap-8 tablet:gap-16">
            {/* Resources */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Recursos</h3>
              <nav className="flex flex-col gap-2">
                <a
                  href="https://www.mercadopublico.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Mercado Público
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href="https://www.chilecompra.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  ChileCompra
                  <ExternalLink className="size-3" />
                </a>
              </nav>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Contacto</h3>
              <nav className="flex flex-col gap-2">
                <a
                  href="mailto:hello@rindechile.cl"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <Mail className="size-4" />
                  <span>hello@rindechile.cl</span>
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col tablet:flex-row tablet:justify-between tablet:items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RindeChile. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Hecho con ♥️ en Chile
          </p>
        </div>
      </div>
    </footer>
  );
}
