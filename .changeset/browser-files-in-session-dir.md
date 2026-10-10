---
'@sdods/mcp': patch
---

Browser tools that save a file (`browser_snapshot`, `browser_take_screenshot`, `browser_pdf_save`,
`browser_console_messages`, `browser_network_requests`, `browser_network_request`,
`browser_evaluate`, `browser_start_video`, and `browser_find` from Playwright 1.64) now write only
into the session's output directory. A relative `filename` used to resolve against the repository
root, so a call could overwrite files in the working tree; it now resolves inside the output
directory, and a path outside it fails with `BROWSER_PATH_OUTSIDE`.
