<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Derive sitemap URLs from router staticData.sitemap decisions using src/lib/sitemap.ts; require a decision on every route and exclude private subtrees to prevent exposing inbox URLs.
- Use the sitemap server route as the only sitemap output; omit lastmod without authoritative page-specific content timestamps.
