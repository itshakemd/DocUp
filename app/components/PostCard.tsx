import type { TPost } from "@/app/lib/types"
import Image from "next/image"
import Link from "next/link"
import config from "@/app/config.json"

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
        <time className="mt-1 block text-[12px] text-faint">
          {formatDate(date)}
        </time>
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