# `Embedder`

This service builds embedding vectors for semantic search and for other AI/ML
use cases. It does so by:

1. Homogenizes different types of data into a single `EmbeddingsMetadata` table
2. Each new row in `EmbeddingsMetadata` creates a new row in `EmbeddingsJobQueue` for each model
3. Uses PG to pick a job from the queue and sets the job from `queued` -> `embedding`,
   then `embedding` -> [deleting the `EmbeddingJobQueue` row]
4. Embedding involves creating a `fullText` from the work item and then a vector from that `fullText`
5. New jobs to add metadata are sent via redis streams from the GQL Executor
6. If embedding fails, the application increments the `retryCount` and increases the `retryAfter` if a retry is desired
7. If a job gets stalled, a process that runs every 5 minutes will look for jobs older than 5 minutes and reset them to `queued`

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

  Example:

`AI_EMBEDDING_MODELS='[{"model": "text-embeddings-inference:llmrails/ember-v1", "url": "http://localhost:3040/"}]'`

- `AI_GENERATION_MODELS`: JSON configuration for which AI generation
  models (i.e. GPTS are enabled). These models are used for summarization
  text to be embedded by an embedding model if the text length would be
  greater than the context window of the embedding model. Each model in
  the array will be instantiated by `ai_models/ModelManager`.
  See `ai_models/ModelManager` for which configurations are supported.

  Example:

`AI_GENERATION_MODELS='[{"model": "text-generation-inference:TheBloke/zephyr-7b-beta", "url": "http://localhost:3050/"}]'`

## Usage

The Embedder service is stateless and takes no arguments. Multiple instances
of the service may be started in order to match embedding load, or to
catch up on history more quickly.

## Resources

### PG as a Job Queue

- https://leontrolski.github.io/postgres-as-queue.html
- https://www.2ndquadrant.com/en/blog/what-is-select-skip-locked-for-in-postgresql-9-5/
