# Contributing to BlitzHash Free Launch Kit

Thanks for helping keep this list accurate. The kit is deliberately short: it's for founders building with AI tools (Lovable, Bolt, Replit, Cursor, v0) who need to know what a free tier gives them and where it stops.

## What belongs here

- A real, ongoing free tier or a free open-source tool (not a 14-day trial, not "contact sales").
- Useful to someone launching a web or mobile app built with AI tools.
- Its limits are published on an official vendor page you can link.

## Entry format

Entries live in [`data/kit.json`](data/kit.json). The README list is generated from it, so **edit the JSON, not the README list**.

```json
{
  "category": "email",
  "name": "Example Mail (Free)",
  "url": "https://example.com",
  "pricing": "https://example.com/pricing",
  "free": "3,000 emails per month, 100 per day, 1 domain.",
  "hitsFirst": "100 emails per day: a launch-day signup spike stops sending."
}
```

| Field | Rule |
|---|---|
| `category` | One of the `id`s in `categories` (builders, hosting, database, auth, email, storage, monitoring, security, ai, analytics, jobs, extras). |
| `name` | Product name, plus the plan name in brackets if the vendor has several. |
| `url` | Product homepage, `https://`. |
| `pricing` | **Required.** The vendor's official pricing, limits or terms page where the numbers can be seen. Not a blog post, review site or another list. |
| `sources` | Optional extra official URLs (e.g. terms of service) that back a claim. |
| `free` | What you get at $0, with the numbers as the vendor states them. One or two sentences. |
| `hitsFirst` | The limit or term that usually ends the free ride first when an app gets real users. Be specific. |

## Writing rules

1. **Never invent or estimate numbers.** Copy the number from the official page. If the page doesn't publish one, describe the limit without a number (for example "limited agent requests").
2. **Write your own words.** Don't paste text from other lists (including free-for-dev) or vendor marketing copy.
3. **Be neutral.** No affiliate links, no superlatives, no promises about uptime or results.
4. **Avoid absolute words.** Say exactly what the vendor caps or does not meter, rather than claiming there is no limit at all.
5. **Keep it short.** Each field should fit on two lines in a terminal.

## Before you open a PR

```bash
npm run build   # regenerates the README list from data/kit.json
npm test        # schema, banned-wording, README-in-sync and CLI tests
```

In the PR description, include the pricing URL and the date you checked it. A maintainer re-checks the page before merging.

## Reporting a changed limit

Vendors change free tiers often. If an entry is out of date, open an issue with the entry name, the official pricing URL and what the page says now.
