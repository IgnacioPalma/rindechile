import Image from "next/image";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/app/components/ui/navigation-menu"

export function Header() {
    return (
        <header className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-3">
                <Image
                    src="/logo.svg"
                    alt="Transparenta Logo"
                    width={40}
                    height={40}
                    className="fill-foreground"
                />
                <h1 className="text-xl font-semibold">Vigil Chile</h1>
            </div>

            <NavigationMenu>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link href="/docs">Docs</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenu>
            
            <h1 className="font-regular text-lg">
                Transparenta 2025
            </h1>
        </header>
    )
};