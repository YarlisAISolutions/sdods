---
'@sdods/cli': patch
'@sdods/core': patch
'@sdods/integrations': patch
---

`sdods run` no longer ends with the runner's "To open last HTML report run: npx playwright
show-report" hint. It prints the SDODS command to open the results instead, and `sdods trace --run
<id>` after a failure. Every runner and generator invocation (`run`, `watch`, `lint`, `steps list`,
`record`, `auth capture`, `trace`, `show-report`, `report merge`, `browsers install`) now resolves
the workspace's own package instead of a bare `npx`, which could prompt to download a package or
fetch an unrelated one. `watch`, `record` and `auth capture` check for missing browsers up front
and name `sdods browsers install`; `doctor --fix` and `init` install browsers through the same
path. GitHub failure issues name `sdods trace <zip>`. `show-report` accepts `--last`. `sdods
--help` credits Playwright and playwright-bdd.
