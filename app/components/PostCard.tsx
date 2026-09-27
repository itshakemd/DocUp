import type { TPost } from "@/app/lib/types"
import Image from "next/image"
import Link from "next/link"
import config from "@/app/config.json"
import { hasPostBehavior } from "@/app/lib/post-behavior-tags"

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return ""
  }
}

export default function PostCard({ post, viewMode = "feed" }: { post: TPost, viewMode?: "feed" | "tile" }) {
  const date = post.date?.start_date || post.createdTime
  const isTile = viewMode === "tile"
  const isPinned = hasPostBehavior(post, "pin")

  return (
    <Link
      href={`/${post.slug}`}
      className={`group flex ${
        isTile
          ? "flex-col items-start gap-3 border border-border p-4 bg-surface/30"
          : "items-center justify-between gap-4 px-3 py-3"
      } rounded-lg transition-colors hover:bg-surface`}
    >
      {config.postImages && isTile && post.thumbnail && (
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-md border border-border/50">
          <Image
            src={post.thumbnail}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
      )}
      <div className="min-w-0 flex-1 w-full">
        <h2
          className={`text-[15px] font-medium text-foreground group-hover:text-accent ${
            isTile ? "line-clamp-2" : "truncate"
          }`}
        >
          {post.title}
        </h2>
        {post.summary && (
          <p
            className={`mt-0.5 text-[13px] text-muted ${
              isTile ? "line-clamp-2" : "truncate"
            }`}
          >
            {post.summary}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-faint">
          {isPinned && (
            <span className="inline-flex items-center gap-1" title="Pinned post">
              <svg
                aria-hidden="true"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                viewBox="0 0 24 24"
              >
                <path d="M12 17v5M5 17h14M7 3h10l-2 6 3 3v2H6v-2l3-3-2-6Z" />
              </svg>
              <span className="sr-only">Pinned</span>
            </span>
          )}
          <time>{formatDate(date)}</time>
        </div>
      </div>
      {config.postImages && !isTile && post.thumbnail && (
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
          <Image
            src={post.thumbnail}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </Link>
  )
}
