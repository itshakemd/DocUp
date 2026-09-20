"use client"

import { useState, useMemo } from "react"
import type { TPost } from "@/app/lib/types"
import PostCard from "./PostCard"
import config from "@/app/config.json"

function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

export default function Feed({ posts }: { posts: TPost[] }) {
  const [query, setQuery] = useState("")
  const [viewMode, setViewMode] = useState<"feed" | "tile">(
    (config.defaultView as "feed" | "tile") || "feed"
  )

  const trimmed = query.trim()
  const first = trimmed.charAt(0)

  const mode: "tag" | "category" | null =
    first === "/" ? "tag" : first === "#" ? "category" : null

  const isTagMode = mode === "tag"
  const isCategoryMode = mode === "category"

  const term = mode ? trimmed.slice(1).toLowerCase() : ""
  const hasQuery = trimmed.length > 0
  const hasFilter = mode !== null

  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((post) =>
      (post.tags || []).forEach((tag) => set.add(tag))
    )
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [posts])

  const allCategories = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((post) => {
      if (post.category) set.add(post.category)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [posts])

  const suggestions = useMemo(() => {
    if (!hasFilter) return []
    const source = isTagMode ? allTags : allCategories
    if (!term) return source
    return source.filter((item) =>
      item.toLowerCase().includes(term)
    )
  }, [hasFilter, isTagMode, allTags, allCategories, term])

  const filteredPosts = useMemo(() => {
    if (!hasQuery) return posts

    if (isTagMode) {
      if (!term) return posts
      return posts.filter((post) =>
        (post.tags || []).some((tag) =>
          tag.toLowerCase().includes(term)
        )
      )
    }

    if (isCategoryMode) {
      if (!term) return posts
      return posts.filter((post) =>
        (post.category || "").toLowerCase().includes(term)
      )
    }

    const q = trimmed.toLowerCase()
    return posts.filter((post) => {
      const title = post.title?.toLowerCase() || ""
      const summary = post.summary?.toLowerCase() || ""
      return title.includes(q) || summary.includes(q)
    })
  }, [posts, hasQuery, isTagMode, isCategoryMode, term, trimmed])

  const count = filteredPosts.length
  const total = posts.length

  const applySuggestion = (value: string) => {
    setQuery(`${isTagMode ? "/" : "#"}${value}`)
  }

  return (
    <div className="w-full pt-16">
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          DocUp
        </h1>
      </section>

      {config.searchBar && (
        <div className="relative mb-4">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isTagMode
                ? "Filter by tag…"
                : isCategoryMode
                ? "Filter by category…"
                : "Search"
            }
            className="w-full rounded-lg border border-border bg-surface py-[7px] pl-9 pr-12 text-[15px] text-foreground placeholder-faint transition-colors focus:border-accent focus:bg-background focus:outline-none"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 gap-1">
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-faint">
              {hasFilter ? (isTagMode ? "/" : "#") : "Search"}
            </kbd>
          </div>
        </div>
      )}

      {hasFilter && (
        <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-border bg-surface p-3">
          {suggestions.length === 0 ? (
            <p className="text-[13px] text-faint">
              No {isTagMode ? "tags" : "categories"} match &quot;{term}
              &quot;
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => applySuggestion(item)}
                  className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[13px] text-muted transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        {config.postCounter ? (
          <p className="text-[13px] text-faint">
            {pluralize(count, "post")} of {pluralize(total, "post")}
          </p>
        ) : (
          <div /> // Placeholder to keep flex-between spacing
        )}
        {config.feedTileToggle && (
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setViewMode("feed")}
              className={`flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === "feed"
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-faint hover:text-foreground"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setViewMode("tile")}
              className={`flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                viewMode === "tile"
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-faint hover:text-foreground"
              }`}
            >
              Tile
            </button>
          </div>
        )}
      </div>

      {count === 0 ? (
        <p className="py-24 text-center text-[15px] text-muted">
          No posts found.
        </p>
      ) : (
        <div
          className={
            viewMode === "feed"
              ? "flex flex-col"
              : "columns-1 gap-4 sm:columns-2"
          }
        >
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={viewMode === "tile" ? "mb-4 break-inside-avoid" : ""}
            >
              <PostCard post={post} viewMode={viewMode} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
