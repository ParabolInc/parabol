# `GraphQL Executor`

> A Stateless GraphQL Execution Service

## Usage

Each GraphQL Executor is a consumer in the consumer group `ServerChannel.GQL_EXECUTOR_CONSUMER_GROUP`.
That consumer group listens to the stream `ServerChannel.GQL_EXECUTOR_STREAM`.
When the group receives a message, redis delegates it to one of the consumers.
it receives a request, it creates a standard GraphQL Response and publishes it to `ServerChannel.GQL_EXECUTOR_RESPONSE `.
