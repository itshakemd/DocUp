import type { TPostBehaviorTag } from "./post-behavior-tags"

export type TPostStatus = "Private" | "Public"
export type TPostType = "Post"

export type TPost = {
  id: string
  date?: { start_date: string }
  type?: TPostType
  slug: string
  summary?: string
  title: string
  status?: TPostStatus
  createdTime: string
  thumbnail?: string
  tags?: string[]
  behaviorTags?: TPostBehaviorTag[]
  category?: string
}
