"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="w-full bg-black">
      <div className="mx-auto w-full flex items-center justify-between px-4 py-3
        sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:container-2xl transition-all duration-300">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/Samplify_dark.png" alt="Logo" width={180} height={40} className="h-12 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-4 md:flex">
          <Button asChild variant="ghost" size="sm" className="bg-transparent hover:bg-gray-600 duration-300">
            <Link href="/" className="text-sm font-semibold text-white"> HOME </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="bg-transparent hover:bg-gray-600 duration-300">
            <Link href="/create" className="text-sm font-semibold text-samplify-blue"> CREATE </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="bg-transparent hover:bg-gray-600 duration-300">
            <Link href="/login" className="text-sm font-semibold text-white"> LOGIN </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("md:hidden", isMenuOpen ? "block" : "hidden")}>
        <div className="space-y-1 px-4 pb-3 pt-2 sm:px-3">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-900"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/create"
            className="block rounded-md px-3 py-2 text-base font-medium text-samplify-blue hover:bg-gray-900"
            onClick={() => setIsMenuOpen(false)}
          >
            Create
          </Link>
          <Link
            href="/login"
            className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-900"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}