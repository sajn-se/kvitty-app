"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserCookie, type UserCookie } from "@/lib/user-cookie";

const navItems = [
  { label: "Funktioner", href: "#funktioner" },
  { label: "Priser", href: "#priser" },
  { label: "Om oss", href: "#om-oss" },
];

export function Header() {
  const [user, setUser] = useState<UserCookie | null | undefined>(undefined);

  useEffect(() => {
    setUser(getUserCookie());
  }, []);

  const isLoading = user === undefined;
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg px-5 sm:px-[5%]">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-semibold text-lg tracking-tight">
            Kvitty
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Auth Button */}
          <div className="flex items-center gap-3">
            <Button asChild className="group">
              {isLoading ? (
                <span className="w-24">
                  <span className="invisible">Logga in</span>
                </span>
              ) : isLoggedIn ? (
                <Link href={`/${user.slug}`} className="flex items-center gap-1.5">
                  Gå till appen
                  <span className="relative overflow-hidden size-3.5">
                    <MoveUpRight className="absolute size-3.5 transition-transform duration-300 group-hover:translate-x-full group-hover:-translate-y-full" />
                    <MoveUpRight className="absolute size-3.5 -translate-x-full translate-y-full transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
                  </span>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center">
                  Logga in
                  <span className="relative overflow-hidden size-4 ml-1">
                    <MoveUpRight className="absolute size-4 transition-transform duration-300 group-hover:translate-x-full group-hover:-translate-y-full" />
                    <MoveUpRight className="absolute size-4 -translate-x-full translate-y-full transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
                  </span>
                </Link>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
