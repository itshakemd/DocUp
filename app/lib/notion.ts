import { Client } from "@notionhq/client"
import type { TPost, TPostType, TPostStatus } from "./types"
import { splitPostTags } from "./post-behavior-tags"

function getTextProperty(prop: any): string {
  if (!prop) return ""
  const type = prop.type
  if (type === "title") {
    return (prop.title || []).map((t: any) => t.plain_text).join("")
  }
  if (type === "rich_text") {
    return (prop.rich_text || []).map((t: any) => t.plain_text).join("")
  }
  return ""
}

function getFirstTextProperty(props: Record<string, any>): string {
  for (const key of ["Name", "Title", "name", "title"]) {
    if (props[key]) {
      const value = getTextProperty(props[key])
      if (value) return value
    }
  }
  const titleProp = Object.values(props).find((p: any) => p?.type === "title")
  if (titleProp) return getTextProperty(titleProp)
  return ""
}

function getMultiSelectProperty(prop: any): string[] | undefined {
  if (!prop || prop.type !== "multi_select") return undefined
  return (prop.multi_select || [])
    .map((s: any) => s.name)
    .filter(Boolean)
}

function getSelectProperty(prop: any): string | undefined {
  if (!prop || prop.type !== "select" || !prop.select) return undefined
  return prop.select.name
}

function getDateProperty(
  prop: any
): { start_date: string } | undefined {
  if (!prop || prop.type !== "date" || !prop.date) return undefined
  return prop.date.start ? { start_date: prop.date.start } : undefined
}

function getFileProperty(prop: any): string | undefined {
  if (!prop || prop.type !== "files" || !prop.files?.length) return undefined
  const file = prop.files[0]
  if (file.type === "external" && file.external?.url) return file.external.url
  if (file.type === "file" && file.file?.url) return file.file.url
  return undefined
}

let _notion: Client | undefined

function getClient(): Client | undefined {
  const token =
    process.env.NOTION_TOKEN || process.env.NEXT_PUBLIC_NOTION_TOKEN
  if (!token) return undefined
  if (!_notion) _notion = new Client({ auth: token })
  return _notion
}

let _dataSourceId: string | undefined

async function getDataSourceId(): Promise<string | undefined> {
  const databaseId =
    process.env.NOTION_DATABASE_ID || process.env.NEXT_PUBLIC_NOTION_PAGE_ID
  if (!databaseId) return undefined
  if (_dataSourceId) return _dataSourceId
  const notion = getClient()
  if (!notion) return undefined
  _dataSourceId = await resolveDataSource(notion, databaseId)
  return _dataSourceId
}

async function resolveDataSource(
  notion: Client,
  id: string
): Promise<string | undefined> {
  try {
    await notion.dataSources.retrieve({ data_source_id: id })
    return id
  } catch {
    // fall through to database lookup
  }
  try {
    const db: any = await notion.databases.retrieve({ database_id: id })
    const dataSourceId = db?.data_sources?.[0]?.id
    if (dataSourceId) return dataSourceId
  } catch (e) {
    console.error("Notion database retrieval failed:", (e as any).message)
  }
  return undefined
}

export async function getPosts(): Promise<TPost[]> {
  const notion = getClient()
  const dataSourceId = await getDataSourceId()
  if (!notion || !dataSourceId) {
    console.error("NOTION_DATABASE_ID (or NOTION_TOKEN) is not set")
    return []
  }

  let allResults: any[] = []
  let cursor: string | undefined

  try {
    do {
      const response: any = await notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: cursor,
        page_size: 100,
        result_type: "page",
      })
      allResults = allResults.concat(response.results)
      cursor = response.has_more ? response.next_cursor : undefined
    } while (cursor)
  } catch (e) {
    console.error("Failed to fetch Notion data source:", e)
    return []
  }

  const posts: TPost[] = allResults.map((page: any) => {
    const props = page.properties || {}
    const date = getDateProperty(props.date) || getDateProperty(props.Date)
    const { contentTags, behaviorTags } = splitPostTags(
      getMultiSelectProperty(props.tags || props.Tags)
    )
    return {
      id: page.id,
      title: getFirstTextProperty(props),
      slug: getTextProperty(props.slug || props.Slug),
      summary: getTextProperty(props.summary || props.Summary),
      type: getSelectProperty(props.type || props.Type) as TPostType | undefined,
      status: getSelectProperty(props.status || props.Status) as TPostStatus | undefined,
      date,
      thumbnail: getFileProperty(props.thumbnail || props.Thumbnail),
      tags: contentTags,
      behaviorTags,
      category: getSelectProperty(props.category || props.Category),
      createdTime: page.created_time,
    }
  })

  return posts
    .filter((post) => {
      if (!post.title || !post.slug) return false
      if (post.status && post.status !== "Public") return false
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.date?.start_date || a.createdTime).getTime()
      const dateB = new Date(b.date?.start_date || b.createdTime).getTime()
      return dateB - dateA
    })
}

async function fetchPageBlockChildren(
  notion: Client,
  blockId: string,
  depth: number
): Promise<any[]> {
  if (depth > 5) return []
  const blocks: any[] = []
  try {
    let cursor: string | undefined
    do {
      const res: any = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
        page_size: 100,
      })
      for (const b of res.results || []) {
        const block: any = { ...b }
        if (b.has_children) {
          block.children = await fetchPageBlockChildren(
            notion,
            b.id,
            depth + 1
          )
        }
        blocks.push(block)
      }
      cursor = res.has_more ? res.next_cursor : undefined
    } while (cursor)
  } catch (e) {
    console.error("Failed to fetch blocks for", blockId, (e as any).message)
  }
  return blocks
}

export async function getPostBlocks(pageId: string): Promise<any[]> {
  const notion = getClient()
  if (!notion) return []
  return fetchPageBlockChildren(notion, pageId, 0)
}

export async function getPostBySlug(slug: string) {
  const posts = await getPosts()
  const post = posts.find((p) => p.slug === slug)
  if (!post) return null
  const blocks = await getPostBlocks(post.id)
  return { post, blocks }
}
