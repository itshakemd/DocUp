import Link from "next/link"
import ThemeToggle from "./ThemeToggle"
import AIChat from "./AIChat"
import config from "@/app/config.json"

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-11 w-full max-w-3xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="shrink-0 text-[14px] font-semibold text-foreground transition-colors hover:text-muted"
        >
          {config.siteTitle}
        </Link>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {config.aiToggle && <AIChat />}
        </div>
      </div>
    </header>
  )
}