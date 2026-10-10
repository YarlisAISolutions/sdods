---
'@sdods/cli': minor
'@sdods/core': minor
---

`sdods run` has its own console output. Each scenario is one line, `[n/total] ✔ Feature › Scenario
[ui · chromium] (1.2s)`, in place of the runner's generated spec paths and hook lines. Failures
show the feature file, the error (without generated-spec code or browser launch logs), the failure
screenshot, the video and `sdods trace <zip>`. `run --list` lists scenarios by title. New `--open
always|on-failure|never` (or `SDODS_OPEN`) opens the SDODS dashboard after a run; by default only
on failure at an interactive terminal, never in CI or under a coding agent. The web UI puts the
SDODS dashboard first and labels the HTML report and trace viewer as Playwright's.
