import Image from "next/image";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/app/components/ui/navigation-menu"
import { Button } from "../ui/button";

export function Header() {
    return (
        <header className="flex flex-row justify-between items-center">
            <Link href="/" className="flex flex-row gap-3">
                <Image
                    src="/logo.svg"
                    alt="Transparenta Logo"
                    width={40}
                    height={40}
                    className="fill-foreground"
                />
                <h1 className="text-xl font-semibold">Vigil Chile</h1>
            </Link>

            <Button variant="ghost" size="lg">
                Metodología
            </Button>
            
            <Button>
                Apóyanos con un like
            </Button>
        </header>
    )
};