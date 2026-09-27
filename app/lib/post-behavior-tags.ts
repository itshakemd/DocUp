import type { TPost } from "./types"

/**
 * Tags in this registry configure post behavior and are not content tags.
 * Add future behavior tags here so parsing, filtering, and UI stay consistent.
 */
export const POST_BEHAVIOR_TAGS = {
  pin: { feedPriority: 100 },
} as const

export type TPostBehaviorTag = keyof typeof POST_BEHAVIOR_TAGS

const behaviorTagNames = new Set<string>(Object.keys(POST_BEHAVIOR_TAGS))

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase()
}

export function splitPostTags(tags: string[] = []): {
  contentTags: string[]
  behaviorTags: TPostBehaviorTag[]
} {
  const contentTags: string[] = []
  const behaviorTags = new Set<TPostBehaviorTag>()

  tags.forEach((tag) => {
    const normalizedTag = normalizeTag(tag)
    if (behaviorTagNames.has(normalizedTag)) {
      behaviorTags.add(normalizedTag as TPostBehaviorTag)
    } else {
      contentTags.push(tag)
    }
  })

  return { contentTags, behaviorTags: Array.from(behaviorTags) }
}

export function hasPostBehavior(
  post: Pick<TPost, "behaviorTags">,
  behavior: TPostBehaviorTag
): boolean {
  return post.behaviorTags?.includes(behavior) ?? false
}

/** Higher-priority behaviors sort before lower-priority and normal posts. */
export function comparePostBehaviorPriority(
  a: Pick<TPost, "behaviorTags">,
  b: Pick<TPost, "behaviorTags">
): number {
  const priorityFor = (post: Pick<TPost, "behaviorTags">) =>
    (post.behaviorTags ?? []).reduce(
      (priority, behavior) =>
        Math.max(priority, POST_BEHAVIOR_TAGS[behavior].feedPriority),
      0
    )

  return priorityFor(b) - priorityFor(a)
}
