# Service architecture

Overview how the different services interact with each other.

## Flow

Data flow for a GraphQL request which also publishes subscription data.

```mermaid
flowchart TD
  Client
  Server[Websocket/Subscription server]
  RedisStream(Redis Stream)
  RedisResultPubSub(Redis PubSub\ngqlExRes)
  RedisSubscriptionPubSub(Redis PubSub\nTeam.teamId)
  subgraph "per executor {executorChannel}"
    GQLExecutor[GraphQL Executor]
    RedisServerPubSub(Redis PubSub\nexecutorChannel)
    RedisServerPubSub --> GQLExecutor
  end

  click Server "../packages/server/server.ts"
  click RedisResultPubSub "../packages/server/utils/getPubSub.ts"
  click GQLExecutor "../packages/gql-executor/gqlExecutor.ts"

  Client <---->|Websocket| Server
  Server -->|gqlStream| RedisStream -->|gqlConsumerGroup| GQLExecutor
  GQLExecutor --> RedisResultPubSub
  GQLExecutor --> |"{executorChannel}"| RedisSubscriptionPubSub
  RedisSubscriptionPubSub --> |"{executorChannel}"|Server
  Server --> RedisServerPubSub
  RedisResultPubSub --> Server
```

## Sequence

Example sequence of a mutation `updateTeamName`.

```mermaid
sequenceDiagram
  participant Client
  participant Server
  participant Redis
  participant GQLExecutor

  Client ->>+ Server: updateTeamName
  Server ->> Redis: gqlStream
  Redis ->>+ GQLExecutor: gqlConsumerGroup
  note over GQLExecutor: resolve mutation
  par Resolve and return result
    GQLExecutor ->> Redis: gqlExRes
    Redis ->> Server: gqlExRes
    Server ->>- Client: execution result
  and Publish subscription
    GQLExecutor ->>- Redis: Team.teamId
    Redis ->>+ Server: Team.teamId
    Server ->> Redis: executorChannel
    Redis ->>+ GQLExecutor: executorChannel
    note over GQLExecutor: resolve subscription
    GQLExecutor ->>- Redis: gqlExRes
    Redis ->> Server: gqlExRes
    Server ->>- Client: subscription next
  end

```
