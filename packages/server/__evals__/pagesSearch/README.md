# Pages search eval

A reproducible ranking eval for Pages search. It seeds a fixed set of invented pages for a dedicated user, runs labeled queries through the real `search` resolver as that user, and scores the ranking. Use it to prove that a search change helps.

## Run it

Postgres and the text embeddings service from `docker/stacks/development` must be up. Valkey isn't needed: the only Redis caller on the search path is mocked. The dev web stack does not need to run.

The active embedding model's `EmbeddingsPages_*` table must exist. Only the embedder creates it, at startup, so on a fresh database start the dev embedder once first (for example, with `pnpm dev`).

From `packages/server`:

```bash
pnpm eval:pagesSearch
```

The first run seeds the corpus and embeds every page, which is slow on a laptop, and can time out on one large page; see the validity rule below. Later runs reuse the pages.

Reseed with `EVAL_RESEED=1` after you change how pages are indexed (`embedPage`, the chunker, the serializer, the embedding model or its pooling), and after you switch to a branch that differs there. A run reuses the pages it finds, so without a reseed it scores the old index. Only runs scored against the same index are comparable. Run one eval at a time: every checkout on the shared dev database uses the same eval user's corpus.

| Variable | Default | Meaning |
| --- | --- | --- |
| `EVAL_SET` | `dev` | `dev` reads `queries.json`, `holdout` reads `holdoutQueries.json` |
| `EVAL_MODES` | `fused` | Comma-separated `fused` and/or `quick`. `quick` sends `alpha: 0` |
| `EVAL_LABEL` | `local` | Names the results file |
| `EVAL_RESEED` | unset | `1` deletes the eval user's pages and seeds them again |

Each run writes `results/<label>-<set>-<mode>.json` (gitignored) and prints one row per category plus an overall row.

Compare two runs of the same set and mode. It prints `n`, the number of queries in each row, answerable or not, then `b - a` for every metric, overall and per category. It exits with an error when the set or mode differs, and warns when the two `unindexed` lists differ, because the runs were then scored against different indexes:

```bash
node __evals__/pagesSearch/compare.mjs \
  __evals__/pagesSearch/results/baseline-dev-fused.json \
  __evals__/pagesSearch/results/local-dev-fused.json
```

## How it works

- **Corpus.** The user `eval|pagesSearch` owns every fixture page, privately. Seeding only creates and deletes that user's own rows, so results don't depend on the rest of your dev data.
- **Indexing.** On every run, each page that has no embeddings is embedded in-process with the real `embedPage`, one at a time. When `embedPage` fails for a page, its partial rows are deleted, so the next run tries that page again. A run that you kill while it is embedding a page can leave partial rows behind, so reseed after that. A fixture that still has no embeddings afterwards is listed under `unindexed` in the results. That happens when `embedPage` refuses the page (for example, at the language gate), when the page has nothing to chunk because it is only a title, or when the embeddings service fails or times out on one of the page's chunks. Only the first two are deterministic. A page that failed for the third reason is retried on the next run.
- **Queries.** The real resolver runs with the job queue replaced: the query is embedded by the same model call `embedQuery` makes. A failed search is recorded as zero results plus an `error`, and counted in `errors`; `Error calling search` means the embeddings service did not answer, and a result list that holds the same page twice is also an error. The run writes its results and then fails: results recorded with errors are not a valid baseline, so run it again.
- **Validity.** A run is a valid baseline only when `errors` is 0 and `unindexed` lists exactly `meeting-notes-ja`, `stub-customer-interviews`, `stub-hiring-plan` and `stub-offsite-agenda`. Any other `unindexed` list means the run scored a different index, so run it again. On a slow or throttled host, for example a laptop on battery, `retro-q3-product` can time out while it is embedded. The symptom is five unindexed fixtures and a dev overall nDCG@10 of about 0.48 instead of 0.532. Plug in and run again; the next run retries that page.
- **Isolation.** `jest.eval.config.js` has no global setup, so a run never truncates tables or changes triggers. The metric unit tests in `__tests__/` run with the normal server suite.

## Fixtures

`fixtures/*.md` is Markdown and `fixtures/*.json` is a TipTap doc. The fixture key is the file name without its extension. Titles come from the first block and must be unique. `fixtures/updatedAt.json` maps a fixture key to an ISO date for `Page.updatedAt`. Every fixture has its own timestamp, so a ranking that breaks ties by most recent update has a deterministic order; a fixture without one gets the time it was seeded. Meeting summaries use the date in their title at 17:00 UTC, five minutes apart when two share a day.

Pages are recreated when `EVAL_RESEED=1`, or when any fixture's title, text or `updatedAt` (for a key listed in `updatedAt.json`) differs from the eval user's pages. A change that keeps the text and dates, such as bolding a word, is not detected, so run once with `EVAL_RESEED=1`.

## Queries

```json
{"query": "laptop setup", "category": "body", "relevant": {"onboarding-checklist": 3}}
```

`relevant` maps a fixture key to a grade: 3 is the page the user wants, 2 is clearly relevant, 1 is partly relevant. `{}` means no page should answer the query. A key that is not a fixture fails the run.

## Metrics

| Metric | Definition |
| --- | --- |
| `nDCG10` | Gain `2^grade - 1`, discount `1 / log2(rank + 1)`, ideal ranking from all graded pages |
| `recall5` | Pages graded 2 or 3 found in the top 5, over all pages graded 2 or 3 |
| `mrr` | Mean of `1 / rank` of the first page graded 2 or 3 |
| `zeroResultRate` | Share of answerable queries that returned nothing |
| `errors` | Queries that threw, answerable or not. The run fails unless this is 0 |
| `p50Ms`, `p90Ms` | Nearest-rank latency percentiles over all queries |

`queries`, the means and `zeroResultRate` count answerable queries only, so a `noAnswer` row shows 0 queries. Read what those queries returned from `perQuery[].resultKeys`, the fixture keys of the results. `resultIds` are page ids, which change on every reseed, so compare result lists across runs by key.

## Baseline (2026-10-27)

Recorded with `EVAL_LABEL=baseline EVAL_MODES=fused` before any search change. Quick mode isn't recorded: before the planned ranking fix, `alpha: 0` runs the fused query with its weights reversed, so it ranks by vector similarity alone.

`note-ssl-renewal`, a 3-line note that no query labels, appears in 114 of the 116 baseline result lists and ranks first in 45. Result lists are only 2 to 7 long, and every `noAnswer` query returns exactly 2 results, because `MIN_RRF_SCORE` keeps the top two vector-only hits. The baseline is therefore dominated by that defect, so expect large moves when ranking changes.

### Dev set

| | Queries | nDCG@10 | Recall@5 | MRR | Zero-result rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| overall | 83 | 0.532 | 0.540 | 0.594 | 0.000 |
| prefix | 8 | 0.263 | 0.333 | 0.354 | 0.000 |
| title | 13 | 0.538 | 0.538 | 0.538 | 0.000 |
| body | 10 | 0.909 | 0.917 | 1.000 | 0.000 |
| paraphrase | 10 | 0.285 | 0.300 | 0.350 | 0.000 |
| typo | 8 | 0.200 | 0.208 | 0.313 | 0.000 |
| nonEnglish | 7 | 0.143 | 0.143 | 0.143 | 0.000 |
| table | 10 | 0.702 | 0.750 | 0.750 | 0.000 |
| summary | 17 | 0.792 | 0.755 | 0.882 | 0.000 |
| noAnswer | 0 | n/a | n/a | n/a | n/a |

Unindexed: `meeting-notes-ja`, `stub-customer-interviews`, `stub-hiring-plan`, `stub-offsite-agenda`.

`retr`, `stand` and `standpu` have more than 5 relevant pages graded 2 or 3, so they can't reach Recall@5 = 1.

`Hiring plan 2027`, `Customer interview synthesis`, `Offsite agenda` and `リリース計画の会議メモ` target the four unindexed fixtures, so they can't be answered until indexing changes.

### Holdout set

| | Queries | nDCG@10 | Recall@5 | MRR | Zero-result rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| overall | 23 | 0.586 | 0.594 | 0.630 | 0.000 |
| prefix | 2 | 0.693 | 0.750 | 0.750 | 0.000 |
| title | 3 | 0.972 | 1.000 | 1.000 | 0.000 |
| body | 3 | 0.811 | 0.889 | 1.000 | 0.000 |
| paraphrase | 3 | 0.248 | 0.167 | 0.333 | 0.000 |
| typo | 3 | 0.000 | 0.000 | 0.000 | 0.000 |
| nonEnglish | 3 | 0.000 | 0.000 | 0.000 | 0.000 |
| table | 3 | 1.000 | 1.000 | 1.000 | 0.000 |
| summary | 3 | 1.000 | 1.000 | 1.000 | 0.000 |
| noAnswer | 0 | n/a | n/a | n/a | n/a |

Unindexed: `meeting-notes-ja`, `stub-customer-interviews`, `stub-hiring-plan`, `stub-offsite-agenda`. The holdout query `請求書エクスポートのリリース日` targets `meeting-notes-ja`, so it can't be answered until indexing changes.
