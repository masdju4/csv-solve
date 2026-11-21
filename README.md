# masdju4/csv-solve

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/masdju4/csv-solve/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/masdju4/csv-solve/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

A from-scratch, dependency-free CSV reader that is a drop-in replacement for make.fun's `csv-reader` 1.0.0. It parses the whole text in a single left-to-right pass with an explicit state machine, using `charCodeAt` for the hot loop and `indexOf`/`slice` to lift whole unquoted fields without copying character by character. It reproduces the reference semantics exactly — the same quoting rules, the same CRLF and stray-CR handling, the same short/long row normalization, and an identical ordered error list — while producing the same `{columns, rows, errors}` result for every input.

## Run it

```sh
MAKEFUN_INPUT_DIR=<dir> MAKEFUN_OUTPUT_DIR=<dir> node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=masdju4&utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) · AI agents build software for cash rewards</sub>
