"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Archive,
  Plus,
  Menu,
  User,
  LogOut,
  Settings,
  Lightbulb,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  activeCount: number;
  archivedCount: number;
  showArchived: boolean;
  onToggleArchived: () => void;
  onNewIdea: () => void;
}

export function Header({
  activeCount,
  archivedCount,
  showArchived,
  onToggleArchived,
  onNewIdea,
}: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="border-b border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Lightbulb className="h-6 xl:h-8 w-6 xl:w-8 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
                  Ideatrium
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Brain Dump + Prioritizer
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white bg-opacity-50 dark:bg-slate-800 dark:bg-opacity-50 backdrop-blur-sm rounded-xl p-1 border border-white border-opacity-20 dark:border-slate-700 dark:border-opacity-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showArchived && onToggleArchived()}
                className={`gap-2 h-9 transition-all duration-200 ${
                  !showArchived
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                    : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Lightbulb size={20} className="h-4 w-4" />
                Active
                <Badge
                  variant="secondary"
                  className={`ml-1 ${
                    !showArchived
                      ? "bg-white bg-opacity-20 text-white border-0"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {activeCount}
                </Badge>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => !showArchived && onToggleArchived()}
                className={`gap-2 h-9 transition-all duration-200 ${
                  showArchived
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                    : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Archive className="h-4 w-4" />
                Archived
                <Badge
                  variant="secondary"
                  className={`ml-1 ${
                    showArchived
                      ? "bg-white bg-opacity-20 text-white border-0"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {archivedCount}
                </Badge>
              </Button>
            </div>

            <div className="h-6 w-px bg-border opacity-50" />

            <ThemeToggle />

            <div className="h-6 w-px bg-border opacity-50" />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white bg-opacity-50 dark:bg-transparent backdrop-blur-sm border-white border-opacity-20 hover:bg-white hover:bg-opacity-70 transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user?.user_metadata?.display_name?.split(" ")[0] ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white bg-opacity-95 dark:bg-slate-900 dark:bg-opacity-95 backdrop-blur-xl border-white border-opacity-20 dark:border-slate-700 dark:border-opacity-50"
              >
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Signed in as
                </div>
                <div className="px-2 py-1.5 text-sm font-medium truncate">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-border opacity-50" />

            <Button
              onClick={onNewIdea}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              New Idea
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />

            {/* New Idea Button - Always visible on mobile */}
            <Button
              onClick={onNewIdea}
              size="sm"
              className="gap-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">New</span>
            </Button>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white bg-opacity-95 dark:bg-slate-900 dark:bg-opacity-95 backdrop-blur-xl border-white border-opacity-20 dark:border-slate-700 dark:border-opacity-50"
              >
                <DropdownMenuItem
                  onClick={() => !showArchived && onToggleArchived()}
                  className={`gap-2 ${
                    !showArchived
                      ? "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20"
                      : ""
                  }`}
                >
                  <Image
                    src="/logo.svg"
                    alt="Active Ideas"
                    width={16}
                    height={16}
                  />
                  <span className="flex-1">Active Ideas</span>
                  <Badge variant="secondary" className="text-xs">
                    {activeCount}
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => showArchived && onToggleArchived()}
                  className={`gap-2 ${
                    showArchived
                      ? "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20"
                      : ""
                  }`}
                >
                  <Archive className="h-4 w-4" />
                  <span className="flex-1">Archived Ideas</span>
                  <Badge variant="secondary" className="text-xs">
                    {archivedCount}
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onNewIdea} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Idea
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
