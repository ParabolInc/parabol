# `GraphQL Executor`

> A Stateless GraphQL Execution Service

## Usage

Each GraphQL Executor is a consumer in the consumer group `ServerChannel.GQL_EXECUTOR_CONSUMER_GROUP`.
That consumer group listens to the stream `ServerChannel.GQL_EXECUTOR_STREAM`.
When the group receives a message, redis delegates it to one of the consumers.
A consumer receives the request & the consumer then creates a standard GraphQL Response and publishes it back to the server that sent the message by reading the `socketServerId` in the message payload.
