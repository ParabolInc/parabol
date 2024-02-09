# `Embedder`

This service builds embedding vectors for semantic search and for other AI/ML
use cases. It does so by:

1.  Updating a list of all possible items to create embedding vectors for and
    storing that list in the `EmbeddingsMetadata` table
2.  Adding these items in batches to the `EmbeddingsJobQueue` table and a redis
    priority queue called `embedder:queue`
3.  Allowing one or more parallel embedding services to calculate embedding
    vectors (EmbeddingJobQueue states transistion from `queued` -> `embedding`,
    then `embedding` -> [deleting the `EmbeddingJobQueue` row]

    In addition to deleteing the `EmbeddingJobQueue` row, when a job completes
    successfully:

    - A row is added to the model table with the embedding vector; the
      `EmbeddingMetadataId` field on this row points the appropriate
      metadata row on `EmbeddingsMetadata`
    - The `EmbeddingsMetadata.models` array is updated with the name of the
      table that the embedding has been generated for

4.  This process repeats forever using a silly polling loop

In the future, it would be wonderful to enhance this service such that it were
event driven.

## Prerequisites

The Embedder service depends on pgvector being available in Postgres.

The predeploy script checks for an environment variable
`POSTGRES_USE_PGVECTOR=true` to enable this extension in production.

## Configuration

The Embedder service takes no arguments and is controlled by the following
environment variables, here given with example configuration:

- `AI_EMBEDDER_ENABLE`: enable/disable the embedder service from
  performing work, or sleeping indefinitely

`AI_EMBEDDER_ENABLED='true'`

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

`AI_GENERATION_MODELS='[{"model": "text-generation-interface:TheBloke/zephyr-7b-beta", "url": "http://localhost:3050/"}]'`

## Usage

The Embedder service is stateless and takes no arguments. Multiple instances
of the service may be started in order to match embedding load, or to
catch up on history more quickly.
