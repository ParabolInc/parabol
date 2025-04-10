# Service architecture

Overview how the different services interact with each other.

## Flow

Data flow for a GraphQL mutation by Client 1 which also publishes subscription data to Client 2.
The example shows a deployment with 2 servers.

```mermaid
flowchart LR
  Client1(Client 1)
  Client2(Client 2)
  Server1(Server 1 - GraphQL Resolver)
  Server2(Server 2 - GraphQL Resolver)
  RedisSubscriptionPubSub(Redis PubSub)

  click Server1 "../packages/server/server.ts"

  Client1 <--->|Websocket| Server1
  Server2 --->|Websocket| Client2
subgraph Server
  direction LR
  Server1 --->|publish subscription root value| RedisSubscriptionPubSub
  RedisSubscriptionPubSub <---|root value| Server2
end
```

## Sequence

Example sequence of a mutation `updateTeamName`.

```mermaid
sequenceDiagram
  participant Client
  participant Server
  participant Redis

  par Resolve mutation
    Client ->>+ Server: updateTeamName
    note over Server: resolve mutation
    Server ->> Redis: publish Team.teamId
    Server ->>- Client: execution result
  and Resolve subscription
    Redis ->>+ Server: Team.teamId
    note over Server: resolve subscription
    Server ->>- Client: subscription next
  end

```
