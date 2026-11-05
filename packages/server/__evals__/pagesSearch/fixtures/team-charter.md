# Platform team charter

This charter explains what the Platform team is for, what we own and how we work with the rest of the company. It was last reviewed in October and is reviewed again every quarter.

## Mission

We make it safe and boring for other teams to ship. That means a deploy pipeline people trust, infrastructure that stays up, and tools that remove toil. When we succeed, product engineers rarely think about us.

We measure ourselves by what product teams experience: how quickly a merged change reaches customers, how often a change causes a problem and how quickly we recover when one does.

## Scope

We own:

- The build, test and deploy pipeline, including the deploy dashboard and the rollback button.
- Production infrastructure: compute, databases, queues, networking and the staging environment.
- Observability: logs, metrics, traces, alerts and the paging policy.
- The on-call rotation and incident process.
- Developer tooling such as local environments and shared libraries.

We do not own:

- Application features and their business logic. Product teams own those, including the alerts for their own code.
- Customer support tooling. Support owns it and we advise.
- Security policy. The security desk sets it and we implement the infrastructure side.

If a request falls in a gray area, we start a conversation rather than guessing. The default is to help first and sort out ownership afterwards.

## Ways of working

We run two-week sprints that line up with the product teams. Planning, demo and retro happen on the same days so that cross-team work is easy to schedule. Each sprint has one planned theme, for example reliability or developer speed, and about 20% of capacity stays free for interrupts.

Work arrives through the platform request form. Requests are triaged every Tuesday and get an answer within three business days: accepted, scheduled for a later sprint, or declined with a reason. Urgent production problems skip the queue and go straight to the on-call engineer.

We hold office hours every Wednesday at 3 pm. Anyone can bring a question, a half-formed idea or a problem they cannot reproduce. We write short notes afterwards in the platform channel so people who missed it can follow along.

## Decision making

Every significant decision has a directly responsible individual, the DRI, who gathers input and makes the call. The DRI does not need consensus but does need to listen and explain the decision. When people disagree after that, they disagree and commit.

We write decisions down in the decision log, a single page with one entry per decision: the date, the DRI, the context, the options and what we chose. We link the log from every design document. A decision that is hard to reverse also gets an architecture decision record in the repository.

We separate decisions into two kinds. Two-way doors, such as choosing a logging library for a service, can be made quickly by one person and changed later. One-way doors, such as moving to a new database engine, need a written proposal, review by at least two engineers outside the team and a week for comments.

## Communication

The platform channel is the front door. Questions, announcements and incident updates go there. We avoid direct messages for anything another team might benefit from reading later.

Every Friday we send a short written update to the engineering channel: what shipped, what is coming, which incidents happened and what we learned. During an incident, the incident commander posts updates at least every thirty minutes until the incident is resolved.

We publish a roadmap each quarter and share it with product leads before it is final, so there are no surprises. Changes to the roadmap are announced in the Friday update.

## Working with product teams

Each product team has a named Platform partner, rotated every six months, who joins their planning once a sprint. The partner brings upcoming infrastructure changes, hears what is slowing the team down and takes small requests directly. Bigger requests go through the request form so they can be prioritized fairly.

We run a quarterly survey of product engineers with five questions about deploys, tooling, incident response, documentation and how easy it is to get help. We publish the results, including the uncomfortable ones, and pick one theme to improve in the next quarter.

When a product team asks us to review a design, we review it within two business days and focus on operability: how it fails, how it is monitored and how it will be rolled back.

## Metrics we own

- Deploy frequency: how often we ship to production. Our target is at least one deploy per day per service.
- Change failure rate: the share of deploys that cause an incident or a rollback. Our target is under 10%.
- Time to restore: how long it takes to recover from a SEV1 or SEV2. Our target is under one hour.
- Availability: we hold an error budget based on a 99.9% monthly target for the invoice API. When the budget is spent, reliability work comes before new features.
- Latency: the p95 response time of the invoice API stays under 400 milliseconds.
- On-call load: pages per on-call week, with a target of 12 or fewer.

## Joining the team

New members spend their first two weeks shadowing the on-call rotation and pairing with someone on a small pipeline improvement. By the end of the first month, they ship a change to the deploy pipeline and write a runbook for a service they did not build. In the second month they join the secondary on-call slot. By the end of the third month they take a primary week, with a buddy on call as backup.

We ask every new member to fix one thing in this charter or the runbooks during their first month. Fresh eyes find the unclear parts quickly.

## How we change this charter

Anyone on the team can propose a change by opening a pull request against this document. Changes are discussed in the Wednesday office hours or in the team retro and are accepted by the DRI for the charter, currently the team lead. We review the whole charter every quarter and remove anything we no longer do. A charter that nobody reads is worse than none, so we keep it short and honest.
