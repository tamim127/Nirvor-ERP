# Realtime and WebSocket Strategy

## 1. Appropriate use cases

- In-app notifications
- Approval status updates
- Presence indicators where useful
- Live operational dashboards
- Collaboration features if validated

Do not use WebSockets for data that can be efficiently fetched or updated through normal HTTP.

## 2. Security

- Authenticate the connection.
- Authorize each subscription and action.
- Derive tenant membership from trusted identity.
- Revalidate permissions for sensitive subscriptions.
- Prevent client-selected arbitrary tenant rooms.
- Limit connections, subscriptions, message size, and message frequency.
- Avoid sending confidential payloads to broad rooms.

## 3. Scaling

A multi-instance deployment requires a shared pub/sub or message distribution layer. Sticky sessions alone are not a correctness strategy. Redis adapter or another broker may be evaluated. Select based on delivery semantics, scale, and operations.

## 4. Reliability

- Clients reconnect with backoff and jitter.
- Support missed-event recovery through cursor/sync APIs.
- Treat realtime messages as hints; fetch authoritative state over API.
- Monitor connection count, fan-out, dropped messages, and delivery lag.
- Apply backpressure and disconnect abusive clients.
