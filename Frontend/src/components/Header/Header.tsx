"use client";

import React, { useState } from "react";
import RuoutotHeader from "./RuoutotHeader";
import MobileNav from "./MobileNav";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
