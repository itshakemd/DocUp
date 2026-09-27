/**
 * Tags in this registry configure post behavior and are not content tags.
 * Add future behavior tags here so parsing, filtering, and UI stay consistent.
 */
export const POST_BEHAVIOR_TAGS = {
  pin: { feedPriority: 100 },
} as const

export type TPostBehaviorTag = keyof typeof POST_BEHAVIOR_TAGS
