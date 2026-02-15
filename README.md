# Slug Prefixer

A DatoCMS plugin that displays dynamic prefixes on slug fields, resolved from static values and live GraphQL queries against your content.

## Features

- **Dynamic prefixes** — Define prefix patterns like `{{BLOG_SLUG}}/` that resolve using your DatoCMS content
- **GraphQL queries** — Use dot-notation paths (e.g. `siteSettingsModel.blogPage.slug`) that are automatically converted to Content Delivery API queries
- **Global config** — Define static key-value pairs available across all slug fields
- **Per-field config** — Each slug field gets its own prefix pattern and query configuration
- **Live preview** — See the resolved prefix while editing the field configuration
- **Standard slug behavior** — Auto-generates from the title field, slugifies on blur, and offers a regenerate button when the title changes

The prefix is display-only and is not stored in the slug field value, keeping your slugs clean and compatible with DatoCMS validation.

## Installation

Install the plugin from the [DatoCMS Marketplace](https://www.datocms.com/marketplace/plugins) or search for "Slug Prefixer" in your project's plugin settings.

## Configuration

### 1. Plugin settings

After installing, open the plugin settings and provide:

- **Read-only API Key** — A DatoCMS Content Delivery API token (found under Settings > API tokens)
- **Global Configuration** (optional) — A JSON object of static values available to all slug fields:

```json
{
  "BASE_URL": "https://example.com"
}
```

### 2. Field settings

Assign the "Slug Prefixer" editor to any slug field, then configure:

- **Prefix Pattern** — A string with `{{KEY}}` tokens that resolve to values from the global config or queries. Example: `{{BLOG_SLUG}}/`
- **Query Config** (optional) — A JSON object mapping keys to dot-notation DatoCMS query paths:

```json
{
  "BLOG_SLUG": "siteSettingsModel.blogPage.slug"
}
```

Each dot-notation path is converted to a GraphQL query against the Content Delivery API. Multiple paths are batched into a single request.

### How it works

1. Global config values and query results are merged into a single lookup
2. `{{KEY}}` tokens in the prefix pattern are replaced with matching values
3. The resolved prefix is displayed before the slug input (not stored in the field value)

For example, if your site settings model has a blog page with slug `blog`, and you configure:

- Prefix pattern: `{{BLOG_SLUG}}/`
- Query config: `{"BLOG_SLUG": "siteSettingsModel.blogPage.slug"}`

The editor will display: **blog/** before the slug input.
