"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "../ThemeToggle";
import SubscribeForm from "../SubscribeForm";
import { useSearch } from "@/app/(app)/context/SearchContext";

const NAV_LINKS = [
    { label: "Map", href: "/map" },
    { label: "Comparison", href: "/comparison" },
    { label: "Quiz", href: "/quiz" }, //Tap
];


export default function AppNav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { search, setSearch } = useSearch()

    return (
        <nav className="w-full border-b bg-white dark:bg-zinc-900 shadow-sm sticky top-0 z-40">
            <div className="mx-auto flex w-full max-w-6xl flex-col px-4 md:px-6">
                <div className="flex items-center gap-3 justify-between py-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Link href="/" className="flex items-center text-xl font-bold text-primary sm:text-2xl">
                            <span>Air</span>
                            <span className="text-black dark:text-white">Sense</span>
                        </Link>
                    </div>

                    {/* Desktop Search - Hidden on mobile */}
                    <div className="mx-6 hidden flex-1 md:flex">
                        <div className="relative w-full">
                            <Input
                                type="text"
                                placeholder="Search any location, city, state or country"
                                className="w-full rounded-full bg-zinc-100 pl-4 pr-10 text-sm shadow-sm transition focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-zinc-800"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-blue-600"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Menu - Hidden on mobile */}
                    <div className="hidden items-center space-x-6 text-sm md:flex">
                        <nav className="flex items-center gap-3">
                            {NAV_LINKS.map(({ label, href }) => (
                                <Link key={label} href={href} className="font-medium transition-colors hover:text-blue-600">
                                    {label}
                                </Link>
                            ))}
                        </nav>
                        <SubscribeForm>
                            <Button className="rounded-full bg-blue-600 px-5 text-white transition-all hover:scale-105 hover:bg-blue-700">
                                Get Notified
                            </Button>
                        </SubscribeForm>

                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Icons */}
                    <div className="flex items-center space-x-2 md:hidden">
                        <SubscribeForm>
                            <Button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-blue-600 px-5 text-white transition-all hover:scale-105 hover:bg-blue-700">
                                Get Notified
                            </Button>
                        </SubscribeForm>
                        <ThemeToggle />

                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation">
                                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[85vw] p-2 max-w-sm overflow-y-auto">
                                <div className="mt-6 flex flex-col gap-6">
                                    <nav className="flex flex-col gap-3">
                                        {NAV_LINKS.map(({ label, href }) => (
                                            <Link
                                                key={label}
                                                href={href}
                                                className="rounded-xl px-3 py-2 text-base font-medium transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-zinc-800/70"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {label}
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="pb-3 md:hidden">
                    <div className="relative w-full">
                        <Input
                            type="text"
                            placeholder="Search any location, city, state or country"
                            className="w-full rounded-full bg-zinc-100 pl-4 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-zinc-800"
                        />
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-blue-600"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
