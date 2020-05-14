# `GraphQL Executor`

> A Stateless GraphQL Execution Service

## Usage

GraphQL Executor is subscribed to the redis channel `ServerChannel.GQL_EXECUTOR_REQUEST`.
When it receives a request, it creates a standard GraphQL Response and publishes it to `ServerChannel.GQL_EXECUTOR_RESPONSE `.
