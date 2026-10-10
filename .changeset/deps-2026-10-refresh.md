---
'@sdods/core': patch
'@sdods/mcp': patch
'@sdods/cli': patch
---

Playwright 1.64. The browser tools gain `browser_emulate_media` (color scheme, reduced motion,
forced colors, contrast, media type) and the new upstream arguments: `browser_find` `maxResults` and
`filename`, `browser_tabs` `isolatedContext`, `browser_start_video` `fps` and `cursor`, and `browser_video_show_actions`
`style`. Tag expressions use `@cucumber/tag-expressions` in place of the deprecated
`cucumber-tag-expressions`, so installs no longer print a deprecation warning. The CI image, the
installers and the Docker images pin Bun 1.4.3.
