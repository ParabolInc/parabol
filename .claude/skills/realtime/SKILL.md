---
name: realtime
description: How Parabol's realtime layer behaves — the GraphQL websocket (graphql-ws, Atmosphere, uWebSockets.js), Yjs/Hocuspocus documents and their limits, meeting presence, rollouts and deploy drains, Google load balancer 502/503s, and the metrics that watch them. Use when changing sockets, subscriptions, Pages or meeting presence, or investigating socket errors, 502s or realtime alerts.
---

# Realtime

## GraphQL socket

- **graphql-ws re-sends every unfinished operation on a new socket, mutations included**, so a drop after the server ran a mutation can run it twice. Keep that in mind before routing a mutation over the socket or changing reconnect behavior.
- The client (`utils/createWSClient.ts`, `Atmosphere.ts`) retries forever with capped backoff and falls back to HTTP while `atmosphere.isSocketConnected` is false. Subscriptions are held with `atmosphere.retainSubscription` (`useAppSubscriptions`).
- **`activeClients` is set in `onConnect` and removed in `onDisconnect`, but graphql-ws only calls `onDisconnect` for an acknowledged socket.** A socket that closes while `onConnect` awaits must be removed there, or the gauge leaks.
- **Deploys drain sockets** on a schedule (`socketDrainSchedule.ts`, `WEB_SERVER_RECONNECT_WINDOW`), closing each GraphQL socket once it's idle rather than mid-operation.

## HTTP 502/503 behind Google's load balancers

Check the LB log's `statusDetails` before blaming the app or the LB type.
- **`backend_connection_closed_before_data_sent_to_client`** (~20–300 ms): uWebSockets.js closes an idle keep-alive connection after ~10 s (compile-time, no option) while the LB reuses backend connections for up to 600 s. The classic LB answers 502, the Envoy one 503. `Atmosphere` resends a query once on either; mutations aren't retried, since a 502 can also follow a crash after the server ran them.
- **`internal_error` (Envoy) / `backend_interim_response_not_supported` (classic) on `/yjs` or `/`:** a client proxy or antivirus stripped `Upgrade`/`Connection` but kept `Sec-WebSocket-Key`, and uWS upgrades on the key alone, so the LB gets a 101 to a plain GET. `utils/rejectNonWebSocketUpgrade.ts` answers 400 instead, and the client shows the firewall snackbar after repeated handshakes that never open. Such bursts usually come from one IP (Hocuspocus retries forever).
- Reading LB logs: `gcloud logging read 'resource.type="http_load_balancer" AND httpRequest.status=502' --project=<project>`.

## Metrics and alerts

- **Google Managed Prometheus drops the first sample of every new series.** prom-client creates a labeled series only at its first observation, so whatever it counts before the first scrape on a new pod is lost, while an unlabeled counter keeps it. Any metric an SLO or alert compares with another must exist from startup: `zero()` (or `inc(labels, 0)`) every known label set, as `metricsHandler.ts` does for `websocketConnectDuration`.
- **A socket-count drop at a rollout isn't lost live updates.** 5–10% of sockets belong to browsers whose JS isn't running (frozen or sleeping tabs, sleeping machines) whose network stack still answers pings; they reconnect when they wake. Count from LB websocket lifetimes or subtract that pool before calling a drop real.

## Yjs and Hocuspocus

### Socket limits

Every Yjs doc a tab opens (Pages, and `meeting:<id>` awareness docs) shares one socket, and on each reconnect every provider sends Auth + SyncStep1 + Awareness at once. Limits in `@hocuspocus/server` and `hocusPocus.ts`:
- `maxPendingDocuments` (500): docs whose auth is in flight; over it, the whole socket resets.
- `maxUnauthenticatedQueueMessages` (1000): after a doc is denied, its later messages (awareness renews every 15 s) queue until the socket closes, so rejected docs fill the queue and reset the socket. Detach a doc once it's denied.
- `timeout` (60 s): a socket that authenticates no doc is closed and reconnects every ~60–70 s.
- `utils/tiptap/throttleRefusedAuthentication.ts` bans a user (or, signed out, an IP) for a minute after 100 `Unauthorized`/`InvalidDocument` refusals in a minute, in memory per pod.

Keep anything that registers Yjs docs per list item bounded (only cards settled on screen). "Meeting awareness requires a userId" means the upgrade carried no auth cookie, e.g. after signing out in another tab.

### Presence

y-protocols awareness times a client out after 30 s without renewal, and Chrome throttles a hidden tab's renewal timer to once a minute. Presence still holds: the hidden client receives its own removal (websockets aren't throttled) and re-sends at once, and `useConnectedMeetingMembers` waits 1 s before marking anyone gone. People do drop when a tab is frozen or the machine sleeps, and rejoin at the end of the list. Measure before blaming awareness for avatar churn. Yjs sockets reconnect within ~20 s at a rollout, and meetings handle it.

### Anything anchored to Page text

With `@tiptap/y-tiptap`:
- **A remote Yjs change replaces the whole ProseMirror doc**, so `tr.mapping` is useless for remote transactions. Detect them with `tr.getMeta(ySyncPluginKey)?.isChangeOrigin`.
- **Relative positions are orphaned whenever the binding rebuilds a block** (splitting a paragraph, changing its type, wrapping it in a list, moving it). Anything that must stay on text has to be a mark in the content, not a stored relative position.
- **An unknown mark or node type makes a client delete that content from the shared doc.** Stale tabs aren't force-reloaded, so a new mark or node must ship in the schema first, with its creation gated off, until old tabs have cycled.
- A mark that may overlap itself (`excludes: ''`) is stored under a hashed attribute name; derive it by round-tripping a tiny doc through `TiptapTransformer.toYdoc` rather than re-implementing the hash.
- Commenters and viewers connect read-only, so anything they add to a doc is written by the server through a `hocusPocusCustomEvents` handler.

## Meeting start cost

At a meeting start, the `JoinMeetingSuccess` broadcast (the whole meeting, to every member, for every join) is 70–90% of socket-server CPU: at 100 people, ~3,600 broadcasts and over 500 MB. Shrinking it is the lever, not `phases` row-lock contention. But clients join, then subscribe, then fetch, so a joiner can miss a teammate's stage: a smaller broadcast needs the subscription to signal it's ready before the client fetches.
