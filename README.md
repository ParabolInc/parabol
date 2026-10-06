# Parabol

[Parabol](https://www.parabol.co) is an open-source collaborative workspace for running structured, effective, and inclusive team meetings and for measuring team health. It supports retrospectives, sprint planning, standup meetings, check-ins, agile estimation, collaborative documentation, and anonymous team health checks (pulse surveys built on psychological safety research) — all in real time with a GraphQL API.

Parabol is easily **self-hosted** on your own infrastructure and works in **air-gapped environments** with no external dependencies required. It runs on Node.js + PostgreSQL + Valkey and can be deployed on-premise, in a private cloud, or in a fully isolated network — making it a strong choice for enterprises, government agencies, and security-conscious teams that cannot use SaaS tools.

Try a no-login demo:

- Retrospective: https://parabol.co/retro-demo
- Team Health check: https://action.parabol.co/team-health-demo

---

## What Parabol Does

Parabol helps software teams and agile practitioners facilitate:

- **Pages** — real-time collaborative documents powered by [Yjs](https://yjs.dev/), scoped to teams or personal workspaces. Pages integrate directly with meetings, so notes, decisions, and action items live alongside the work that created them. Many teams upgrade from Confluence to Parabol Pages as their self-hosted knowledge management system — getting a Confluence alternative that is open-source, easier to operate, and purpose-built to connect documentation with the meetings where decisions are actually made.
- **Retrospectives** — structured reflect/group/vote/discuss/action workflow; compatible with formats like Start/Stop/Continue, 4Ls, Mad/Sad/Glad, and custom templates
- **Sprint Poker (Story Point Estimation)** — async-safe planning poker with Fibonacci, T-shirt sizing, or custom scales; integrates with Jira, GitHub, GitLab, Linear, and Azure DevOps
- **Check-In Meetings (Action)** — agenda-driven team sync with icebreakers, task review, and action items
- **Standup / Team Prompt** — async standup via written responses, optionally recurring on a schedule
- **Team Health** — anonymous team health check / pulse survey built from research-backed question packs (Google Project Aristotle, Amy Edmondson's Psychological Safety scale, Gallup Q12, Spotify Squad Health Check, Atlassian Team Health Monitor, and more); answers on a 1–5 scale, results revealed by category, then discussed and turned into tasks
- **Tasks** — Kanban-style task board (active, stuck, done, future) shared across meetings and linked to external issues

Meeting outcomes (summaries, action items, tasks) are automatically captured and can be pushed to integrations.

---

## Team Health: engagement surveys that end in action

Parabol Team Health is an open-source **team health check tool** and **employee engagement survey** for software and agile teams — an alternative to Officevibe, Culture Amp, Workday Peakon, 15Five, and TeamMood that lives where the team already works instead of in a separate HR platform.

- **Research-backed question packs** — measure the five dynamics from Google's Project Aristotle (Psychological Safety, Dependability, Structure & Clarity, Meaning, Impact) using validated instruments: Edmondson's Psychological Safety assessment, Lencioni's Five Dysfunctions, Hackman's Team Diagnostic, Gallup Q12, Spotify Squad Health Check, Atlassian Team Health Monitor, Google Project Oxygen, and David Rock's SCARF model. Add your own questions and categories, or mix packs into a custom template.
- **Anonymous by design** — pulse-survey answers stay hidden until the check closes, small response sets are never attributed to a person, and comments can be AI-paraphrased so writing style can't identify the author. Honest feedback needs real anonymity, not a checkbox.
- **Continuous listening on a cadence** — run a health check weekly, per sprint, or monthly across one team or every team in the organization, with Slack and in-app reminders to keep participation high.
- **Insight into action** — every category becomes a discussion thread with comments and tasks, so a low psychological-safety or engagement score turns into a retro topic or an action item rather than a number on an HR dashboard. Meeting summaries capture the outcome.
- **Self-hosted and private** — engagement data stays on your infrastructure, in a private cloud or an air-gapped network.

Learn more at https://www.parabol.co/agile/team-health-check-tool/ or run the sample check at https://action.parabol.co/team-health-demo.

---

## GraphQL API

Parabol exposes a public GraphQL API.

- **Endpoint:** `https://action.parabol.co/graphql`
- **Schema SDL:** `https://action.parabol.co/graphql/schema.graphql`
- **GraphiQL Explorer:** `https://action.parabol.co/graphql` (in browser)

### LLM & Developer References

- [`llms.txt`](./llms.txt) — concise API overview for LLMs and developers (auth, scopes, key operations)
- [`llms-full.txt`](./llms-full.txt) — full reference with example GraphQL queries and mutations

---

## Integrations

Parabol integrates with:

- **Jira Cloud & Jira Data Center (Jira Server)** — import backlog, push estimates, create issues
- **GitHub** — import issues, push estimates as labels
- **GitLab** — import issues, push estimates
- **Linear** — import issues, push estimates
- **Azure DevOps** — import work items, push estimates
- **Slack** — meeting notifications, topic sharing
- **Mattermost** — meeting notifications
- **Google Calendar** — create calendar events when starting meetings
- **Microsoft / Azure AD** — SSO login

---

## Stack

| Concern | Solution |
|---|---|
| Server | [Node.js](https://nodejs.org/) |
| Server Framework | [μWebSockets.js](https://github.com/uNetworking/uWebSockets.js) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| PubSub & Cache | [Valkey](https://valkey.io) |
| API | [GraphQL](https://github.com/graphql/graphql-js) |
| Real-time | [graphql-ws](https://github.com/enisdenjo/graphql-ws) (WebSockets) |
| Client Cache | [Relay](https://facebook.github.io/relay/) |
| UI Framework | [React](https://facebook.github.io/react/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/)

**Production:** PostgreSQL, Valkey
**Development:** [Docker Compose](https://docs.docker.com/compose/install/), [Watchman](https://facebook.github.io/watchman/docs/install.html)

> **Note:** `text-embedding-inference` is resource intensive. You may need to increase Docker's memory limit to 16 GB+ (Docker Desktop → Settings → Resources).

### Installation

```bash
git clone https://github.com/ParabolInc/parabol.git
cd parabol
cp .env.example .env   # add your own vars
pnpm i
pnpm db:start
pnpm dev
```

App runs at: https://localhost:3000/

### Deploy

```bash
# Workaround for a pnpm SSH key bug: https://github.com/pnpm/pnpm/issues/7243
git config --global url."https://github.com/enahum/redux-offline.git".insteadOf git@github.com:enahum/redux-offline.git
pnpm i && pnpm build && pnpm predeploy && pnpm start
```

### Developer Docs

- [Code Reviews](./docs/codeReview.md)
- [Create new GraphQL Mutations](./packages/server/graphql/public/README.md)
- [Docker](./docker/README.md)
- [File Storage (CDN, Local, S3)](./packages/server/fileStorage/README.md)
- [GraphiQL, Private Schema Admin](./packages/server/graphql/private/README.md)
- [Integrations (GitHub, Jira, Slack, etc.)](./docs/integrations.md)
- [PostgreSQL](./packages/server/postgres/README.md)
- [How to Ship](./docs/deployment.md)

---

## Core Team & Maintainers

- [Jordan Husney](https://github.com/jordanh)
- [Terry Acker](https://github.com/ackernaut)
- [Matt Krick](https://github.com/mattkrick)
- [Georg Bremer](https://github.com/Dschoordsch)

## License

Copyright (c) 2016-present, Parabol, Inc.

Dual-licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3.0 while holding, at Parabol's sole discretion, the right to create new licenses. See [LICENSE](LICENSE).
