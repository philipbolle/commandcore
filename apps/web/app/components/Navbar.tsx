"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  navLinks: NavLink[];
  activeTab: string;
  handleNav: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ navLinks, activeTab, handleNav }) => {
  const { data: session, status } = useSession();

  return (
    <nav
      className="sticky top-0 z-50 bg-black bg-opacity-80 backdrop-blur flex items-center justify-between px-8 py-4 border-b border-gray-800 shadow-sm"
      aria-label="Main Navigation"
    >
      <div className="flex items-center gap-2 text-2xl font-bold" aria-label="CommandCore Home">
        <span className="text-3xl" aria-hidden="true">
          ⚡
        </span>{" "}
        CommandCore
      </div>
      <div className="hidden md:flex gap-6 text-lg items-center">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleNav(e, link.href)}
            className={`hover:text-blue-400 transition-colors cursor-pointer px-2 py-1 rounded ${
              activeTab === link.href ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white" : ""
            }`}
            aria-current={activeTab === link.href ? "page" : undefined}
            aria-label={link.label}
          >
            {link.label}
          </a>
        ))}
        <a
          href="/dashboard"
          className="hover:text-blue-400 transition-colors cursor-pointer px-2 py-1 rounded"
          aria-label="Dashboard"
        >
          Dashboard
        </a>
        {status === "loading" ? null : session ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            aria-label="Sign Out"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-colors"
            aria-label="Sign In"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 