# `Embedder`

This service builds embedding vectors for semantic search and for other AI/ML
use cases. It does so by:

1. Homogenizes different types of data into a single `EmbeddingsMetadata` table
2. Each new row in `EmbeddingsMetadata` creates a new row in `EmbeddingsJobQueue` for each model
3. Uses PG to pick a job from the queue and sets the job from `queued` -> `embedding`,
   then `embedding` -> [deleting the `EmbeddingJobQueue` row]
4. Embedding involves creating a `fullText` from the work item and then a vector from that `fullText`
5. New jobs to add metadata are sent via valkey streams from the GQL Executor
6. If embedding fails, the application increments the `retryCount` and increases the `retryAfter` if a retry is desired
7. If a job gets stalled, a process that runs every 5 minutes will look for jobs older than 5 minutes and reset them to `queued`
8. A page job waits until 15 seconds after the page's last save (`runAfter`). Each save pushes it back, so a page is embedded once its edits settle, but it becomes due no later than 2 minutes after the job was queued or last started, so a page someone keeps typing in is still embedded while they type. Jobs that are due still run in priority order. A save that lands while the page is being embedded queues the job again when it finishes. If that run fails instead, the page waits for its next save
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

  Each entry is a generation: its id in `ai_models/modelIdDefinitions` names
  its tables, the page chunker it embeds with (`markdown` or `sections`), and
  the vector floor and alpha that page search uses while it is first in the
  list. Search uses the first entry. Page and metadata updates are queued for
  every entry, so a second entry fills up beside the first one. Adding an entry
  creates its tables and queues nothing else.
  To cut over, move the new entry first; to roll back, move it back.
  Deploy the code that defines a generation before listing it: the embedder
  stops on an id it doesn't know, and the web servers skip it. A tag
  after `#` in an id (`...ONNX-INT8#v3`) names a new generation of the same
  model. TEI never sends the id, but the vLLM client sends it as the model
  name, so a tagged generation needs TEI.

- `AI_GENERATION_MODELS`: JSON configuration for which AI generation
  models (i.e. GPTS are enabled). These models are used for summarization
  text to be embedded by an embedding model if the text length would be
  greater than the context window of the embedding model. Each model in
  the array will be instantiated by `ai_models/ModelManager`.
  See `ai_models/ModelManager` for which configurations are supported.

  See .env.example

## Usage

The Embedder service is stateless and takes no arguments. Multiple instances
of the service may be started in order to match embedding load, or to
catch up on history more quickly.

## Background run

A new generation fills in the background once an admin starts a run with the
private `buildEmbeddings(input: {run: {modelId, action}})` mutation. The
`action` is `start`, `pause`, `resume` or `status`, and every call returns the
pages the run has left. A run copies from the generation that was active when
it started, and keeps going after a cutover. Once a minute, one embedder:

1. Copies meeting template and discussion vectors from that generation
   (`copyMetadata: true`), or queues them to be embedded again. Copy only when
   both generations use the same model and pooling, so the vectors would be
   the same.
2. Queues the next pages that have vectors in that generation and none in the
   new one, newest first, until `queueSize` jobs (1000 by default) are waiting.
   They sit at the lowest priority, behind searches and edits. A cursor moves
   past every page it offers, so a page that never gets vectors (one with no
   text to chunk, or one whose embed keeps failing) is offered once. Pages that
   were never embedded stay out.
3. Logs `Embeddings run <id>: queued <n> pages and <n> metadata rows, down to
   pages updated <time>`, and `done` once it has offered every page.

The run's settings are a Valkey hash, `embeddingsRun`, and its cursors are
`embeddingsRunProgress:<id>`; everything else comes from the tables, so
restarts and deploys don't lose progress. `status` counts what is done from
the tables. Cut over once the recent pages are done; the run then finishes the
older pages, which also convert on their next edit or search.

## Embed on search

When someone searches pages, the pages they can open that have at least 200
bytes of text and no vectors in a configured generation are queued for that
generation, newest first and at most 500, ahead of the background run and
behind edits. That includes pages that were never embedded. It runs at most
once an hour per person and never delays the search.

## Resources

### PG as a Job Queue

- https://leontrolski.github.io/postgres-as-queue.html
- https://www.2ndquadrant.com/en/blog/what-is-select-skip-locked-for-in-postgresql-9-5/
