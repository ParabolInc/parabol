On startup, Embedder queries EmbeddingsIndex to see if at least 1 record exists for each model for each objectType
If an objectType for a model isn't found, it seeks a lock on redis key objectBuilder:${objectType}:${model}. If it's achieved, that embedder becomes IndexBuilder. If it's not achieved, it listens for redis to tell it the queue is created by subscribing to objectBuilder:${objectType}:${model}:complete
IndexBuilder iterates through EmbeddingsObjectTypeEnum.
It has a handler for each, e.g. for retrospectiveDiscussionTopic
it batches through NewMeeting extracting the id of each meeting from r.minval to r.now() (new items ignored, they are handled by GQL Executor).
It creates a row in EmbeddingsIndex for each item. on conflict it does nothing.
When complete, IndexBuilder becomes QueueBuilder
it left joins to Embeddings*% and filters for null to create a list of objects without embeddings. This job queue is pushed to a redis stream via xadd
On crash, an embedder can skip IndexBuilder and become QueueBuilder if prompted (Out of scope, but this supports redis without persistence if we want to build it later)
it publishes objectBuilder:${objectType}:${model}:complete to alert all Embedders to begin work. Those embedders do not start work until they exit QueueBuilder mode.
finally, Embedders subscribe to the queue via .xreadgroup(). They use xautoclaim to support failover. they ack when the job is done. they call xclaim if a task is taking longer than expected. see https://cschleiden.dev/blog/2022-04-08-task-queue-with-redis
Once Embedder has an item, it acts as ObjectBuilder & computes embedText & writes it to the DB table
After computing embedText, it sends it to the LLM endpoint to get embeddings. on return, it writes that to the Embeddings*% table
Finally, it calls ACK to redis to report the job as complete

### Embedder

Getting embeddings in our system involves 2 steps
Step 1: All future embeddings get put into a job queue and are processed ASAP
Step 2: We migrate all older embeddings by looking at the metadata table. setting `end = min(oldest metadata item, r.maxval)`, and then running the embedder from `0 to end`.

For step 2 we don't want to stick all the logic in the migration, but we don't want migrations that are mutable.
So, what we may do is attempt to import it & call it. Perhaps we have a file like `migrateOldDiscussions.ts` which then calls the embedder. that way all we have to do is leave that file in place as a tombstone if business cases ever change.
