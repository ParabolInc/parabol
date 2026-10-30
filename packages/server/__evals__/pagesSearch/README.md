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
| `EVAL_SET` | `dev` | `dev` reads `queries.json` and `holdout` reads `holdoutQueries.json`, both on the fixture corpus. `heavy-dev` reads `heavyQueries.json` and `heavy-holdout` reads `heavyHoldoutQueries.json`, both on the heavy-account corpus (see Heavy account corpus) |
| `EVAL_MODES` | `fused` | Comma-separated `fused`, `quick` and/or `sweep`. `quick` sends `alpha: 0`. `sweep` is described below |
| `EVAL_ALPHAS` | `0.25,0.5,0.75` | `sweep` only: the alphas to rank with |
| `EVAL_FLOORS` | `0.3,0.35,0.4,0.45,0.5` | `sweep` only: the vector similarity floors to rank with |
| `EVAL_MIN_BYTES` | `200` | `sweep` only: whole numbers; the vector arm skips pages with fewer bytes of plain text |
| `EVAL_STOP_WORDS` | each list's default | `sweep` only: `keep` and/or `drop`; `drop` takes English stop words out of the keyword terms |
| `EVAL_ANY_WORD_FALLBACK_BELOW` | each list's default | `sweep` only: whole numbers; when fewer pages than this have every word, pages with some of them follow (0 turns this off) |
| `EVAL_ANY_WORD_MIN_SHARES` | each list's default | `sweep` only: decimals between 0 and 1; the share of the words a page with some of them must contain (at least one) |
| `EVAL_LABEL` | `local` | Names the results file |
| `EVAL_RESEED` | unset | `1` deletes the eval user's pages and seeds them again |
| `EVAL_DUMP` | unset | `1` writes the set's corpus to `results/<corpus>-corpus/` and skips seeding and ranking: one `<key>.md` per page (the title, a blank line, then the plain text that keyword search reads) plus `index.json` |

Each run writes `results/<label>-<set>-<mode>.json` (gitignored) and prints one row per category plus an overall row.

Compare two runs of the same set and mode. It prints `n`, the number of queries in each row, answerable or not, then `b - a` for every metric, overall and per category. A metric that a run didn't record prints `n/a`. Below the table it lists every query whose nDCG@10 changed by 0.001 or more, matched by query text: wins first, then losses, biggest change first, with the first 3 result keys of `a` and `b`. It exits with an error when the set or mode differs. It warns when the two `unindexed` lists differ, because the runs were then scored against different indexes, and when some queries are in only one run, because it can't compare those:

```bash
node __evals__/pagesSearch/compare.mjs \
  __evals__/pagesSearch/results/baseline-dev-fused.json \
  __evals__/pagesSearch/results/local-dev-fused.json
```

## Sweep mode

`EVAL_MODES=sweep` ranks every query with each combination of `EVAL_ALPHAS`, `EVAL_FLOORS`, `EVAL_MIN_BYTES`, `EVAL_STOP_WORDS`, `EVAL_ANY_WORD_FALLBACK_BELOW` and `EVAL_ANY_WORD_MIN_SHARES`, to pick the default alpha, the vector similarity floor, the minimum page length and how keywords match. It combines with the other modes, for example `EVAL_MODES=fused,sweep`. `EVAL_ALPHAS`, `EVAL_FLOORS` and `EVAL_ANY_WORD_MIN_SHARES` are comma-separated decimals between 0 and 1, like `0.25`; `EVAL_MIN_BYTES` and `EVAL_ANY_WORD_FALLBACK_BELOW` are comma-separated whole numbers; `EVAL_STOP_WORDS` lists `keep` and/or `drop`. Each value may be listed once; anything else throws. An unset keyword variable takes the default of the list each row ranks: the quick list's for alpha 0, fused ranking's otherwise.

```bash
EVAL_LABEL=page-fusion EVAL_SET=dev EVAL_MODES=sweep pnpm eval:pagesSearch
```

- **Ranking.** Each query is embedded once, by the same model call as `fused`. Then `getPagesByRRF` runs once per configuration with `first: 20` and the configuration's alpha, `vectorFloor`, `vectorMinBytes` and keyword options. Alpha 0 ranks like the quick list instead, as in the resolver: `getPagesByKeyword` runs with the keyword options, the floor and minimum length don't apply, and an embedding failure doesn't affect the row. It skips the resolver, so there is no embedding budget and no keyword fallback. Each list is scored with the same metrics as the other modes.
- **Errors.** A query whose embedding fails (in rows with alpha above 0), a `getPagesByRRF` or `getPagesByKeyword` call that throws, and a list that holds the same page twice are errors in every affected configuration's results, and they fail the run after it writes its results.
- **Latency.** `latencyMs` is the `getPagesByRRF` or `getPagesByKeyword` call alone, not the embedding. Results have no `embeddingMs`, `embeddingError` or `fallbackReason`.
- **Output.** It prints one row per configuration: alpha, floor, minBytes, stopWords, anyWordFallbackBelow, anyWordMinShare, nDCG10, recall5, recall20, mrr, zeroResultRate, junkAt5 and noAnswerResults, sorted by nDCG10, best first. It writes `results/<label>-<set>-sweep.json` as `{label, set, mode: 'sweep', unindexed, configs: [{alpha, floor, minBytes, stopWords, anyWordFallbackBelow, anyWordMinShare, overall, byCategory, perQuery}]}`, with the configurations in grid order. `compare.mjs` doesn't read sweep files.
- **Validity.** The validity rule below holds for every configuration: `errors` is 0, and `unindexed` lists exactly the fixtures it names.

## How it works

- **Corpus.** The user `eval|pagesSearch` owns every fixture page, privately. Seeding only creates and deletes that user's own rows, so results don't depend on the rest of your dev data.
- **Indexing.** On every run, each page that has no embeddings is embedded in-process with the real `embedPage`, one at a time. When `embedPage` fails for a page, its partial rows are deleted, so the next run tries that page again. A run that you kill while it is embedding a page can leave partial rows behind, so reseed after that. A fixture that still has no embeddings afterwards is listed under `unindexed` in the results. That happens when `embedPage` refuses the page (for example, at the language gate), when the page has nothing to chunk because it is only a title, or when the embeddings service fails or times out on one of the page's chunks. Only the first two are deterministic. A page that failed for the third reason is retried on the next run.
- **Queries.** The real resolver runs with the job queue replaced: the query is embedded by the same model call `embedQuery` makes. A failed search is recorded as zero results plus an `error`, and counted in `errors`; a result list that holds the same page twice is also an error. The resolver answers a `fused` query with keyword results when the query's embedding fails, comes back empty or takes longer than its 3 s budget, or when the fused ranking query throws, and those results would still score as fused. So each query records `embeddingMs` and `embeddingError` (an embedding still running when the search returned is an error), and `fallbackReason` when the resolver logged that it used keyword results. A `fused` run fails when any query has a `fallbackReason` or an `embeddingError`, when its embedding took longer than the budget, or when it made no embedding call; `quick` queries embed nothing and have none of these fields. The run writes its results and then fails: results recorded with errors are not a valid baseline, so run it again.
- **Validity.** A run is a valid baseline only when it passes, so `errors` is 0 and no `fused` query fell back to keyword results, and `unindexed` lists exactly `meeting-notes-ja`, `stub-customer-interviews`, `stub-hiring-plan` and `stub-offsite-agenda`. Any other `unindexed` list means the run scored a different index, so run it again. On a slow or throttled host, for example a laptop on battery, `retro-q3-product` can time out while it is embedded. The symptom is five unindexed fixtures instead of four. Plug in and run again; the next run retries that page.
- **Isolation.** `jest.eval.config.js` has no global setup, so a run never truncates tables or changes triggers. The metric unit tests in `__tests__/` run with the normal server suite.

## Heavy account corpus

The fixture corpus has 47 hand-written pages, like an account in production's top 1%. The heavy corpus is shaped like the 34 production accounts that can open 200 or more pages, which is where ranking has to pick a few pages out of many matches. The user `eval|pagesSearchHeavy` owns it, so seeding it never touches the fixture corpus, and the reverse.

- **Generated.** `heavyCorpus/generateHeavyCorpus.ts` builds 244 TipTap docs with the real summary-page shapes from a seeded PRNG and `heavyCorpus/heavyCorpusData.ts`, so every machine gets the same pages. Nothing in it comes from customer data. Every person, customer, price and incident in it is invented. Vendor names only make the text realistic; the prices and terms attached to them are not Parabol's.
- **What's in it.** Two teams (Atlas Platform with 10 members, Beacon Growth with 7) from Jun 1 to Oct 9, 2026:
  - 190 standup summaries;
  - 18 retros;
  - 18 sprint poker sessions;
  - one Meeting Summaries index page per team;
  - 14 long docs, plus a one-line note and a title-only page.
- **Planted facts.** About 30 dated facts (incidents, decisions, launches, vendors, customers, absences) sit in specific members' standup answers, and some reappear in retro topics, poker stories and docs. Each long doc holds a specific fact in its second half. Everything else is routine work that repeats across many pages, as in real standups.
- **Read it.** `EVAL_DUMP=1 EVAL_SET=heavy-dev pnpm eval:pagesSearch` writes every page's plain text to `results/heavy-corpus/`. Use it to write or check labels.
- **Changing it.** The `generateHeavyCorpus` unit test pins a digest of the generated pages. When it fails:
  1. Recheck `heavyQueries.json` against a fresh dump.
  2. Have someone who doesn't tune ranking recheck `heavyHoldoutQueries.json` the same way, for example an agent that sees only the dump.
  3. Reseed with `EVAL_RESEED=1` and record the heavy baseline again.
  4. Update the digest.

**Calibration.** Production numbers are aggregates from the warehouse on 2026-10-29 over the pages each heavy user can open:

| | Heavy accounts | Heavy corpus |
| --- | ---: | ---: |
| Standups / retros / poker / docs / index pages | 78.4% / 7.1% / 6.6% / 6.2% / 0.5% | 77.9% / 7.4% / 7.4% / 6.6% / 0.8% |
| Median page length | 1,989 | 1,683 |
| 90th percentile page length | 5,700 | 4,875 |
| Pages over 1,500 characters | 55.9% | 55.7% |
| Pages under 200 characters | 25.3% | 24.6% |
| Median long doc | 7,545 | 5,276 |

A quarter of a heavy account's pages are standups that nobody answered: a header, "Not enough data to generate insights" and an empty table, about 150 characters. Those near-empty pages are what A4's junk filter targets. Responses per standup follow production's spread (median 3 among answered standups, up to 10 here and 16 in production). Long docs are shorter than production's, so Group B sees fewer pages that split into many chunks.

**Labels.** The grades follow the Queries section. Two categories are specific to this corpus:
- `longDoc` asks for a detail in the second half of a doc longer than 4,000 characters. A unit test checks this for the dev set.
- `person` names a team member and something they reported.

Both query files follow three conventions:
- Routine mentions of ongoing work, like the many standups that say "load testing the new rate limiter", are not graded. The exception is a mention of the same story, incident or blocker the query asks about.
- A doc that only lists the target's title under "Related documents" gets 1 for title, prefix and title-typo queries, and nothing otherwise.
- A team's Meeting Summaries page gets 1 for a title query that names one of its meetings.

When a dev query matches a holdout query, the dev query changes. A unit test checks that the two files share no query text.

**The holdout runs only at gates.** `heavy-holdout` was written by an independent agent that saw only the corpus dump: no code, results or dev queries. Run it once for the candidate and once for master in a PR that changes ranking, report both, and never tune on it. Whoever tunes ranking doesn't read `heavyHoldoutQueries.json`, so its unit test reports problems by query number, never by text.

**Validity.** A heavy run is a valid baseline when `errors` is 0, no `fused` query fell back to keyword results, and `unindexed` lists exactly `doc-q4-planning-draft`. That page has only a title, and the language gate reads the title as Javanese. The first seed embeds about 500,000 characters, which took 28 minutes on a laptop. Later runs take seconds.

### Heavy corpus baseline (2026-10-29)

`EVAL_LABEL=master EVAL_SET=heavy-dev EVAL_MODES=fused,quick` on master after instant results (A2). Both runs are valid: 52 answerable queries and 6 without an answer.

| Mode | nDCG@10 | Recall@5 | MRR | Zero-result rate | `junkAt5` | `noAnswerResults` | p50 / p90 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| fused | 0.571 | 0.587 | 0.580 | 0.000 | 0.738 | 14.2 | 129 / 164 |
| quick | 0.525 | 0.529 | 0.542 | 0.385 | 0.096 | 0 | 40 / 42 |

| | Queries | Fused nDCG@10 | Quick nDCG@10 | Fused Recall@5 | Quick Recall@5 | Quick zero-result rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| title | 8 | 0.735 | 0.733 | 0.750 | 0.750 | 0.000 |
| prefix | 5 | 0.846 | 0.920 | 0.833 | 0.833 | 0.000 |
| body | 10 | 0.871 | 0.888 | 0.900 | 0.900 | 0.100 |
| paraphrase | 8 | 0.134 | 0.000 | 0.156 | 0.000 | 1.000 |
| typo | 6 | 0.147 | 0.000 | 0.125 | 0.000 | 1.000 |
| table | 4 | 0.637 | 0.479 | 0.750 | 0.500 | 0.250 |
| longDoc | 6 | 0.553 | 0.500 | 0.500 | 0.500 | 0.500 |
| person | 5 | 0.607 | 0.612 | 0.667 | 0.667 | 0.200 |

- **Questions and typos barely work.** Every paraphrase and typo query gets no keyword results, and fused ranking scores 0.13 and 0.15. These are the targets of natural-language matching (A5) and typo-tolerant titles (A6).
- **Fusion sometimes lifts the wrong keyword match.** Quick beats fused on prefix (0.920 against 0.846) and body queries (0.888 against 0.871). Where it does, the page fusion lifts also matches the query's words but isn't the answer: a doc that only lists the target under "Related documents" (`acme interv`), the team's Meeting Summaries page (`Beacon Standup Aug 27`), or the less relevant of two answers (`onboarding emails german`).
- **Near-empty pages fill the lists for unanswerable queries.** They return 14.2 results on average, and 64% of those results are pages under 200 characters. The one-line note `doc-ideas-backlog` ranks first for all six. This is what the junk filter (A4) targets.

### Heavy corpus sweep

`EVAL_LABEL=master EVAL_SET=heavy-dev EVAL_MODES=sweep`, best nDCG@10 first; the first six rows of 15:

| Alpha | Floor | nDCG@10 | Recall@5 | MRR | Zero-result rate | `junkAt5` | `noAnswerResults` |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.25 | 0.4 | 0.571 | 0.587 | 0.580 | 0.000 | 0.738 | 14.17 |
| 0.25 | 0.3 | 0.569 | 0.587 | 0.580 | 0.000 | 0.738 | 20 |
| 0.25 | 0.35 | 0.568 | 0.587 | 0.578 | 0.000 | 0.738 | 20 |
| 0.25 | 0.45 | 0.559 | 0.596 | 0.581 | 0.000 | 0.724 | 9.83 |
| 0.5 | 0.3 | 0.559 | 0.587 | 0.573 | 0.000 | 0.738 | 20 |
| 0.25 | 0.5 | 0.557 | 0.572 | 0.576 | 0.000 | 0.664 | 0.83 |

The current defaults, alpha 0.25 and floor 0.4, score best here too. Alpha above 0.25 loses at every floor, down to 0.277 at alpha 0.75. Raising the floor to 0.5 cuts the results for unanswerable queries from 14 to under 1, at a cost of 0.014 nDCG@10. That trade is the junk filter's (A4) question, to be answered with this corpus and gated on `heavy-holdout`.

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
| `recall20` | The same for the top 20, which is what the search dialog shows |
| `mrr` | Mean of `1 / rank` of the first page graded 2 or 3 |
| `zeroResultRate` | Share of answerable queries that returned nothing |
| `junkAt5` | Share of the results shown, up to the first 5, that the query doesn't grade. An empty list scores 0, because `zeroResultRate` counts it |
| `noAnswerResults` | Mean number of results over queries that have no relevant page. 0 when there are none |
| `errors` | Queries that threw, answerable or not. Any error fails the run |
| `p50Ms`, `p90Ms` | Nearest-rank latency percentiles over all queries |

`queries`, the means and `zeroResultRate` count answerable queries only, so a `noAnswer` row shows 0 queries. `noAnswerResults` is the reverse: it counts only the queries that aren't answerable. Read what those queries returned from `perQuery[].resultKeys`, the fixture keys of the results. `resultIds` are page ids, which change on every reseed, so compare result lists across runs by key.

## Baseline (2026-10-27)

Recorded with `EVAL_LABEL=baseline EVAL_MODES=fused` before any search change. Quick mode wasn't recorded in this baseline. Before the keyword search change, `alpha: 0` ran the fused query with its weights reversed, so it ranked by vector similarity alone. It now returns keyword results without embedding the query. Quick runs on 2026-10-28 scored nDCG@10 0.552 on dev and 0.520 on holdout.

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

## Per-page ranking (2026-10-28)

The Baseline (2026-10-27) section above describes the ranking before this change. Per-page ranking fuses a keyword rank and a vector rank for each page (`getPagesByRRF`). The vector rank orders pages by the cosine similarity of their best chunk and only counts similarities at or above `VECTOR_SIMILARITY_FLOOR`. `chunk-fusion` is the earlier ranking, recorded again on 2026-10-28 with the junk metrics, and `page-fusion` is the new one.

**Chosen: alpha 0.25 and floor 0.4.** Alpha is the resolver's default for every search type, and the floor is `VECTOR_SIMILARITY_FLOOR`.

- **How it was chosen.** No configuration in the dev sweep kept both `junkAt5` and the zero-result rate at or below `chunk-fusion`'s, because the `chunk-fusion` result lists were only 2 to 7 long. So the first pick was the configuration with the lowest `junkAt5` among those with no more zero-result queries than `chunk-fusion` and an nDCG@10 within 0.01 of the best, which was floor 0.45. The floor was then set to 0.4, the highest floor whose dev nDCG@10 stays within 0.005 of the dev best (0.606 against 0.607). That second choice was informed by the holdout result, so the holdout numbers at 0.4 are not an independent check.
- **The 0.45 alternative.** Floor 0.45 did not match `chunk-fusion` on holdout: fused nDCG@10 0.565 against 0.586. It returns fewer results for queries with no relevant page: `noAnswerResults` is 5 on dev and 1 on holdout, against 13 and 6 at 0.4.
- **Alpha.** 0.25 with the corrected formula weights vectors exactly as the old, inverted formula did at its default of 0.75, so callers of the other search types that don't pass alpha keep their ranking. 0.25 is also the lowest alpha swept. On the dev sweep, nDCG@10 falls as alpha rises at every floor. On the holdout sweep it does too, except at floor 0.3, where alpha 0.5 scores 0.607 against 0.599 at alpha 0.25. Lower values weren't swept: at 0.25 or below, every keyword match ranked 122nd or better already outranks every vector-only page (0.75/182 > 0.25/61), so on this corpus going lower only changes how vector similarity reorders keyword matches.
- **What is left.**
  - **Natural-language queries.** Table and summary queries still lose to the old ranking, because the keyword arm requires every word, stop words included, and the vector arm alone doesn't reliably surface the right page. The query "which initiative is at risk" has no keyword match, and `product-roadmap` isn't in the top 20 by vector similarity. For "who sends the customer newsletter", the one keyword match, `product-spec`, outranks `release-checklist`. By vector similarity `release-checklist` is third, at 0.483, behind `note-ssl-renewal` at 0.550 and `vendor-comparison` at 0.488.
  - **The hub page persists.** The Baseline (2026-10-27) section describes `note-ssl-renewal`, a 3-line note that no query labels, as a hub that dominates result lists. Per-page ranking doesn't remove it: it still ranks first in 45 of 116 fused result lists (dev 35 of 91, holdout 10 of 25), the same count as `chunk-fusion`, and in 45 of the 51 queries where the keyword arm finds nothing (dev 35 of 40, holdout 10 of 11). It appears somewhere in every `page-fusion` list. Those lists average 16.4 results on dev and 15.4 on holdout, against 2 to 7 for `chunk-fusion`. Near-empty pages embed close to every query, which is why they act as hubs.
  - **The floor barely filters on a large real account.** On the dev database's busiest user, with 238 indexed pages, the number of pages whose best chunk is at or above the 0.4 floor was 96 for a nonsense query (`xyzzy plugh`), 76 of them under 200 characters; 135 and 161 for two question-style queries; and 3 for an unrelated recipe query. So for a heavy user, a query the keyword arm misses can fill all 20 slots, led by near-empty pages, while a query far from every page, like the recipe one, is cut short. The 47-page eval corpus can't show this. Re-sweep the floor after any change that moves similarity scores: cleaner index text, the chunker, pooling or a query instruction. Likely remedies to evaluate with this harness: a query instruction prefix (which changes only query embeddings), a relative floor, and hub suppression. The junk filter section below tried a relative floor; it lost.

### Dev sweep

`EVAL_LABEL=page-fusion EVAL_SET=dev EVAL_MODES=sweep` with the default grid, best nDCG@10 first.

| Alpha | Floor | nDCG@10 | Recall@5 | MRR | Zero-result rate | `junkAt5` | `noAnswerResults` |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.25 | 0.3 | 0.607 | 0.616 | 0.624 | 0.000 | 0.812 | 19.25 |
| 0.25 | 0.4 | 0.606 | 0.613 | 0.624 | 0.000 | 0.813 | 13 |
| 0.25 | 0.35 | 0.605 | 0.615 | 0.624 | 0.000 | 0.814 | 17.75 |
| 0.5 | 0.3 | 0.601 | 0.613 | 0.621 | 0.000 | 0.817 | 19.25 |
| 0.5 | 0.35 | 0.599 | 0.613 | 0.621 | 0.000 | 0.817 | 17.75 |
| 0.25 | 0.45 | 0.599 | 0.609 | 0.616 | 0.000 | 0.783 | 5 |
| 0.5 | 0.4 | 0.592 | 0.610 | 0.611 | 0.000 | 0.816 | 13 |
| 0.25 | 0.5 | 0.588 | 0.586 | 0.620 | 0.048 | 0.642 | 1.5 |
| 0.5 | 0.45 | 0.577 | 0.602 | 0.589 | 0.000 | 0.790 | 5 |
| 0.5 | 0.5 | 0.567 | 0.583 | 0.596 | 0.048 | 0.645 | 1.5 |
| 0.75 | 0.3 | 0.513 | 0.560 | 0.515 | 0.000 | 0.831 | 19.25 |
| 0.75 | 0.35 | 0.455 | 0.476 | 0.464 | 0.000 | 0.851 | 17.75 |
| 0.75 | 0.5 | 0.404 | 0.461 | 0.365 | 0.048 | 0.679 | 1.5 |
| 0.75 | 0.4 | 0.402 | 0.391 | 0.427 | 0.000 | 0.871 | 13 |
| 0.75 | 0.45 | 0.399 | 0.421 | 0.363 | 0.000 | 0.843 | 5 |

### Holdout sweep (seen before the floor was chosen)

The same sweep on the holdout set. The selection rule reads the dev sweep only, but the choice of 0.4 was made knowing these rows, so they are not an independent check. This holdout is spent for floor tuning: the next sweep needs a new blind holdout, ideally larger, because with 23 answerable queries one swapped result moves holdout nDCG@10 by about 0.04.

| Alpha | Floor | nDCG@10 | Recall@5 | MRR | Zero-result rate | `junkAt5` | `noAnswerResults` |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.5 | 0.3 | 0.607 | 0.627 | 0.624 | 0.000 | 0.835 | 20 |
| 0.25 | 0.3 | 0.599 | 0.627 | 0.624 | 0.000 | 0.835 | 20 |
| 0.25 | 0.35 | 0.599 | 0.627 | 0.624 | 0.000 | 0.835 | 17 |
| 0.25 | 0.4 | 0.599 | 0.627 | 0.624 | 0.000 | 0.835 | 6 |
| 0.5 | 0.35 | 0.590 | 0.627 | 0.602 | 0.000 | 0.835 | 17 |
| 0.5 | 0.4 | 0.590 | 0.627 | 0.602 | 0.000 | 0.835 | 6 |
| 0.25 | 0.45 | 0.565 | 0.627 | 0.612 | 0.000 | 0.817 | 1 |
| 0.25 | 0.5 | 0.548 | 0.583 | 0.594 | 0.043 | 0.662 | 0.5 |
| 0.5 | 0.45 | 0.539 | 0.627 | 0.568 | 0.000 | 0.817 | 1 |
| 0.75 | 0.3 | 0.521 | 0.583 | 0.496 | 0.000 | 0.843 | 20 |
| 0.5 | 0.5 | 0.520 | 0.583 | 0.551 | 0.043 | 0.662 | 0.5 |
| 0.75 | 0.35 | 0.430 | 0.482 | 0.409 | 0.000 | 0.870 | 17 |
| 0.75 | 0.5 | 0.316 | 0.388 | 0.292 | 0.043 | 0.705 | 0.5 |
| 0.75 | 0.4 | 0.287 | 0.286 | 0.308 | 0.000 | 0.913 | 6 |
| 0.75 | 0.45 | 0.239 | 0.286 | 0.220 | 0.000 | 0.896 | 1 |

### Before and after

At alpha 0.25 and floor 0.4, fused nDCG@10 and Recall@5 are above `chunk-fusion` on both sets, the zero-result rate is unchanged, and `quick` is identical to `chunk-fusion`. `junkAt5` and `noAnswerResults` are higher because the lists are longer. All runs are valid: `errors` is 0 and `unindexed` is the expected list.

Dev set (83 answerable queries, 8 without a relevant page):

| Mode | Run | nDCG@10 | Recall@5 | MRR | Zero-result rate | `junkAt5` | `noAnswerResults` |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| fused | `chunk-fusion` | 0.532 | 0.540 | 0.594 | 0.000 | 0.720 | 2 |
| fused | `page-fusion` | 0.606 | 0.613 | 0.624 | 0.000 | 0.813 | 13 |
| quick | `chunk-fusion` | 0.552 | 0.538 | 0.590 | 0.386 | 0.072 | 0 |
| quick | `page-fusion` | 0.552 | 0.538 | 0.590 | 0.386 | 0.072 | 0 |

Holdout set (23 answerable queries, 2 without a relevant page):

| Mode | Run | nDCG@10 | Recall@5 | MRR | Zero-result rate | `junkAt5` | `noAnswerResults` |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| fused | `chunk-fusion` | 0.586 | 0.594 | 0.630 | 0.000 | 0.762 | 2 |
| fused | `page-fusion` | 0.599 | 0.627 | 0.624 | 0.000 | 0.835 | 6 |
| quick | `chunk-fusion` | 0.520 | 0.529 | 0.565 | 0.391 | 0.072 | 0 |
| quick | `page-fusion` | 0.520 | 0.529 | 0.565 | 0.391 | 0.072 | 0 |

### Fused nDCG@10 by category

Dev set:

| | Queries | `chunk-fusion` | `page-fusion` | Change |
| --- | ---: | ---: | ---: | ---: |
| overall | 83 | 0.532 | 0.606 | +0.074 |
| prefix | 8 | 0.263 | 0.755 | +0.492 |
| title | 13 | 0.538 | 0.886 | +0.348 |
| body | 10 | 0.909 | 0.837 | -0.072 |
| paraphrase | 10 | 0.285 | 0.241 | -0.045 |
| typo | 8 | 0.200 | 0.265 | +0.065 |
| nonEnglish | 7 | 0.143 | 0.667 | +0.525 |
| table | 10 | 0.702 | 0.602 | -0.100 |
| summary | 17 | 0.792 | 0.537 | -0.255 |

Holdout set:

| | Queries | `chunk-fusion` | `page-fusion` | Change |
| --- | ---: | ---: | ---: | ---: |
| overall | 23 | 0.586 | 0.599 | +0.013 |
| prefix | 2 | 0.693 | 1.000 | +0.307 |
| title | 3 | 0.972 | 0.972 | 0.000 |
| body | 3 | 0.811 | 0.823 | +0.012 |
| paraphrase | 3 | 0.248 | 0.370 | +0.122 |
| typo | 3 | 0.000 | 0.285 | +0.285 |
| nonEnglish | 3 | 0.000 | 0.000 | 0.000 |
| table | 3 | 1.000 | 0.477 | -0.523 |
| summary | 3 | 1.000 | 1.000 | 0.000 |

## Junk filter (2026-10-29)

The vector arm of fused results (`getPagesByRRF`) now skips pages with fewer than 200 bytes of plain text (`VECTOR_MIN_PAGE_BYTES`). That is about 200 characters of English, and fewer of Japanese or Chinese, where each character carries more meaning. Such pages are still found by their words. Short pages embed close to every query; on the heavy corpus a quarter of the pages are like this, mostly standups that nobody answered. The length comes from the stored size, so the text is never decompressed. The heavy corpus baseline above is from before this change, and quick results don't change.

**How it was chosen.** A selection rule was written in the plan before any sweep ran:
1. A configuration is eligible when nDCG@10 is within 0.005 of master on both `heavy-dev` and `dev`, and it adds no zero-result queries.
2. Among eligible configurations, pick the lowest `heavy-dev` `noAnswerResults`. Treat values within 0.5 as ties, and break them by `junkAt5`, then nDCG@10, then fewer rules.
3. Ship only if `heavy-holdout` keeps nDCG@10 within 0.01 of master and lowers `noAnswerResults`.

The sweep crossed three dimensions (126 configurations):
- floors 0.4, 0.45 and 0.5;
- minimum lengths of 0, 50, 100, 150, 200 and 300 characters;
- a limiter: none, a relative floor (keep vector matches within 0.05, 0.1 or 0.15 of the query's best similarity), or a cap of 3, 5 or 10 pages found only by the vector arm.

The rule picked 200 characters with a cap of 10, and the first `heavy-holdout` gate passed. Review then showed the rule couldn't see the cap's cost:
- Pages found only by the vector arm rank after keyword matches. So a cap of 10 only ever removes results below position 10, where nDCG@10 and Recall@5 don't look.
- The search dialog shows 20 results. Recall@20, added to the eval for this, shows the cap hiding answers: `dev` falls from 0.840 to 0.734.

The cap was dropped, and the relative floor, which lost in the sweep, was removed. What ships is the minimum length alone. It moved from characters to bytes, which gives the same results on these corpora. It was gated again on `heavy-holdout`, with nDCG@10 and Recall@20 fixed as the criteria before the run.

| Set | Configuration | nDCG@10 | Recall@5 | Recall@20 | `noAnswerResults` |
| --- | --- | ---: | ---: | ---: | ---: |
| `heavy-dev` | master | 0.571 | 0.587 | 0.713 | 14.17 |
| `heavy-dev` | 150 bytes | 0.582 | 0.587 | 0.713 | 13.83 |
| `heavy-dev` | **200 bytes** | 0.610 | 0.620 | 0.753 | 13.67 |
| `heavy-dev` | 200 characters, cap 10 (dropped) | 0.610 | 0.620 | 0.718 | 7.00 |
| `dev` | master | 0.606 | 0.613 | 0.840 | 13.00 |
| `dev` | 150 bytes | 0.633 | 0.646 | 0.844 | 11.50 |
| `dev` | **200 bytes** | 0.618 | 0.628 | 0.826 | 10.63 |
| `dev` | 200 characters, cap 10 (dropped) | 0.618 | 0.628 | 0.734 | 8.38 |

**Why 200, not 150.** 150 bytes does better on the fixture corpus, but on the heavy corpus it keeps most of the gain away: 0.582 against 0.610. Unanswered standups are 137–161 characters in production, so 150 leaves many of them in the vector arm.

On `heavy-dev`, by category:

| Category | Before | After |
| --- | ---: | ---: |
| prefix | 0.85 | 0.91 |
| paraphrase | 0.13 | 0.19 |
| typo | 0.15 | 0.28 |
| longDoc | 0.55 | 0.65 |
| table | 0.64 | 0.60 |
| person | 0.61 | 0.59 |

**What it costs.** A note with fewer than 200 bytes of text is no longer found by meaning or through a typo, only by its words.
- In `dev`, `note-whiteboard` (154 characters) loses both its queries: "where are the pictures from the design brainstorm" falls from 1.0 to 0, and "whiteboad" from 0.5 to 0. They are dev's only losses, against 24 wins.
- `heavy-dev` has 14 wins and 3 losses. One of those losses is the 65-character `doc-ideas-backlog` dropping out of "Sofia hackathon slack bot", where it was graded 1.
- Length can't tell a short note from an empty standup summary, and short notes are hubs too: `doc-ideas-backlog` led every unanswerable list on the heavy corpus.

**What it doesn't fix.** Unanswerable queries still return about 14 pages on `heavy-dev`. The only rule that halved that, the cap, did it by hiding answers. Filler for unanswerable queries is left for later sprints: natural-language matching (A5), the query instruction (A9) and the floor re-tune after re-embedding (B8).

**Gate.** `heavy-holdout` has had two gate runs. The first compared master with 200 characters and a cap of 10. The second compared master with the shipped rule, 200 bytes and no cap:

| Holdout | Configuration | nDCG@10 | Recall@5 | Recall@20 | `noAnswerResults` |
| --- | --- | ---: | ---: | ---: | ---: |
| `heavy-holdout` (72 answerable) | master | 0.560 | 0.632 | 0.729 | 15.00 |
| `heavy-holdout` | 200 bytes | 0.581 | 0.639 | 0.743 | 13.88 |
| `holdout` (23 answerable, spent) | master | 0.599 | 0.627 | 0.826 | 6.00 |
| `holdout` | 200 bytes | 0.605 | 0.627 | 0.783 | 4.00 |

- **The gate passes.** On `heavy-holdout`, nDCG@10 rises by 0.020 and Recall@20 by 0.014.
- **The fixture holdout drops.** Its Recall@20 falls by 0.043, about one page: the short-note cost above.
- **What was read.** Only overall rows. The local holdout results were scrubbed down to those rows.

## Natural-language matching (2026-10-29)

Keyword search used to need every word of a query, stop words included. A question like "when were the cdn assets restored" matched only pages that also contained "when", "were" and "the", and the 8-word cap cut longer questions off before their last content words. Two rules in `withPageKeywordRanking` change that, for both the quick list and fused ranking:
- **Stop words leave the query.** Words on Postgres's English stop list (`ts_lexize('english_stem', word)` is empty) leave before the 8-word cap.
  - A query made only of stop words keeps them all. Pages with both words of "to do" come first, and in the quick list pages with either word follow them.
  - Other languages' stop words stay, except words that are also on the English list, such as Spanish "no" or German "will", "am" and "an".
- **Pages with some of the words follow.** When fewer pages than a threshold have every word, pages with some of them come next, ordered by:
  1. the number of words, most first;
  2. title matches;
  3. `ts_rank_cd` against any of the words;
  4. the most recently updated.

  A page with every word gets its snippet from the all-words query. Other pages get it from the any-word query, so the snippet shows the words the page contains. `ts_headline` falls back to a page's first 15 words when no passage satisfies its query.

Each list has its own defaults: `QUICK_KEYWORD_MATCHING` in `getPagesByKeyword.ts` and `FUSED_KEYWORD_MATCHING` in `getPagesByRRF.ts`.
- **Quick list:** when fewer than 20 pages have every word, pages with any of the words fill the list.
- **Fused ranking:** only when no page has every word do pages with at least half of the words follow. At alpha 0.25, each of the first 122 pages found by keywords outranks every page found only by the vector arm, so a wider fallback pushes good vector matches out of the visible 20. Falling back below 20 instead of 1, still requiring half the words, gives `heavy-dev` nDCG@10 0.657 instead of 0.715.

The heavy corpus baseline above is from before this change.

**How it was chosen.** The plan fixed a selection rule before any sweep ran:
1. **Rows.** Each list's rows cross three settings:
   - stop words, kept or dropped;
   - the threshold: 0, 1, 5 or 20 pages;
   - the minimum share of the words: any, or half.

   Master keeps stop words and never falls back.
2. **Eligibility.** A row is eligible when, on both `heavy-dev` and `dev`, nDCG@10 and Recall@20 are within 0.005 of master's. For fused ranking, `noAnswerResults` must also rise by at most 1.
3. **Pick.** Each list takes its eligible row with the highest mean nDCG@10 over the two sets. Rows within 0.005 tie; ties go to higher mean Recall@20, then fewer changes, then the smaller threshold.
4. **Stop words.** They are kept or dropped for both lists together, by the higher summed nDCG@10.
5. **Gate.** On `heavy-holdout`, each changed list must keep nDCG@10 and Recall@20 within 0.01 of master's.

Quick list (alpha 0):

| Configuration | `heavy-dev` nDCG@10 | Recall@20 | Zero-result rate | `dev` nDCG@10 | Recall@20 | Zero-result rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| master | 0.525 | 0.574 | 0.385 | 0.552 | 0.544 | 0.386 |
| drop stop words, no fallback | 0.559 | 0.603 | 0.327 | 0.648 | 0.632 | 0.277 |
| keep stop words, fill below 20 | 0.738 | 0.853 | 0.019 | 0.797 | 0.916 | 0.048 |
| **drop stop words, fill below 20** | 0.767 | 0.853 | 0.038 | 0.854 | 0.912 | 0.048 |
| drop, fill below 5 (tied, lower Recall@20) | 0.766 | 0.846 | 0.038 | 0.854 | 0.912 | 0.048 |
| drop, fill below 20, half the words | 0.739 | 0.822 | 0.077 | 0.843 | 0.884 | 0.072 |

Fused ranking (alpha 0.25, floor 0.4, 200 bytes):

| Configuration | `heavy-dev` nDCG@10 | Recall@20 | `noAnswerResults` | `dev` nDCG@10 | Recall@20 | `noAnswerResults` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| master | 0.610 | 0.753 | 13.67 | 0.618 | 0.826 | 10.63 |
| drop stop words, no fallback | 0.636 | 0.753 | 13.67 | 0.687 | 0.847 | 10.63 |
| drop, fall back below 1, any word (not eligible) | 0.729 | 0.830 | 15.17 | 0.778 | 0.886 | 14.75 |
| **drop, fall back below 1, half the words** | 0.715 | 0.830 | 13.67 | 0.788 | 0.880 | 11.63 |
| drop, fall back below 20, any word | 0.634 | 0.872 | 15.17 | 0.694 | 0.940 | 14.75 |

On `heavy-dev`, by category:

| Category | Quick before | Quick after | Fused before | Fused after |
| --- | ---: | ---: | ---: | ---: |
| title | 0.73 | 0.75 | 0.74 | 0.74 |
| prefix | 0.92 | 0.96 | 0.91 | 0.91 |
| body | 0.89 | 0.93 | 0.87 | 0.87 |
| paraphrase | 0.00 | 0.44 | 0.19 | 0.32 |
| typo | 0.00 | 0.58 | 0.28 | 0.56 |
| table | 0.48 | 0.72 | 0.60 | 0.79 |
| longDoc | 0.50 | 1.00 | 0.65 | 0.99 |
| person | 0.61 | 0.78 | 0.59 | 0.59 |

On `dev`, the summary queries that fell in A1 recover: the quick list goes from 0.51 to 0.97 and fused ranking from 0.54 to 0.82. Table queries go from 0.44 to 0.95 (quick) and from 0.71 to 0.94 (fused). Typo queries gain because a misspelled word no longer stops the other words from matching.

**What it costs.**
- **Unanswerable queries fill the quick list.**
  - On `heavy-dev` such a query now gets 5 quick results instead of none, and on `dev` 10.25. They are pages that share a word with the query.
  - Fused results for these queries barely change: 13.67 before and after on `heavy-dev`, and 10.63 → 11.63 on `dev`. So the list a person ends up with is about as long as before.
  - Requiring half the words would cut the quick list's count on `heavy-dev` from 5 to 0.5, at nDCG@10 0.739 instead of 0.767. The rule doesn't weigh unanswerable queries for the quick list.
- **One dev query got worse:** the German "wer hat diese Woche Bereitschaftsdienst", in fused ranking, from 0.36 to 0.33. German stop words stay. No other answerable dev query got worse in either list: the quick list has 24 wins on `heavy-dev` and 42 on `dev`, and fused ranking has 10 and 24.
- **Latency.** Locally, quick p50/p90 went from 40/43 ms to 42/45 ms on `heavy-dev`, and from 8/9 ms to 10/11 ms on `dev`.

**The quick list now beats fused ranking**, on both dev sets and on `heavy-holdout`: on `heavy-dev`, 0.767 against 0.715, and on `dev`, 0.854 against 0.788. Even with the quick list's keyword settings, fused ranking scores only 0.634 on `heavy-dev`, because at alpha 0.25 the vector arm reorders good keyword matches. So the app shows the better list first, and fused results then replace it with a worse one, the reverse of what D7 intended. The next step is a sweep of lower alphas: the A1 sweep tried only 0.25, 0.5 and 0.75.

**Gate.** Each list ran once as master and once as the pick, as single-row sweeps:

| Holdout | List | Configuration | nDCG@10 | Recall@5 | Recall@20 | Zero-result rate | `noAnswerResults` |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| `heavy-holdout` (72 answerable) | quick | master | 0.537 | 0.556 | 0.569 | 0.417 | 0.00 |
| `heavy-holdout` | quick | A5 | 0.801 | 0.847 | 0.931 | 0.000 | 10.00 |
| `heavy-holdout` | fused | master | 0.581 | 0.639 | 0.743 | 0.000 | 13.88 |
| `heavy-holdout` | fused | A5 | 0.719 | 0.813 | 0.896 | 0.000 | 14.00 |
| `holdout` (23 answerable, spent) | quick | master | 0.520 | 0.529 | 0.529 | 0.391 | 0.00 |
| `holdout` | quick | A5 | 0.822 | 0.833 | 0.891 | 0.043 | 4.00 |
| `holdout` | fused | master | 0.605 | 0.627 | 0.783 | 0.000 | 4.00 |
| `holdout` | fused | A5 | 0.808 | 0.801 | 0.913 | 0.000 | 4.00 |

- **The gate passes for both lists.** On `heavy-holdout`, the quick list gains 0.264 nDCG@10 and 0.361 Recall@20, and fused ranking gains 0.138 and 0.153.
- **What was read.** Only overall rows. The local holdout results were scrubbed down to those rows.
- **Gate runs so far.** `heavy-holdout` has had six: two for A4, and a master and a pick for each list here.
