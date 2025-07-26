"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChartHorizontal, Camera, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/realtime", label: "Real-time", icon: Camera },
  { href: "/statistics", label: "Statistics", icon: BarChartHorizontal },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col items-center gap-4 px-2 py-4">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </nav>
  )
}
