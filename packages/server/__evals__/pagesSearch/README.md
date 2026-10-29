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
| `EVAL_MIN_CHARS` | `200` | `sweep` only: whole numbers; the vector arm skips pages whose plain text is shorter |
| `EVAL_LIMITERS` | `cap:10` | `sweep` only: `off` or `cap:<n>`, which keeps at most n pages found only by the vector arm |
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

`EVAL_MODES=sweep` ranks every query with each combination of `EVAL_ALPHAS`, `EVAL_FLOORS`, `EVAL_MIN_CHARS` and `EVAL_LIMITERS`, to pick the vector similarity floor, the default alpha and the junk rules. It combines with the other modes, for example `EVAL_MODES=fused,sweep`. Both variables are comma-separated decimals between 0 and 1, like `0.25`, each listed once; anything else throws.

```bash
EVAL_LABEL=page-fusion EVAL_SET=dev EVAL_MODES=sweep pnpm eval:pagesSearch
```

- **Ranking.** Each query is embedded once, by the same model call as `fused`. Then `getPagesByRRF` runs once per pair with `first: 20`, the pair's alpha and the pair's floor as `vectorFloor`. It skips the resolver, so there is no embedding budget and no keyword fallback. Each list is scored with the same metrics as the other modes.
- **Errors.** A query whose embedding fails, a `getPagesByRRF` call that throws, and a list that holds the same page twice are errors in every affected pair's results, and they fail the run after it writes its results.
- **Latency.** `latencyMs` is the `getPagesByRRF` call alone, not the embedding. Results have no `embeddingMs`, `embeddingError` or `fallbackReason`.
- **Output.** It prints one row per pair: alpha, floor, nDCG10, recall5, mrr, zeroResultRate, junkAt5 and noAnswerResults, sorted by nDCG10, best first. It writes `results/<label>-<set>-sweep.json` as `{label, set, mode: 'sweep', unindexed, configs: [{alpha, floor, overall, byCategory, perQuery}]}`, with the pairs in grid order. `compare.mjs` doesn't read sweep files.
- **Validity.** The validity rule below holds for every pair: `errors` is 0, and `unindexed` lists exactly the fixtures it names.

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
  - **The floor barely filters on a large real account.** On the dev database's busiest user, with 238 indexed pages, the number of pages whose best chunk is at or above the 0.4 floor was 96 for a nonsense query (`xyzzy plugh`), 76 of them under 200 characters; 135 and 161 for two question-style queries; and 3 for an unrelated recipe query. So for a heavy user, a query the keyword arm misses can fill all 20 slots, led by near-empty pages, while a query far from every page, like the recipe one, is cut short. The 47-page eval corpus can't show this. Re-sweep the floor after any change that moves similarity scores: cleaner index text, the chunker, pooling or a query instruction. Likely remedies to evaluate with this harness: a query instruction prefix (which changes only query embeddings), a relative floor, and hub suppression.

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
