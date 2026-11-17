# Postmortem: duplicate invoice emails

Date of incident: Tuesday, September 29. Severity: SEV2. Authors: Ingrid Solheim and Callum Reyes. Status: complete, action items in progress.

## Summary

Between 09:05 and 10:22 UTC on September 29, customers whose invoices were scheduled to send that morning triggered duplicate emails to their clients. A total of 4,812 customers had at least one invoice emailed between two and nine times. No customer data was exposed and no payments were affected. The duplicates stopped when we paused the email worker, and we resumed sending after a fix was deployed at 11:30 UTC.

## Impact

- 4,812 customers had an invoice delivered more than once, and their clients received between two and nine copies.
- Support received 163 tickets in the first 90 minutes, and 27 customers asked whether their clients had been charged twice. They had not: the emails were duplicates, not duplicate payments.
- The resend button on the invoice page was disabled for the duration of the incident to avoid making things worse.
- We lost roughly three hours of engineering and support time during the response and several more on follow-up communication.

## Timeline

All times are UTC on September 29.

| Time | Event |
| --- | --- |
| 08:55 | Deploy of email worker v2.14 completes |
| 09:05 | First duplicate sends begin |
| 09:40 | Support reports a spike of tickets about duplicate emails |
| 09:44 | On-call acknowledges the page raised by support |
| 09:52 | Incident declared SEV2, Ingrid becomes incident commander |
| 10:10 | Cause narrowed to queue messages being delivered more than once |
| 10:22 | Email worker paused and duplicate sends stop |
| 11:30 | Visibility timeout raised, idempotency check deployed, worker resumed |
| 13:00 | Backlog drained and incident resolved |

## Root cause

The email queue uses a visibility timeout: when a worker picks up a message, the message is hidden from other workers for a set time. If the worker has not finished and deleted the message by then, the queue assumes the worker died and makes the message visible again.

Our timeout was 30 seconds. Version 2.14 started attaching a PDF copy of each invoice, and rendering that PDF takes up to 55 seconds for customers with long invoices. While the first worker was still rendering, the message became visible again and a second worker picked it up. Both sent the email. For the largest invoices the same message was picked up as many as nine times.

Nothing downstream protected us. The email service did not record which invoices it had already sent, so every delivery looked new to it. The load test before release used small sample invoices, which render in under five seconds, so it never exercised the timeout.

## Customer communication

Support sent a macro to every customer who wrote in, explaining that the extra emails were harmless duplicates and that nobody had been billed twice. The first status page update went out at 10:42 UTC, and a second one followed when the worker was paused. After the fix, we emailed the affected customers a short apology with a plain explanation, and we offered to resend a corrected copy to any client who asked.

Eleven customers asked for a call. Marcus and Priya spoke with each of them within two business days, and most were satisfied once they understood the invoices themselves had not changed.

## What went well

- Support noticed the pattern quickly and escalated with concrete examples, which saved us from guessing.
- The on-call engineer acknowledged the page within four minutes.
- Pausing the worker was safe because the queue keeps messages until they are processed. Nothing was lost.
- The team stayed calm and kept a written timeline in the incident channel from the first minute.

## What went poorly

- We learned about the problem from customers, not from an alert. There was no check for the same invoice being sent more than once.
- The load test used only small invoices, so a slow render never showed up before production.
- The status page was updated 50 minutes after the incident started. Customers wrote in before we had said anything publicly.
- The runbook for the email worker did not mention the visibility timeout, and two people spent twenty minutes looking at the wrong dashboard.

## Where we got lucky

- The incident started on a Tuesday morning, when most of the team was online. A weekend or a holiday would have meant a much slower response.
- The duplicates were emails only. If the same retry behavior had applied to payment capture, customers could have been charged more than once.
- The largest customers happened to have invoices scheduled later in the day, so they received the fewest copies.

## Action items

| Action | Owner | Due |
| --- | --- | --- |
| Raise the visibility timeout to 120 seconds and make it configurable per queue | Callum Reyes | Done |
| Add an idempotency key to every outbound email | Callum Reyes | Oct 16 |
| Alert when the same invoice is emailed more than once in an hour | Ingrid Solheim | Oct 9 |
| Extend the load test with the ten largest customers' invoices | Tomasz Brandt | Oct 23 |
| Update the status page runbook so the first update goes out within 15 minutes | Priya Raman | Oct 12 |
| Add the visibility timeout and the render time to the email worker runbook | Ingrid Solheim | Oct 9 |

## Lessons learned

Retries and redelivery are normal in any queue-based system, so every consumer must be safe to run twice. We had treated that as an implementation detail of the queue when it is really a property of each message handler. From now on, any handler that sends something to a customer needs an idempotency key and a test that delivers the same message twice.

We also learned that a feature can change the performance profile of a worker without touching the queue configuration. Adding a PDF attachment made the job nearly twenty times slower for large invoices. Reviewers of that change had no reason to look at the timeout, which lived in a different repository. We now list queue settings in the worker's README and mention them in the pull request template for worker changes.

Finally, the first thirty minutes of an incident are the most expensive. Having a short checklist for the incident commander, including the first status page update, would have cut the time customers spent in the dark.
