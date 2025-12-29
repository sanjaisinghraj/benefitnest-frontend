"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <img
            src="/benifex/assets/images/logo.png"
            alt="Benifex"
            className="h-8"
          />
          <span className="text-sm text-gray-500">A Zellis Company</span>
        </Link>

        {/* Menu */}
        <nav className="flex items-center gap-8 text-sm font-medium relative">
          {/* Dropdown: Product */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("product")}
              className="hover:text-blue-600"
            >
              Product
            </button>
            {openMenu === "product" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <Link
                  href="/benefits"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Benefits
                </Link>
                <Link
                  href="/wallet"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Wallet
                </Link>
                <Link
                  href="/discounts"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Discounts
                </Link>
                <Link
                  href="/recognition"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Reward & Recognition
                </Link>
                <Link
                  href="/wellbeing"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Wellbeing
                </Link>
                <Link
                  href="/mobile"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Mobile
                </Link>
                <Link
                  href="/ai-benefits"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  AI-powered Benefits
                </Link>
              </div>
            )}
          </div>

          {/* Dropdown: Resources */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("resources")}
              className="hover:text-blue-600"
            >
              Resources
            </button>
            {openMenu === "resources" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <Link
                  href="/reports"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Reports
                </Link>
                <Link
                  href="/guides"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Guides
                </Link>
                <Link
                  href="/blogs"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Blogs
                </Link>
                <Link
                  href="/events"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Events
                </Link>
              </div>
            )}
          </div>

          {/* Dropdown: Careers */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("careers")}
              className="hover:text-blue-600"
            >
              Careers
            </button>
            {openMenu === "careers" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <Link
                  href="/careers"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Open Roles
                </Link>
                <Link
                  href="/culture"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Culture
                </Link>
              </div>
            )}
          </div>

          {/* Dropdown: Company */}
          <div className="relative">
            <button
              onClick={() => toggleMenu("company")}
              className="hover:text-blue-600"
            >
              Company
            </button>
            {openMenu === "company" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <Link
                  href="/about"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  About Us
                </Link>
                <Link
                  href="/team"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Leadership
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Contact
                </Link>
              </div>
            )}
          </div>

          {/* Search icon */}
          <button className="text-gray-500 hover:text-blue-600">🔍</button>

          {/* CTA Button */}
          <Link
            href="/book-demo"
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Book a Demo →
          </Link>
        </nav>
      </div>
    </header>
  );
}
