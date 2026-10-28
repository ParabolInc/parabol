# Spec: recurring invoices

Status: approved. Owner: Callum Reyes. Product manager: Beatrix Lindqvist. Last updated: October 8.

## Background

Customers who bill the same client every week or month recreate the same invoice by hand each time. In the last customer survey, 41% of respondents asked for recurring invoices, and support answers about 30 tickets a month from customers who want to copy an old invoice forward. Competing products all offer some form of scheduled billing, and sales hears about it in nearly every demo.

The goal of this spec is a first version that covers the common cases well and leaves room to grow, without turning invoices into a subscription billing product.

## Goals and non-goals

Goals:

- Let a customer turn any existing invoice into a recurring schedule in two clicks.
- Generate and send each invoice on the scheduled date without the customer being online.
- Make it obvious what will be sent next, and let the customer pause or stop a schedule at any time.

Non-goals for the first release:

- Collecting payments automatically. Customers still pay each invoice the usual way.
- Multi-currency schedules. The first release supports US dollars only.
- Usage-based amounts. Every generated invoice repeats the same line items.

## User stories

- As a freelancer, I want my monthly retainer invoice to go out on the first of every month so that I never forget to bill.
- As an office manager, I want to see all upcoming invoices in one list so that I can check them before they send.
- As a bookkeeper, I want each generated invoice to get the next invoice number automatically so that our records stay in order.
- As a business owner, I want to pause a schedule when a client is on hold so that no invoices go out by mistake.

## Design notes

Recurring invoices live in a new tab on the invoices page, next to Drafts and Sent. The tab lists every schedule with its next issue date, the client, the amount and a status chip that reads Active, Paused or Ended. Selecting a schedule opens a side panel with the template, the frequency and the history of generated invoices.

Creating a schedule starts from an existing invoice. The invoice menu gets a new item, Make recurring, which opens a short dialog with the frequency, the start date, an optional end date and the skip weekends option. The dialog shows the next three issue dates so the customer can check the pattern before saving.

Generated invoices carry a small label that says they were created from a schedule, with a link back to it. Customers can still edit any generated invoice before it is sent.

## Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| R1 | A customer can turn any invoice into a recurring schedule: weekly, monthly, quarterly or yearly | Must |
| R2 | Each generated invoice gets the next invoice number in the customer's sequence | Must |
| R3 | A customer can pause, resume and end a schedule | Must |
| R4 | The skip weekends option moves the issue date to the next business day | Should |
| R5 | The customer gets an email a day before each invoice is sent, with a link to edit or skip it | Should |
| R6 | The customer is notified when a schedule is about to end | Could |
| R7 | A schedule can be edited without changing invoices that were already sent | Must |

## Edge cases

- Month ends: a schedule that starts on January 31 sends on the last day of shorter months, so February 28 or 29, and returns to the 31st when the month allows it.
- Time zones: the issue date uses the time zone configured on the customer's account, not the time zone of the server.
- Deleted clients: if the client is deleted, the schedule pauses and the customer is told why.
- Price changes: edits to the template apply to future invoices only.
- Failed email: if the email bounces, the invoice is still created and marked as undelivered so the customer can resend it.
- Retries: the scheduler may run a job twice. Each run carries an idempotency key made of the schedule id and the issue date so a retry can never create a duplicate invoice.

## Dependencies and risks

- The scheduler service needs a new job type and a per-customer limit so one large account cannot starve the others.
- Email deliverability: a customer with 200 monthly clients will send a burst on the first of the month. We will spread sends over a thirty minute window and watch bounce rates closely.
- Invoice numbering: customers who use their own numbering formats need the sequence to stay consistent. We will reuse the numbering code from manual invoices and add tests for gaps and manual overrides.
- Support load: the first month of any new billing feature produces questions. We will staff for it and update the help center before the beta starts.

## Open questions

- Should the generated invoice be sent immediately or saved as a draft when the customer has unpaid invoices for the same client?
- How many schedules should a free account be allowed to create?
- Do we show the next three invoices or the next twelve in the upcoming list?

## Rollout plan

We will build behind the feature flag recurring_invoices and release in three stages. In February, twenty customers who asked for the feature will join a beta and meet with the team every two weeks. In March, we will enable it for 25% of accounts and watch for support tickets, bounced emails and scheduler errors. In April, we will enable it for everyone and announce it in the newsletter and in the app.

Support will receive a briefing and macros one week before the beta starts. Finance will review the rollout plan for billing implications before the public launch.

## Success metrics

- At least 25% of active customers create a schedule within 90 days of the launch.
- Support tickets about copying old invoices drop by half within two months.
- Fewer than 0.5% of generated invoices bounce or need to be corrected.
- No duplicate invoices are created by the scheduler.

## Analytics and support

We will track four events: schedule created, schedule paused, invoice generated from a schedule and generated invoice edited before sending. The edit event matters most, because a high edit rate would mean the template is not capturing what customers actually bill. Dashboards for these events will be ready before the beta starts.

For support, we will add a macro for the three most likely questions: why an invoice was not sent, how to change the amount going forward and how to cancel a schedule. The help center article will include screenshots of the upcoming list and the schedule panel.
