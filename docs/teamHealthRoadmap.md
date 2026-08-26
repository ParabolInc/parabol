# Team Health Roadmap

Team Health today is a complete **single-cycle** instrument: research-backed question packs,
per-question Likert responses, an anonymity model that withholds results until the meeting ends,
recurrence with auto-reveal, and a per-meeting summary page.

What it is not, yet, is a **trend** product. The only query that spans meetings is `currentStreak`.
A lead who runs a weekly cycle for six months gets 26 disconnected summary pages and no way to
answer "is psychological safety better or worse than it was last quarter?" Every competitor in this
space (Officevibe, Peakon, Culture Amp, 15Five, TeamMood) is fundamentally a trend product.

This document tracks the work to close that gap. Items are ordered by priority, not by sequence.
Checked items name the branch that delivered them.

---

## P0 — Trend data model + lead-facing trend view

The result phase computes per-question means in the browser and never rolls them up into the five
categories, which is the unit leads actually reason in.

- [x] **Server-side score rollup.** `feat/team-health-category-scores`. Add `TeamHealthMeeting.categoryScores`, returning
      `{category, meanScore, normalizedScore, respondentCount, responseCount}` per category. Move the
      1-5 -> 0-100 normalization off the client so the result phase, summary page, summary email, and
      the future Reporting feature all report the same number.
- [x] **Series-spanning trend query.** `feat/team-health-trend`. `Team.teamHealthTrend(...)` returning per-cycle, per-category
      scores plus `participationRate`. Backed by a dataloader that batch-loads responses for a whole
      meeting series in one round trip.
- [x] ~~**Fix the `currentStreak` N+1.**~~ Not a defect — `teamHealthResponsesByMeetingId` is a real
      DataLoader, so the `Promise.all(map(load))` in `currentStreak` already batches into a single
      round trip. Listed here in error on the first pass.
- [x] **Deltas on the result phase.** `feat/team-health-trend`. Per-category change vs. the previous cycle, so the reveal
      answers "did we move?" and not only "where are we?".
- [~] **Trend view.** `feat/team-health-trend` puts single-series sparklines on the reveal's category
      tiles, which covers "did we move?" in the moment. A standalone route — history without opening
      a meeting — is deliberately still open: it overlaps heavily with Reporting's own surface and
      should be designed with it, not ahead of it. The resolver shape is already team-scoped so
      Reporting can widen it across teams without a second data model.

> **Note:** org/multi-team rollup is deliberately *not* in this list. It is being built as a paid
> **Reporting** feature that compares teams over time. Everything above should be designed as its
> per-team foundation: team-scoped resolvers, no derived booleans, anonymity floors enforced in one
> shared helper so Reporting inherits them rather than reimplementing them.

## P0 — Participation

Participation rate is the metric that decides whether a health-check product lives or dies, and it
is currently neither measured nor defended.

- [x] **Measure participation against the team, not the attendees.** `fix/team-health-participation`. The intro phase derives its
      total from `meetingMembers`, i.e. people who opened the meeting, so a cycle can read
      "3 of 3 complete" while 7 of 10 team members never showed up.
- [x] **Persist participation rate per cycle** so it can be trended alongside the scores.
      `fix/team-health-participation` freezes `eligibleCount` onto the meeting when it ends, since
      team membership drifts and a recomputed denominator would rewrite history.
- [x] **Nudge non-responders.** `feat/team-health-response-reminders`. A recurring cycle opens, one generic "meeting started" notification
      fires, and nothing else happens until auto-reveal. Send a reminder to members with no response
      some hours before `scheduledEndTime`.
- [ ] **Answer in place** (Slack modal / email) — optional, but it is the difference between 40% and
      80% participation.

## P0 — Anonymity correctness

Two defects in the anonymity model. Both undermine the guarantee the UI makes to respondents.

- [x] **`commentParaphrased` is never written.** `feat/team-health-comment-paraphrase` writes it at
      reveal time; `fix/team-health-reveal-floor` drops the raw-comment fallbacks. The column, the GraphQL field, and two consumers
      exist, but `setTeamHealthResponse` only writes `comment`. Two consequences: the result phase
      filters on the paraphrase and so its comment block is permanently empty, and the summary table
      falls back to the raw comment and publishes verbatim text to a page the whole team reads.
      Either generate the paraphrase at reveal time or drop the fallback — not neither.
- [x] **No minimum-respondent floor.** `fix/team-health-reveal-floor`. The floor already existed for
      AI insights only; it now lives in one helper every publishing surface consults. A cycle with a single respondent reveals that person's exact
      scores and comments to their team. Withhold the reveal below a threshold and explain why.

## P1 — Close the loop

Parabol already owns retros, discussions, and tasks. Nobody else in this category does. Today a low
category score is a dead end — a number on a card.

- [ ] Turn a category or a comment into a retro topic, a discussion, or a task.
- [ ] Carry an unresolved category into the next cycle so the loop visibly closes.

## P2 — Correctness and parity gaps

- [x] **Engagement is miscalculated.** `fix/team-health-engagement`. `calculateEngagement` only inspects the legacy retro-embedded
      `TEAM_HEALTH` phase, not `TEAM_HEALTH_RESPONSE`, so every standalone Team Health meeting writes
      a near-zero engagement score regardless of actual participation — and that number flows into
      org reporting.
- [ ] **Summary email has no stats.** `QuickStats` has no Team Health entry.
- [ ] **No dedicated illustration.** `MeetingCard` reuses the retrospective artwork.
- [ ] **Only the `likert` question type exists.** eNPS is the single number executives ask for and it
      cannot currently be asked.
- [ ] **No CSV export** of aggregate scores.
- [ ] **No in-app notification** when a cycle opens.

---

## Branch map

Stacked branches are listed under the branch they build on. All branch off `fix/team-health-4`.

- `docs/team-health-roadmap` — this document
- `feat/team-health-category-scores` — server-side category rollup
  - `feat/team-health-trend` — `Team.teamHealthTrend`, deltas, sparklines
- `fix/team-health-reveal-floor` — respondent floor, raw-comment fallbacks removed
  - `feat/team-health-comment-paraphrase` — writes `commentParaphrased` at reveal
- `fix/team-health-participation` — `eligibleCount` / `participationRate`
  - `feat/team-health-response-reminders` — hourly nudge for non-responders
- `fix/team-health-engagement` — credit answers toward engagement

None of the UI in these branches has been checked against a running app yet — every change
typechecks and the relay artifacts build, but the rendered result still needs eyes on it.
