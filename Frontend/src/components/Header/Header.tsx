"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import RuoutotHeader from "./RuoutotHeader";
import MobileNav from "./MobileNav";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Do not render storefront consumer header on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="w-full">
      <RuoutotHeader onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
