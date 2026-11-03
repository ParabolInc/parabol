# `Embedder`

This service builds embedding vectors for semantic search and for other AI/ML
use cases. It does so by:

1. Homogenizes different types of data into a single `EmbeddingsMetadata` table
2. Each new row in `EmbeddingsMetadata` creates a new row in `EmbeddingsJobQueue` for the active model
3. Uses PG to pick a job from the queue and sets the job from `queued` -> `embedding`,
   then `embedding` -> [deleting the `EmbeddingJobQueue` row]
4. Embedding involves creating a `fullText` from the work item and then a vector from that `fullText`
5. New jobs to add metadata are sent via valkey streams from the GQL Executor
6. If embedding fails, the application increments the `retryCount` and increases the `retryAfter` if a retry is desired
7. If a job gets stalled, a process that runs every 5 minutes will look for jobs older than 5 minutes and reset them to `queued`
8. A page job waits until 20 seconds after the page's last save (`runAfter`). Each save pushes it back, so a page is embedded once its edits settle, but it becomes due no later than 2 minutes after the job was queued or last started, so a page someone keeps typing in is still embedded while they type. Jobs that are due still run in priority order. A save that lands while the page is being embedded queues the job again when it finishes. If that run fails instead, the page waits for its next save
9. Each page job logs `embedPage <pageId>: embedded <n> of <m> chunks, <tokens> tokens, <ms> ms`, and the service logs `Tokens per second` next to `Jobs per second` whenever either rate changes (it checks every 10 seconds)

## Prerequisites

The Embedder service depends on pgvector being available in Postgres.

The predeploy script checks for an environment variable
`POSTGRES_USE_PGVECTOR=true` to enable this extension in production.

## Configuration

The Embedder service takes no arguments and is controlled by the following
environment variables, here given with example configuration:

- `AI_EMBEDDER_WORKERS`: How many workers should simultaneously pick jobs from the queue. If less than 1, disabled.

`AI_EMBEDDER_WORKERS='1'`

- `AI_EMBEDDING_MODELS`: JSON configuration for which embedding models
  are enabled. Each model in the array will be instantiated by
  `ai_models/ModelManager`. Each model instance will have its own
  database table created for it (if it does not exist already) used
  to store calculated vectors. See `ai_models/ModelManager` for
  which configurations are supported.

  See .env.example

- `AI_GENERATION_MODELS`: JSON configuration for which AI generation
  models (i.e. GPTS are enabled). These models are used for summarization
  text to be embedded by an embedding model if the text length would be
  greater than the context window of the embedding model. Each model in
  the array will be instantiated by `ai_models/ModelManager`.
  See `ai_models/ModelManager` for which configurations are supported.

  See .env.example

## Embedding models

`ai_models/modelIdDefinitions` holds each model's settings: its tables, its page
chunker, its prompts, and its cut-offs for page search, template search, Related
Discussions and Similar Wording. A cut-off only means something for the model it
was tuned on, so a new model brings its own.

The first entry in `AI_EMBEDDING_MODELS` is the active model. Searches read its
vectors and new content is queued for it alone. Later entries only work through
the jobs already queued for them.

Every model's tables have the same columns, so the generated types only need one
model's. `pnpm pg:generate` and `pnpm dev` leave the others out with
`--exclude-pattern`, which moves to the old model when CI's env moves to the new one.

To try Harrier locally, start its service with
`COMPOSE_PROFILES=harrier pnpm db:start` and use the commented line in
`.env.example`. Stop it with `COMPOSE_PROFILES=harrier pnpm db:stop`.

### Moving to a new model

The first time the embedder starts with a model listed, it creates that model's
tables and queues its fill: public templates and the last two weeks of reflections,
then team templates, then a year of discussions and then pages, each newest first. The
whole fill sits behind every other kind of job. The tables and the jobs commit together,
so if the embedder dies while queueing, its next start tries again. Startup doesn't wait
for a model that isn't active.

If a model's TEI is down, its fill jobs go back in the queue and their workers wait for
it. Everything else fails as it always has. With more than one worker, the first never
takes fill jobs, so a fill can't stall searches or new content. A job that's in flight
5 times when TEI goes down fails, in case it's what's taking TEI down.

1. Start the new model's TEI, using the pooling and model revision that its tuning used
   (Harrier's are on `tei-harrier` in `docker/stacks/development/docker-compose.yml`).
   List the model second, `[old, new]`, and note the time.
   People see no change while it fills. Keep one embedder replica, because an embedder
   fails any job whose model it doesn't list. Run two `AI_EMBEDDER_WORKERS` per TEI
   pod: more than that lengthens TEI's queue, and searches wait in it.
2. When the new model has vectors for its templates and recent discussions, swap to
   `[new, old]`. Searches and new content move to it. Pages without vectors yet still
   come up through keywords.
3. In `psql`, queue what changed since step 1 and anything that failed along the way.
   Set the time from step 1. For another model, change its id and its table names.
   Both statements are safe to repeat:

   ```sql
   \set modelId 'microsoft/harrier-oss-v1-270m'
   \set step1At '2026-11-10 14:00:00+00'

   INSERT INTO "EmbeddingsJobQueueV2" ("jobType", "priority", "embeddingsMetadataId", "modelId", "jobData")
   SELECT
     'embed:start',
     CASE WHEN m."objectType" = 'retroReflection' THEN 400000000 ELSE 500000000 END,
     m."id",
     :'modelId',
     '{"forceBuildText": true}'::jsonb
   FROM "EmbeddingsMetadata" m
   WHERE m."language" IS NOT NULL
     AND (
       m."objectType" = 'meetingTemplate'
       OR (m."objectType" = 'retrospectiveDiscussionTopic' AND m."refUpdatedAt" > now() - interval '1 year')
       OR (m."objectType" = 'retroReflection' AND m."refUpdatedAt" > now() - interval '14 days')
     )
     AND (
       m."refUpdatedAt" > :'step1At'
       OR NOT EXISTS (SELECT 1 FROM "Embeddings_harrier270m" e WHERE e."embeddingsMetadataId" = m."id")
     )
     AND NOT EXISTS (
       SELECT 1 FROM "EmbeddingsJobQueueV2" q
       WHERE q."embeddingsMetadataId" = m."id" AND q."modelId" = :'modelId'
     );

   INSERT INTO "EmbeddingsJobQueueV2" ("jobType", "priority", "pageId", "modelId")
   SELECT 'embedPage:start', 500000000, p."id", :'modelId'
   FROM "Page" p
   WHERE octet_length(p."plaintextContent") >= 200
     AND NOT EXISTS (
       SELECT 1 FROM "EmbeddingsPages_harrier270m" e
       WHERE e."pageId" = p."id" AND e."pageUpdatedAt" >= p."updatedAt" - interval '1 millisecond'
     )
   ON CONFLICT DO NOTHING;
   ```

4. When the fill is done, repeat step 3 with the current time, so it only picks up what
   failed, and check `EmbeddingsFailures`. Then remove the old model, `[new]`. After a
   soak, delete the old model's jobs and drop its tables.

Until the old tables are gone, going back is reordering the list. The old model has no
vectors for what was written since the swap, so run step 3 for it, with the time of
the swap.

## Usage

The Embedder service is stateless and takes no arguments. Multiple instances
of the service may be started in order to match embedding load, or to
catch up on history more quickly, as long as they all list the same models.

## Resources

### PG as a Job Queue

- https://leontrolski.github.io/postgres-as-queue.html
- https://www.2ndquadrant.com/en/blog/what-is-select-skip-locked-for-in-postgresql-9-5/
