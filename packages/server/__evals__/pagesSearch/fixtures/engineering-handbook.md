# Engineering handbook

This handbook describes how the engineering team works day to day. It is a living document. If something here is out of date, fix it in the same pull request that changes the behavior, and ask a teammate to review the wording.

## How we work

We work in two-week sprints that start on Monday. Planning is Monday at 10 am, the demo is the second Wednesday, and the retro is the last Friday of the sprint. Everyone writes a standup update in the standup tool by 10:30 am so teammates in other time zones can read it before their day starts.

Our core hours are 10 am to 3 pm in your local time. Be reachable during those hours and use the rest of the day however works best for you. Default to written, asynchronous communication: if a question can be answered in a message that someone reads later, write the message instead of booking a meeting.

A few working agreements apply to everyone:

- Write it down. Decisions, designs and runbooks belong in documents, not in chat history.
- Prefer public channels. Direct messages are for personal topics only.
- Keep changes small. A pull request that can be reviewed in fifteen minutes will be reviewed the same day.
- Ask for help early. Being stuck for more than two hours is a signal to pair with someone.

New hires receive a pre-configured laptop the week before they start. The disk encryption profile installs automatically the first time you sign in. If your laptop is lost, stolen or broken, tell the IT desk right away and use the replacement request form. Engineers can choose between two laptop models and one external monitor.

## Code review

Every pull request needs two approvals before it can merge to main, and at least one approval must come from a member of the team that owns the code. Nobody merges their own pull request without a second approval, even for a one-line fix.

Reviewers aim to respond within one business day. If you are the author and nobody has looked after a day, post the link in the team channel and tag the code owners. If you are a reviewer and cannot get to it, say so and hand it to someone else instead of letting it sit.

Good pull requests share a few traits:

1. They stay under about 400 lines of changed code. Larger changes should be split or discussed in a design review first.
2. They explain why the change exists, not just what it does.
3. They include tests, or say why tests are not practical.
4. They call out database migrations, feature flags and anything that needs a coordinated deploy.

When you leave a comment that is a matter of taste, start it with "nit:" so the author knows it is optional. When you leave a blocking comment, say what would change your mind. Draft pull requests are welcome for early feedback and do not need approvals.

## Shipping to production

Every merge to main runs the test suite, builds an image and deploys it to staging automatically. A deploy to production is a button in the deploy dashboard. It sends the build to 5% of traffic first, waits ten minutes, then rolls out to everyone.

We do not deploy after 2 pm on Fridays. If something is urgent enough to break that rule, the on-call engineer and one other senior engineer must agree in the team channel, and the person deploying stays online until the rollout has finished.

Use feature flags for anything customer-facing. Flags default to off and are enabled gradually. A flag that has been fully enabled for 30 days gets a cleanup ticket, and the cleanup ticket is part of the next sprint.

Database migrations must be backward compatible with the previous release. Use two steps: first expand (add the new column or table and write to both), then contract (remove the old one) in a later release. Never rename a column in a single release.

Roll back first and investigate second. If the error rate stays above 2% for five minutes after a deploy, roll back without waiting for a root cause. The rollback button in the dashboard returns to the previous build in about two minutes.

## Incidents and on-call

We classify incidents by customer impact:

- SEV1: customers cannot send or receive payments, or data is at risk.
- SEV2: a major feature is degraded or a large group of customers is affected.
- SEV3: a minor feature is broken and there is a workaround.

The primary on-call engineer takes pages first. See the on-call rotation page for the current schedule and the escalation contacts. Acknowledge a page within ten minutes. If you cannot, say so in the platform channel so the secondary can step in.

When you declare an incident, open a dedicated channel named inc-YYYYMMDD-short-name, post what you know, and name an incident commander. The commander coordinates, writes the timeline and decides when to escalate. Everyone else investigates and reports findings in the channel.

We write a blameless postmortem within five business days of every SEV1 and SEV2. A postmortem describes what happened, why, what went well, what went poorly and which action items we will do, with owners and dates. We review open action items every sprint.

On-call is compensated with one day of time off for each week as primary. Take it within the following month.

## Documentation

Documentation lives next to the code whenever possible. Every service has a README that explains what it does, how to run it locally and who owns it. Every service also has a runbook that lists its alerts and what to do when each one fires.

Decisions that are expensive to reverse get an architecture decision record. Keep it short: the context, the options we considered, the decision and the consequences. Store records in the decisions folder of the repository so they are reviewed like code.

Review runbooks and READMEs once a quarter. Anyone who follows a runbook during an incident and finds it wrong should fix it before closing the incident.

## Learning and growth

Each engineer has a learning budget of 1,200 dollars per year for books, courses and conference tickets. You do not need approval for purchases under 100 dollars. For conferences, share a short write-up with the team afterwards.

We hold a pairing hour every Friday at 2 pm and an internal tech talk on the first Thursday of the month. Anyone can propose a talk, and the best ones come from problems you solved recently.

Every new hire gets an onboarding buddy for the first 90 days. Buddies answer questions that feel too small to ask the manager, introduce people across teams and check in once a week.
