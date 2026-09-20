# DocUp

DocUp is a lightweight personal blog and knowledge base built with Next.js, React, and Notion. It pulls public posts from a Notion database, renders them in a clean feed, supports searching and filtering by tags and categories, and includes a small AI assistant powered by OpenRouter.

## Features

- Notion-powered content source
- Searchable blog feed
- Tag filtering with `/`
- Category filtering with `#`
- Individual post pages with rich Notion block rendering
- Dark mode support
- AI chat assistant for filtering and content discovery

You can use this as either:

- a personal blog
- a notes site
- a public writing archive
- a starter project for a Notion + Next.js app

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Notion API
- OpenRouter API for chat

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```bash
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_or_data_source_id
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openrouter/auto
```

3. Start the development server:

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser.

## Environment Variables

### Required for content

- `NOTION_TOKEN`: your Notion integration token
- `NOTION_DATABASE_ID`: the database ID (or data source ID) used by the app

### Optional for AI chat

- `OPENROUTER_API_KEY`: enables the AI assistant in the UI
- `OPENROUTER_MODEL`: overrides the default model, defaults to `openrouter/auto`

## Configuration

UI behavior can be customized in [`app/config.json`](app/config.json):

| Option | Default | Description |
| --- | --- | --- |
| `siteTitle` | `DocUp` | Site title shown in the header and on the home page |
| `defaultView` | `tile` | Initial feed layout: `feed` or `tile` |
| `feedTileToggle` | `true` | Shows the control for switching between feed and tile layouts |
| `searchBar` | `true` | Enables the home page search and filtering input |
| `postCounter` | `true` | Shows the filtered post count |
| `postImages` | `true` | Shows post thumbnails when available |
| `aiToggle` | `false` | Shows the AI assistant when `true` and `OPENROUTER_API_KEY` is configured |
| `tagFilterChar` | `/` | Prefix used to filter posts by tag, for example `/nextjs` |
| `categoryFilterChar` | `#` | Prefix used to filter posts by category, for example `#essays` |

Example configuration:

```json
{
	"feedTileToggle": true,
	"aiToggle": false,
	"defaultView": "tile",
	"postCounter": true,
	"searchBar": true,
	"postImages": true,
	"siteTitle": "DocUp",
	"tagFilterChar": "/",
	"categoryFilterChar": "#"
}
```

## Notion Content Model

The app expects your Notion database to include properties that map to the fields used by the app:

- `Title` or `Name`: post title
- `Slug`: URL slug for the post
- `Summary`: short description shown on the feed/post page
- `Type`: optional post type
- `Status`: optional status; only `Public` entries are shown
- `Date`: optional publish date
- `Thumbnail`: optional cover image
- `Tags`: multi-select tags
- `Category`: select field for category

## Duplicateable Notion Template

You can duplicate this structure in Notion and use it as the content source for DocUp.

[Template](https://abounding-egg-df0.notion.site/92d55087f118837d9ede81fd9411268d?v=3a755087f11883ebae9e089d719762a5)

If you don't want to duplicate the template, you can still use your own Notion database as long as it has the same properties and naming.

### Example row

```text
Title: Why I switched to a custom blog
Slug: why-i-switched-to-a-custom-blog
Summary: Notes on shipping a minimal writing workflow with Notion.
Type: Post
Status: Public
Date: 2026-09-15
Thumbnail: optional cover image
Tags: [nextjs, writing]
Category: essays
```

### How to connect it

1. In Notion, create an internal integration or use an existing one.
2. Share the database with that integration.
3. Copy the database ID.
4. Put it in `NOTION_DATABASE_ID` in `.env`.

### Tips for using it successfully

- Keep `Slug` unique for each post.
- Use `Status = Public` only for posts you want visible in the feed.
- Use `Status = Private` or leave it blank for drafts, notes, or unpublished content.
- Use `Category` and `Tags` consistently so filtering feels useful.
- Put the content of each post in the page body; the app will render the Notion blocks automatically.
- Use `Thumbnail` for a hero image if you want one on the post page.

### Public vs Private posts

DocUp treats posts as public when `Status` is exactly `Public`.

- `Public`: appears in the homepage feed and can be opened directly
- `Private`: hidden from the feed and not shown publicly
- blank / unset: also hidden from the public feed

This makes it easy to keep draft posts, ideas, or private notes in the same Notion database without exposing them on the site.

## How the App Works

### Feed and filtering

The home page loads posts from Notion and renders them in a feed. The search input supports:

- plain text search across titles and summaries
- tag filtering using `/`, for example `/nextjs`
- category filtering using `#`, for example `#essays`

### Post pages

Each post has its own route at `/[slug]`, where the app fetches the page and renders the Notion block content.

### AI assistant

The assistant is available from the top bar. If `OPENROUTER_API_KEY` is missing, the app falls back to lightweight built-in guidance about using tags and categories instead of failing outright.
