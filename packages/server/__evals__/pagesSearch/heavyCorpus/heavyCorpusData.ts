export type TeamKey = 'atlas' | 'beacon'

export interface Project {
  name: string
  doing: string[]
  stories: string[]
}

export interface Team {
  key: TeamKey
  name: string
  short: string
  teamId: string
  members: string[]
  projects: Project[]
  blockers: string[]
  retroPrompts: string[]
}

export interface PlantedUpdate {
  team: TeamKey
  date: string
  member: string
  working?: string
  stuck?: string
}

export interface RetroTopic {
  title: string
  reflections: string[]
  task?: string
}

export interface DocSection {
  heading: string
  facts?: string[]
  list?: string[]
  table?: {header: string[]; rows: string[][]}
}

export type DocKind = 'rfc' | 'runbook' | 'postmortem' | 'plan' | 'evaluation'

export interface DocSpec {
  key: string
  title: string
  team: TeamKey
  kind: DocKind
  component: string
  updatedAt: string
  intro?: string
  sections: DocSection[]
}

export const INSIGHTS_PROMPT = `You are an expert in agile retrospectives and project management.
Your team has just completed a meeting and it is your job to generate insights from the data and report to senior management.
Senior management wants to know where to best focus their time, so be concise and focus on next steps to take.
If there is not enough data to generate insightful findings, respond with "Not enough data to generate insights".
It should include at most 3 topics that are the most important highlights, takeaways, or areas that may need their attention.
`

export const STANDUP_PROMPTS = {
  working: 'What are you working on? What has been completed recently?',
  stuck: "What are you stuck on, what's holding you back?"
}

export const TEAMS: Team[] = [
  {
    key: 'atlas',
    name: 'Atlas Platform',
    short: 'Atlas',
    teamId: 'AtlasPlat1',
    members: [
      'Ngozi Adeyemi',
      'Lukas Becker',
      'Mei Lin',
      'Rafael Duarte',
      'Sofia Marchetti',
      'Hamid Karimi',
      "Tess O'Connor",
      'Arjun Mehta',
      'Grace Kim',
      'Diego Herrera'
    ],
    projects: [
      {
        name: 'SSO migration',
        doing: [
          'mapping SAML attributes for the SSO migration',
          'wiring up the IdP metadata endpoint',
          'testing the login flow against the Okta sandbox',
          'adding Azure AD to the SSO settings page',
          'writing the SSO setup guide for admins',
          'rolling SSO out to the beta orgs'
        ],
        stories: [
          'ATL-201 Parse IdP metadata XML',
          'ATL-202 SSO settings page for org admins',
          'ATL-205 Just-in-time user provisioning',
          'ATL-209 Enforce SSO for an org'
        ]
      },
      {
        name: 'Postgres 18 upgrade',
        doing: [
          'rehearsing the Postgres 18 upgrade on staging',
          'checking extension versions for Postgres 18',
          'tuning pgbouncer for the upgrade',
          'writing the cutover checklist for the Postgres upgrade',
          'verifying replication after the upgrade'
        ],
        stories: [
          'ATL-221 Upgrade staging to Postgres 18',
          'ATL-224 Rebuild indexes after the upgrade',
          'ATL-226 Replica lag alerting'
        ]
      },
      {
        name: 'rate limiter rewrite',
        doing: [
          'moving the rate limiter to a token bucket',
          'adding per-key limits to the rate limiter',
          'load testing the new rate limiter',
          'documenting rate limit headers for the public API'
        ],
        stories: [
          'ATL-214 Rate limiter per API key',
          'ATL-215 Return Retry-After on 429s',
          'ATL-218 Rate limit dashboard'
        ]
      },
      {
        name: 'webhook retries',
        doing: [
          'adding exponential backoff to webhook retries',
          'building the webhook delivery log',
          'backfilling failed webhook deliveries',
          'adding a replay button for failed webhooks'
        ],
        stories: [
          'ATL-231 Exponential backoff for webhooks',
          'ATL-233 Webhook delivery log',
          'ATL-236 Replay a failed webhook'
        ]
      },
      {
        name: 'tracing rollout',
        doing: [
          'adding OpenTelemetry spans to the API',
          'building the p95 latency dashboard',
          'tuning alert thresholds for the API',
          'tracing the slow GraphQL resolvers'
        ],
        stories: ['ATL-241 Trace GraphQL resolvers', 'ATL-244 Latency SLO alerts']
      },
      {
        name: 'CI speedups',
        doing: [
          'caching node_modules in CI',
          'splitting the test suite into shards',
          'fixing flaky integration tests',
          'moving builds to larger runners'
        ],
        stories: ['ATL-251 Shard the integration suite', 'ATL-253 Quarantine flaky tests']
      }
    ],
    blockers: [
      'staging credentials for the new cluster',
      'a flaky test in the billing suite',
      'access to the production read replica',
      'a security review of the new endpoint',
      'the CI queue, builds are taking 40 minutes',
      'a decision on which regions to support first',
      'an answer from the infra vendor about IPv6'
    ],
    retroPrompts: ['Start', 'Stop', 'Continue']
  },
  {
    key: 'beacon',
    name: 'Beacon Growth',
    short: 'Beacon',
    teamId: 'BeaconGro1',
    members: [
      'Camila Ortiz',
      'Jonah Weiss',
      'Leila Haddad',
      'Owen Fraser',
      'Yuki Sato',
      'Bianca Rossi',
      'Amara Nwosu'
    ],
    projects: [
      {
        name: 'onboarding checklist',
        doing: [
          'redesigning the onboarding checklist',
          'adding the invite-your-team step to onboarding',
          'testing new copy for the onboarding checklist',
          'cleaning up the onboarding event tracking'
        ],
        stories: [
          'BCN-101 Onboarding checklist v2',
          'BCN-104 Invite your team step',
          'BCN-107 Skip button for experienced users'
        ]
      },
      {
        name: 'pricing page experiment',
        doing: [
          'setting up the annual toggle experiment',
          'analyzing pricing page conversion',
          'writing the pricing FAQ',
          'reviewing the plan comparison table'
        ],
        stories: ['BCN-111 Annual toggle on the pricing page', 'BCN-113 Pricing FAQ section']
      },
      {
        name: 'analytics migration',
        doing: [
          'auditing our Segment events',
          'mapping events to the new analytics pipeline',
          'validating event volumes after the switch',
          'updating dashboards for the new event names'
        ],
        stories: [
          'BCN-121 Tracking plan for the new pipeline',
          'BCN-124 Server-side event forwarding'
        ]
      },
      {
        name: 'referral program',
        doing: [
          'building referral links',
          'designing the referral credit flow',
          'writing the referral emails',
          'adding referral stats to the billing page'
        ],
        stories: [
          'BCN-118 Referral credit ledger',
          'BCN-119 Referral landing page',
          'BCN-122 Fraud checks for referrals'
        ]
      },
      {
        name: 'trial email sequence',
        doing: [
          'drafting the day 3 trial email',
          'setting up the lifecycle email cron',
          'cleaning up the trial email templates',
          'adding unsubscribe links to lifecycle emails'
        ],
        stories: ['BCN-131 Day 3 trial email', 'BCN-133 Lifecycle email scheduler']
      },
      {
        name: 'activation dashboard',
        doing: [
          'defining activation for the dashboard',
          'building the activation funnel chart',
          'segmenting activation by plan',
          'reviewing activation numbers with sales'
        ],
        stories: [
          'BCN-141 CSV export streaming for large accounts',
          'BCN-143 Activation funnel chart'
        ]
      }
    ],
    blockers: [
      'legal review of the new email copy',
      'design review for the pricing page',
      'the data team, they own the warehouse tables',
      'a decision on the referral credit amount',
      'a staging environment with production-like data',
      'translations for the onboarding emails'
    ],
    retroPrompts: ['Glad', 'Sad', 'Mad']
  }
]

export const PROGRESS_NOTES = [
  'About halfway there.',
  'Should have a PR up this afternoon.',
  'Hoping to merge it by end of day.',
  'Found a couple of edge cases, so it will take another day.',
  'Will demo it at the next retro.',
  'The tricky part is done, now it is mostly tests.',
  'Going slower than I hoped because of the review backlog.',
  'Should be ready for QA tomorrow.'
]

export const WORKING_TEMPLATES = [
  'Still {doing}, which is taking longer than I expected.',
  "Today I'm {doing} for the {project}.",
  'Picked up {story} from the board. {Doing} today.',
  'Code review in the morning, then back to {doing}.',
  'Spent most of yesterday {doing} for the {project}.'
]

export const WORKING_AFTER_DONE_TEMPLATES = [
  "Finished {done} yesterday. Today I'm {doing}.",
  'Wrapped up {done}, and it is on staging now. Next up is {doing}.'
]

export const PLAN_NOTES = [
  'After that I want to start {nextDoing}.',
  'Tomorrow I plan to move on to {nextDoing}.',
  'If that goes well, next is {nextDoing}.'
]

export const EXTRA_WORK = [
  "Also reviewed {colleague}'s PR for the {project}.",
  'Paired with {colleague} on the {project} for an hour.',
  'Spent some time on support tickets in the morning.',
  'Answered questions from sales about the {project}.',
  'Updated the docs for the {project}.'
]

export const NO_BLOCKERS = [
  'Nothing blocking me.',
  'No blockers.',
  'All good, no blockers.',
  'Nothing right now.',
  'Not blocked.',
  'Nothing, thanks.'
]

export const BLOCKER_TEMPLATES = [
  'Blocked on {blocker}.',
  'Waiting on {colleague} for {blocker}.',
  'Still waiting on {blocker}.',
  'Need a review from {colleague} on the {project}.'
]

export const PLANTED_UPDATES: PlantedUpdate[] = [
  {
    team: 'atlas',
    date: '2026-06-04',
    member: 'Ngozi Adeyemi',
    stuck:
      'Our Okta sandbox tenant expired overnight, so I opened a ticket with Okta support to get it extended.'
  },
  {
    team: 'atlas',
    date: '2026-06-17',
    member: 'Lukas Becker',
    working:
      'Rehearsed the Postgres 18 upgrade on staging. The pg_partman extension needs a newer build before we can upgrade production.'
  },
  {
    team: 'atlas',
    date: '2026-06-30',
    member: 'Mei Lin',
    working:
      'The load test hit 4,200 requests per second before the new rate limiter started rejecting traffic, which is well above our peak.'
  },
  {
    team: 'atlas',
    date: '2026-07-08',
    member: 'Rafael Duarte',
    working:
      'Heads up that I am out Thursday and Friday for jury duty, so Sofia is covering my on-call shift.'
  },
  {
    team: 'atlas',
    date: '2026-07-14',
    member: 'Hamid Karimi',
    working:
      'The CDN purge script deleted the whole /assets/v2 prefix instead of one file this morning, so pages loaded without styles for 47 minutes until we restored it.'
  },
  {
    team: 'atlas',
    date: '2026-07-15',
    member: "Tess O'Connor",
    working:
      "Writing the postmortem for yesterday's CDN purge incident. The draft is in the Atlas space if you want to add to the timeline."
  },
  {
    team: 'atlas',
    date: '2026-07-22',
    member: 'Arjun Mehta',
    working:
      'Webhook retries now back off exponentially for up to 6 hours instead of retrying every minute, so a customer outage no longer floods their endpoint.'
  },
  {
    team: 'atlas',
    date: '2026-08-03',
    member: 'Sofia Marchetti',
    working:
      'Finished the Postgres 18 upgrade over the weekend. pgbouncer ran out of connections around 6am, so I raised the pool size from 80 to 200 and it has been stable since.'
  },
  {
    team: 'atlas',
    date: '2026-08-11',
    member: 'Lukas Becker',
    stuck:
      'Waiting on the Azure AD admin at Northwind Traders to send us their federation metadata file.'
  },
  {
    team: 'atlas',
    date: '2026-08-19',
    member: 'Ngozi Adeyemi',
    working:
      'SSO is live for the 12 beta orgs. Nobody has reported a login problem yet, and Northwind finished their setup this morning.'
  },
  {
    team: 'atlas',
    date: '2026-08-26',
    member: 'Mei Lin',
    working:
      'The SOC 2 auditor asked for evidence of quarterly access reviews, so I am exporting the Okta group membership logs for Q2.'
  },
  {
    team: 'atlas',
    date: '2026-09-02',
    member: 'Rafael Duarte',
    working:
      'The Datadog renewal is signed at 18% off list price for two years, and we dropped the unused synthetics add-on.'
  },
  {
    team: 'atlas',
    date: '2026-09-10',
    member: 'Hamid Karimi',
    working:
      'Our CI bill doubled in August because the integration suite now runs on every push. I am proposing that we only run it on pull requests to main.'
  },
  {
    team: 'atlas',
    date: '2026-09-21',
    member: "Tess O'Connor",
    working:
      'Pairing with Arjun on moving the session store to Valkey. We measured about 6 GB of session data, so one node is enough.'
  },
  {
    team: 'atlas',
    date: '2026-09-29',
    member: 'Arjun Mehta',
    stuck:
      'Blocked on the security review for the new API key scopes, which is scheduled for Thursday.'
  },
  {
    team: 'atlas',
    date: '2026-10-06',
    member: 'Sofia Marchetti',
    working:
      'Hackathon project: a Slack bot that reminds people to post their standup by 10am. Demo is on Friday.'
  },
  {
    team: 'beacon',
    date: '2026-06-02',
    member: 'Camila Ortiz',
    working:
      'Kicked off the pricing page experiment. Half of the visitors now see the annual toggle selected by default.'
  },
  {
    team: 'beacon',
    date: '2026-06-10',
    member: 'Owen Fraser',
    working:
      'Running the meeting templates webinar on Thursday, and 140 people have registered so far.'
  },
  {
    team: 'beacon',
    date: '2026-06-16',
    member: 'Jonah Weiss',
    working: 'Translating the onboarding emails into German for the DACH launch next month.'
  },
  {
    team: 'beacon',
    date: '2026-06-25',
    member: 'Leila Haddad',
    working:
      'The NPS survey went out to 3,000 trial users this morning, and responses close next Friday.'
  },
  {
    team: 'beacon',
    date: '2026-07-09',
    member: 'Owen Fraser',
    working:
      'Acme Corp escalated: their weekly CSV export times out after 30 seconds, and they load that file into Tableau every Monday.'
  },
  {
    team: 'beacon',
    date: '2026-07-21',
    member: 'Yuki Sato',
    stuck: 'Blocked on legal approval for the referral program terms and conditions.'
  },
  {
    team: 'beacon',
    date: '2026-08-05',
    member: 'Bianca Rossi',
    working:
      'We decided to drop Segment and move to RudderStack. It saves about $38k a year and we keep the same event names.'
  },
  {
    team: 'beacon',
    date: '2026-08-13',
    member: 'Camila Ortiz',
    working:
      'Pricing readout: selecting the annual toggle by default raised the annual plan mix from 31% to 44%, so we are keeping it.'
  },
  {
    team: 'beacon',
    date: '2026-08-27',
    member: 'Jonah Weiss',
    working:
      'Every trial user got the day 3 email twice this morning because the lifecycle cron ran in two regions. I paused the cron and posted in the support channel.'
  },
  {
    team: 'beacon',
    date: '2026-09-03',
    member: 'Leila Haddad',
    working:
      'The referral program launched. Both sides get a $50 credit, capped at 10 referrals per account.'
  },
  {
    team: 'beacon',
    date: '2026-09-14',
    member: 'Owen Fraser',
    stuck:
      'Waiting on the data team to backfill RudderStack with the events from before the switch.'
  },
  {
    team: 'beacon',
    date: '2026-09-22',
    member: 'Yuki Sato',
    working:
      'Presented the churn analysis at the all-hands: accounts without a second active user churn twice as often.'
  },
  {
    team: 'beacon',
    date: '2026-09-30',
    member: 'Bianca Rossi',
    working:
      'I am out next week on parental leave. Jonah owns the activation dashboard while I am gone.'
  },
  {
    team: 'beacon',
    date: '2026-10-07',
    member: 'Camila Ortiz',
    working:
      "Changed the day 3 email subject to 'Invite your team' and the open rate went from 29% to 38%."
  }
]

export const RETRO_TOPICS: RetroTopic[] = [
  {
    title: 'Flaky deploys',
    reflections: [
      'Deploys that fail halfway leave staging in a strange state for an hour.',
      'We should run a smoke test before a deploy is marked done.',
      'Rolling back takes too many manual steps.'
    ],
    task: 'Add a smoke test step to the deploy pipeline'
  },
  {
    title: 'Slow CI',
    reflections: [
      'Waiting 40 minutes for CI kills my focus.',
      'The integration suite runs even for docs changes.',
      'Caching dependencies would save us ten minutes per build.'
    ],
    task: 'Skip the integration suite for docs-only changes'
  },
  {
    title: 'On-call fatigue',
    reflections: [
      'Too many alerts fire at night for things that can wait until morning.',
      'The on-call rotation is uneven because two people swapped out.',
      'Handoff notes between shifts would help.'
    ],
    task: 'Review every alert that paged at night last month'
  },
  {
    title: 'Great pairing',
    reflections: [
      'Pairing on the tricky migration made it go much faster.',
      'I learned a lot from the debugging session on Tuesday.',
      'More pairing for new team members, please.'
    ]
  },
  {
    title: 'Too many meetings',
    reflections: [
      'Wednesdays have no focus time left.',
      'Some meetings could be an async update instead.',
      'The planning meeting runs over every time.'
    ],
    task: 'Make Wednesday afternoons meeting-free'
  },
  {
    title: 'Unclear priorities',
    reflections: [
      'Two projects were marked top priority in the same week.',
      'I did not know which bug to pick up first.',
      'A single ranked list would help.'
    ],
    task: 'Keep one ranked priority list in the team space'
  },
  {
    title: 'Code review delays',
    reflections: [
      'PRs wait a full day before anyone looks at them.',
      'Small PRs get reviewed much faster than big ones.',
      'Reviewers should be assigned automatically.'
    ],
    task: 'Turn on automatic reviewer assignment'
  },
  {
    title: 'Release went smoothly',
    reflections: [
      'The release checklist caught a missing migration.',
      'Support knew about the change before customers asked.',
      'The feature flag made the rollout calm.'
    ]
  },
  {
    title: 'Customer escalations',
    reflections: [
      'Escalations land in too many channels.',
      'Support needs a faster path to an engineer.',
      'We fixed the last escalation in under a day, nice work.'
    ],
    task: 'Create one escalation channel with an on-call engineer'
  },
  {
    title: 'Documentation gaps',
    reflections: [
      'The setup guide is out of date.',
      'Nobody knew how to rotate the API keys.',
      'Writing docs as part of the PR would keep them fresh.'
    ],
    task: 'Add a docs checkbox to the PR template'
  },
  {
    title: 'Estimates were off',
    reflections: [
      'The story we called a 3 took the whole sprint.',
      'We keep forgetting to count testing time.',
      'Splitting stories earlier would help.'
    ]
  },
  {
    title: 'Cross-team dependencies',
    reflections: [
      'We waited a week on another team for an API change.',
      'Dependencies should be called out at planning.',
      'A shared roadmap would show conflicts sooner.'
    ],
    task: 'List cross-team dependencies at sprint planning'
  }
]

export const PLANTED_RETRO_TOPICS: {team: TeamKey; retroNumber: number; topic: RetroTopic}[] = [
  {
    team: 'atlas',
    retroNumber: 4,
    topic: {
      title: 'CDN purge incident',
      reflections: [
        'The purge script should take one exact path, never a prefix.',
        'The status page went up 20 minutes after customers noticed missing styles.',
        'Restoring the assets from the bucket backup worked well.'
      ],
      task: 'Make the CDN purge script reject prefixes'
    }
  },
  {
    team: 'atlas',
    retroNumber: 6,
    topic: {
      title: 'Postgres upgrade weekend',
      reflections: [
        'Rehearsing on staging twice paid off.',
        'Nobody expected pgbouncer to run out of connections.',
        'The cutover checklist should include connection pool sizing.'
      ],
      task: 'Add connection pool sizing to the upgrade checklist'
    }
  },
  {
    team: 'beacon',
    retroNumber: 5,
    topic: {
      title: 'Analytics switch',
      reflections: [
        'Moving to RudderStack was the right call for the budget.',
        'We need a plan for the historical events.',
        'Dashboards broke for a day because event names changed case.'
      ],
      task: 'Backfill historical events into RudderStack'
    }
  },
  {
    team: 'beacon',
    retroNumber: 7,
    topic: {
      title: 'Duplicate trial emails',
      reflections: [
        'A cron job should only run in one region.',
        'Support handled the confused customers really well.',
        'We need an alert when an email is sent twice to the same person.'
      ],
      task: 'Make the lifecycle cron a single-region job'
    }
  }
]

export const STORY_POINTS = ['1', '2', '3', '5', '8', '13']

export const PLANTED_STORY_POINTS: Record<string, string> = {
  'ATL-214 Rate limiter per API key': '8',
  'ATL-233 Webhook delivery log': '5',
  'BCN-118 Referral credit ledger': '13',
  'BCN-141 CSV export streaming for large accounts': '8'
}

export const DOC_FILLER: Record<DocKind, string[]> = {
  rfc: [
    'This proposal affects the {component} and everything that calls it.',
    'We discussed the approach with {person} and {otherPerson} before writing it down.',
    'The change ships behind a feature flag so that we can turn it off quickly.',
    'We will measure the result with the existing {component} dashboards.',
    'The current behavior has been in place since the first version of the {component}.',
    'Most of the work is in the {component}; the API stays the same for callers.',
    'Existing customers keep their current settings until they opt in.',
    'Load tests run against staging with production-sized data before the rollout.',
    'If the numbers look wrong, we roll back by turning off the flag.',
    'We expect the work to take about {number} weeks for two engineers.',
    'Support gets a short write-up before the change reaches customers.',
    'The design keeps the {component} stateless so it can scale horizontally.'
  ],
  runbook: [
    'Post in the incident channel before you start, and again when you finish.',
    'Every command below runs from the bastion host.',
    'Check the {component} dashboard before and after each step.',
    'If a step fails, stop and page {person}, who owns the {component}.',
    'Keep a timestamped log of what you ran in the incident document.',
    'Do not run these steps during the nightly backup window.',
    'The {component} alerts will fire during this procedure, and that is expected.',
    'Ask a second engineer to watch the dashboards while you work.',
    'Write down the time each step started so the postmortem has an accurate timeline.',
    'When in doubt, prefer the slower and safer option.'
  ],
  postmortem: [
    'This postmortem is blameless: we look at systems and process, not people.',
    'Customers reported the problem in support before our alerts fired.',
    'The on-call engineer at the time was {person}.',
    'We confirmed the impact with the {component} logs and support tickets.',
    'The fix was deployed within the same day.',
    'We have no evidence of data loss.',
    'The {component} had no alert for this failure mode.',
    'Several customers asked for a status page update sooner.',
    '{person} and {otherPerson} reviewed this document before it was shared.',
    'Each action item below has an owner and a due date.'
  ],
  plan: [
    'The plan covers the next quarter and is reviewed at the end of each month.',
    'Each initiative has one owner, listed below.',
    'We will report progress in the weekly team update.',
    'If we fall behind, we cut scope before we move dates.',
    'The {component} work depends on the platform team finishing their part first.',
    '{person} keeps the plan up to date.',
    'Numbers come from the warehouse and are refreshed every Monday.',
    'We hold a short planning meeting every two weeks to adjust.',
    'Anything not on this plan waits until next quarter.',
    'We will revisit the targets if the market changes.'
  ],
  evaluation: [
    'We scored each option against the requirements below.',
    '{person} ran the trials and collected feedback from the team.',
    'Pricing assumes our current volume plus 30% growth.',
    'Every option meets our security and data residency requirements.',
    'Migration effort is estimated in engineer weeks.',
    'We talked to two reference customers for each vendor.',
    'The decision is reversible within a year if the contract allows it.',
    'Support quality mattered as much as features during the trial.',
    '{otherPerson} reviewed the contract terms with legal.',
    'All numbers are annual and in US dollars.'
  ]
}

export const GENERIC_FILLER = [
  'Questions go to the team channel, not direct messages, so everyone can see the answers.',
  'We revisit this document after the next quarterly review.',
  'Links to dashboards and tickets are in the related documents section.',
  'If anything here is out of date, fix it and add a line to the change log.',
  'The numbers in this section come from the last full month of data.',
  'Everyone on the team should be able to follow this without help.',
  'We will share a short summary in the weekly update when this changes.',
  'This applies to every environment unless a section says otherwise.',
  '{person} is the best person to ask about the details.',
  'The previous approach is described in the old wiki, which is now read only.',
  'Feedback from support shaped several of the decisions here.',
  'We prefer boring, well understood tools over new ones.',
  'Anything that touches customer data needs a second reviewer.',
  'This section was rewritten after the last incident review.',
  'Estimates assume the team is fully staffed for the period.',
  'Small changes can go straight to the main branch with one review.',
  'We track follow-up work in the team backlog with the same labels.',
  'If two sections disagree, the most recent change log entry wins.',
  'The team agreed on this at the planning meeting on a Tuesday.',
  'Customer-facing wording is reviewed by the support team first.',
  'We keep the {component} config in the infrastructure repository.',
  'Older versions of this page are in the page history.',
  'Ask {otherPerson} before changing anything in this section.',
  'This is a living document, so expect it to change.',
  'We measure success with the same metrics every quarter.',
  'Some details are left out on purpose to keep this readable.',
  'Every decision here can be revisited with new data.',
  'The team reads this document during onboarding.',
  'When a step is unclear, add a note so the next person benefits.',
  'We avoid one-off exceptions unless a customer is blocked.',
  'Most of the discussion happened in the team channel before this was written.',
  'The goal is to make the common case simple and the rare case possible.',
  'We checked these assumptions against last quarter before committing to them.',
  'People outside the team should be able to read this without extra context.',
  'Where we are unsure, the document says so instead of guessing.',
  'The first version of this was much longer, and we cut it down.',
  'Each section ends with the decision, so skimming is enough.',
  'If you only read one section, read the summary at the top.',
  'We will archive this page once the work is finished.',
  'Engineering, design and support all reviewed the draft.',
  'Two smaller changes went out first to reduce the risk.',
  'We wrote this after looking at how similar teams handled the same problem.',
  'The {component} has a dedicated alert channel for anything urgent.',
  'Copy edits are welcome, but bigger changes should go through the owner.',
  'Our customers rarely notice this work when it goes well.',
  'The team agreed to try this for one quarter and then review it.',
  'We expect the details to change as we learn more.',
  'Nothing here should surprise anyone who reads the weekly updates.',
  'There is a short recording of the review in the team channel.',
  '{person} wrote the first draft and {otherPerson} edited it.'
]

export const STATUS_UPDATES = [
  'On track. {person} finished the first draft.',
  'Slightly behind because of the {component} work, catching up next week.',
  'Reviewed with the team, and {number} open questions are left.',
  'Blocked for two days on another team, now unblocked.',
  'Shared with support for feedback.',
  'Numbers refreshed after the latest data pull.',
  '{person} is the owner while {otherPerson} is out.',
  'Scope reduced to fit the timeline.',
  'Decision made at the weekly sync, see the change log.',
  'Waiting on feedback from {otherPerson}.',
  'Demoed to the wider team, with good questions about the {component}.',
  'All action items now have owners.',
  'Moved the review meeting to Thursday.',
  'Added more detail after questions from sales.',
  'No change this week.'
]

export const FAQ = [
  ['Who owns this?', '{person} owns it, and {otherPerson} is the backup.'],
  ['Where do I ask questions?', 'Post in the team channel and tag {person}.'],
  [
    'Does this affect customers?',
    'Only customers who use the {component}, and we tell them in advance.'
  ],
  ['How do I know it worked?', 'Check the {component} dashboard for the numbers listed above.'],
  ['What if something goes wrong?', 'Follow the rollback steps and post in the incident channel.'],
  ['When will this be finished?', 'We expect it to be done in about {number} weeks.'],
  ['Is there a test plan?', 'Yes, the test plan lives next to this document.'],
  ['Can I change this document?', 'Yes, but add an entry to the change log.'],
  ['Who approved this?', '{person} approved it after the review meeting.'],
  ['Does support know?', 'Support got a summary before the change shipped.'],
  ['How much does this cost?', 'The costs are in the table above and reviewed every quarter.'],
  ['Is there a recording?', 'The review meeting was recorded and linked in the team channel.']
]

export const CHANGE_LOG_CHANGES = [
  'updated the {section} section',
  'fixed typos',
  'added a note about the {component}',
  'clarified the {section} section after feedback',
  'refreshed the numbers',
  'linked the related documents',
  'removed an outdated paragraph',
  'added owners to the action items',
  'rewrote the introduction',
  'moved details into the {section} section',
  'added a table to the {section} section',
  'reviewed the whole document'
]

export const DOCS: DocSpec[] = [
  {
    key: 'doc-postgres-failover-runbook',
    title: 'Runbook: Postgres failover',
    team: 'atlas',
    kind: 'runbook',
    component: 'database cluster',
    updatedAt: '2026-08-07T15:00:00.000Z',
    intro: 'How to fail over the primary Postgres database to a replica.',
    sections: [
      {
        heading: 'When to use this runbook',
        facts: ['Use it when the primary is down or degraded for more than five minutes.']
      },
      {
        heading: 'Prerequisites',
        list: [
          'Access to the bastion host',
          'The database admin role',
          'A second engineer on the call'
        ]
      },
      {heading: 'Check the replicas', facts: ['Pick the replica with the lowest replication lag.']},
      {
        heading: 'Steps',
        list: [
          'Stop writes by putting the API in maintenance mode',
          'Confirm the chosen replica has caught up',
          'Promote the replica',
          'Point pgbouncer at the new primary',
          'Turn off maintenance mode',
          'Rebuild a new replica from the old primary'
        ]
      },
      {
        heading: 'Verification',
        facts: ['Run the health check script and confirm that writes succeed.']
      },
      {
        heading: 'Replication lag',
        facts: [
          'If replication lag is above 30 seconds, page the database on-call before you fail over, because the replica is missing recent writes.'
        ]
      },
      {
        heading: 'Rollback',
        facts: [
          'If the new primary misbehaves, fail back to the old primary only after it has been rebuilt.'
        ]
      },
      {
        heading: 'Known issues',
        facts: ['pgbouncer keeps stale connections for up to a minute after the switch.']
      }
    ]
  },
  {
    key: 'doc-rate-limiting-rfc',
    title: 'RFC: Rate limiting per API key',
    team: 'atlas',
    kind: 'rfc',
    component: 'API gateway',
    updatedAt: '2026-06-24T15:00:00.000Z',
    intro: 'Limit API traffic per key instead of per IP address.',
    sections: [
      {
        heading: 'Background',
        facts: [
          'Today we limit by IP address, which punishes customers behind one corporate proxy.'
        ]
      },
      {
        heading: 'Goals',
        list: [
          'Fair limits per customer',
          'Clear headers when a limit is hit',
          'No change for normal traffic'
        ]
      },
      {heading: 'Non-goals', facts: ['Billing for API usage is out of scope.']},
      {heading: 'Proposal', facts: ['Each API key gets its own token bucket stored in Valkey.']},
      {
        heading: 'Headers',
        facts: ['A rejected request gets a 429 status with a Retry-After header in seconds.']
      },
      {
        heading: 'Limits',
        facts: [
          'Each key gets a bucket of 600 requests per minute, with bursts of up to 100 requests.'
        ]
      },
      {
        heading: 'Rollout',
        facts: ['We log would-be rejections for two weeks before we enforce the limit.']
      },
      {
        heading: 'Open questions',
        list: ['Do internal keys get higher limits?', 'Should limits differ by plan?']
      }
    ]
  },
  {
    key: 'doc-cdn-purge-postmortem',
    title: 'Postmortem: CDN purge incident on Jul 14',
    team: 'atlas',
    kind: 'postmortem',
    component: 'CDN',
    updatedAt: '2026-07-17T15:00:00.000Z',
    intro: 'Pages loaded without styles after a CDN purge removed too many assets.',
    sections: [
      {
        heading: 'Summary',
        facts: ['A cache purge removed every stylesheet and script under one prefix.']
      },
      {
        heading: 'Impact',
        facts: ['Pages loaded without styles for 47 minutes, and support received 31 tickets.']
      },
      {
        heading: 'Timeline',
        table: {
          header: ['Time (UTC)', 'Event'],
          rows: [
            ['09:12', 'Purge script started'],
            ['09:14', 'First customer report in support'],
            ['09:31', 'Status page updated'],
            ['09:44', 'Assets restored from the bucket backup'],
            ['09:59', 'Cache warmed and incident resolved']
          ]
        }
      },
      {
        heading: 'Root cause',
        facts: [
          'The purge script passed /assets/v2 as a prefix instead of a single file path, so the CDN deleted the whole folder.'
        ]
      },
      {heading: 'What went well', facts: ['The bucket backup let us restore every asset quickly.']},
      {
        heading: 'What went poorly',
        facts: ['The status page was updated 20 minutes after customers noticed.']
      },
      {
        heading: 'Action items',
        list: [
          'Make the purge script reject prefixes (Hamid)',
          'Alert when the asset 404 rate spikes (Mei)',
          'Update the status page within 10 minutes of a customer report (Tess)'
        ]
      }
    ]
  },
  {
    key: 'doc-session-store-rfc',
    title: 'RFC: Move sessions to Valkey',
    team: 'atlas',
    kind: 'rfc',
    component: 'session service',
    updatedAt: '2026-09-24T15:00:00.000Z',
    intro: 'Store login sessions in Valkey instead of Postgres.',
    sections: [
      {
        heading: 'Background',
        facts: ['Session reads are the busiest query on the primary database.']
      },
      {
        heading: 'Goals',
        list: ['Take session reads off Postgres', 'Keep users logged in during the move']
      },
      {
        heading: 'Proposal',
        facts: ['Write sessions to both stores for a week, then read from Valkey only.']
      },
      {
        heading: 'Sizing',
        facts: [
          'We measured about 6 GB of session data, so a single Valkey node with a replica is enough.'
        ]
      },
      {
        heading: 'Expiry',
        facts: ['Sessions expire after 14 days without activity, the same as today.']
      },
      {
        heading: 'Rollout',
        facts: ['We switch reads team by team, starting with internal accounts.']
      },
      {
        heading: 'Risks',
        facts: ['If Valkey loses data, users have to log in again, but no data is lost.']
      }
    ]
  },
  {
    key: 'doc-saml-certificate-runbook',
    title: 'Runbook: Rotate the SAML signing certificate',
    team: 'atlas',
    kind: 'runbook',
    component: 'auth service',
    updatedAt: '2026-08-21T15:00:00.000Z',
    intro: 'How to replace the certificate that signs our SAML requests.',
    sections: [
      {
        heading: 'When to rotate',
        facts: ['Rotate the certificate every year, or right away if the private key leaks.']
      },
      {
        heading: 'Generate the certificate',
        list: [
          'Create a new key pair in the secrets manager',
          'Export the public certificate',
          'Store the private key with the auth service secrets'
        ]
      },
      {
        heading: 'Notify customers',
        facts: ['Email the affected org admins 30 days before the old certificate expires.']
      },
      {
        heading: 'Okta',
        facts: ['Okta admins upload the new certificate in the app settings under SAML signing.']
      },
      {
        heading: 'Azure AD',
        facts: ['Azure AD admins add the new certificate as a second verification certificate.']
      },
      {
        heading: 'Switch over',
        facts: ['Publish both certificates in our metadata for a week, then remove the old one.']
      },
      {
        heading: 'Verification',
        facts: ['Log in through each beta org to confirm the new certificate works.']
      }
    ]
  },
  {
    key: 'doc-postgres-18-upgrade-plan',
    title: 'Postgres 18 upgrade plan',
    team: 'atlas',
    kind: 'plan',
    component: 'database cluster',
    updatedAt: '2026-07-28T15:00:00.000Z',
    intro: 'The plan for moving production from Postgres 16 to Postgres 18.',
    sections: [
      {
        heading: 'Why upgrade',
        facts: ['Postgres 16 leaves support next year, and 18 speeds up our largest queries.']
      },
      {
        heading: 'Staging rehearsal',
        facts: ['We rehearse twice on staging with a copy of production.']
      },
      {heading: 'Extensions', facts: ['pg_partman needs a newer build that supports Postgres 18.']},
      {
        heading: 'Milestones',
        table: {
          header: ['Date', 'Milestone'],
          rows: [
            ['Jun 17', 'First staging rehearsal'],
            ['Jul 8', 'Second staging rehearsal'],
            ['Aug 1', 'Production upgrade on Saturday morning']
          ]
        }
      },
      {heading: 'Cutover', facts: ['The API goes into maintenance mode for about 20 minutes.']},
      {
        heading: 'Connection pooling',
        facts: [
          'After the upgrade, pgbouncer default_pool_size goes from 80 to 200 to absorb reconnecting clients.'
        ]
      },
      {
        heading: 'Rollback',
        facts: ['We keep the Postgres 16 replica running for a week in case we need to fail back.']
      }
    ]
  },
  {
    key: 'doc-on-call-handbook',
    title: 'Atlas on-call handbook',
    team: 'atlas',
    kind: 'runbook',
    component: 'alerting setup',
    updatedAt: '2026-06-15T15:00:00.000Z',
    intro: 'What on-call means for the Atlas Platform team.',
    sections: [
      {heading: 'Rotation', facts: ['Each shift is one week, starting Monday at 10am.']},
      {
        heading: 'Before your shift',
        list: [
          'Check that your phone receives test pages',
          'Read the handoff notes',
          'Make sure your laptop has VPN access'
        ]
      },
      {
        heading: 'During your shift',
        facts: ['Acknowledge every page, even if it turns out to be noise.']
      },
      {
        heading: 'Severity levels',
        table: {
          header: ['Level', 'Meaning'],
          rows: [
            ['SEV1', 'Customers cannot use the product'],
            ['SEV2', 'A major feature is broken'],
            ['SEV3', 'A minor feature is degraded']
          ]
        }
      },
      {
        heading: 'Escalation',
        facts: [
          'If the primary does not acknowledge a page within 15 minutes, it escalates to the secondary, and after 30 minutes to the engineering manager.'
        ]
      },
      {
        heading: 'After an incident',
        facts: ['Open a postmortem document for every SEV1 and SEV2 incident.']
      },
      {
        heading: 'Handoff',
        facts: ['Write handoff notes on Monday morning before the next shift starts.']
      }
    ]
  },
  {
    key: 'doc-analytics-vendor-evaluation',
    title: 'Analytics vendor evaluation',
    team: 'beacon',
    kind: 'evaluation',
    component: 'analytics pipeline',
    updatedAt: '2026-08-04T15:00:00.000Z',
    intro: 'Which product analytics pipeline we should use after the Segment contract ends.',
    sections: [
      {heading: 'Context', facts: ['The Segment contract renews in September at a higher price.']},
      {
        heading: 'Requirements',
        list: [
          'Server-side event forwarding',
          'Warehouse sync every hour',
          'EU data residency',
          'Same event names as today'
        ]
      },
      {
        heading: 'Options',
        table: {
          header: ['Vendor', 'Annual cost', 'Warehouse sync', 'Migration effort'],
          rows: [
            ['Segment', '$96,000', 'Every hour', 'None'],
            ['RudderStack', '$58,000', 'Every 30 minutes', '3 engineer weeks'],
            ['PostHog', '$41,000', 'Daily', '6 engineer weeks']
          ]
        }
      },
      {
        heading: 'Findings',
        facts: [
          'PostHog is cheapest, but the daily warehouse sync breaks our activation dashboard.'
        ]
      },
      {
        heading: 'Costs',
        facts: ['RudderStack saves about $38,000 a year compared with renewing Segment.']
      },
      {heading: 'Recommendation', facts: ['Move to RudderStack and keep our current event names.']},
      {
        heading: 'Next steps',
        list: [
          'Sign the RudderStack contract',
          'Run both pipelines for two weeks',
          'Backfill historical events'
        ]
      }
    ]
  },
  {
    key: 'doc-q3-growth-plan',
    title: 'Q3 growth plan',
    team: 'beacon',
    kind: 'plan',
    component: 'onboarding flow',
    updatedAt: '2026-06-29T15:00:00.000Z',
    intro: 'What Beacon Growth is working on from July to September.',
    sections: [
      {
        heading: 'Objectives',
        list: [
          'More trials become active teams',
          'More teams choose annual plans',
          'Customers bring their colleagues'
        ]
      },
      {
        heading: 'Key results',
        list: [
          'Annual plan mix above 40%',
          'Referral program live by September',
          'Trial to paid conversion up 2 points'
        ]
      },
      {
        heading: 'Activation',
        facts: ['Activation target: 42% of new teams run a meeting within 7 days of signing up.']
      },
      {
        heading: 'Initiatives',
        table: {
          header: ['Initiative', 'Owner'],
          rows: [
            ['Onboarding checklist', 'Jonah'],
            ['Pricing page experiment', 'Camila'],
            ['Referral program', 'Leila'],
            ['Analytics migration', 'Bianca']
          ]
        }
      },
      {
        heading: 'Risks',
        facts: ['The analytics migration could hide changes in activation for a few weeks.']
      },
      {
        heading: 'Staffing',
        facts: ['Owen splits his time between growth and customer escalations.']
      }
    ]
  },
  {
    key: 'doc-pricing-experiment-results',
    title: 'Pricing page experiment results',
    team: 'beacon',
    kind: 'evaluation',
    component: 'pricing page',
    updatedAt: '2026-08-14T15:00:00.000Z',
    intro: 'Results of selecting the annual toggle by default on the pricing page.',
    sections: [
      {
        heading: 'Hypothesis',
        facts: ['Showing annual prices first makes more teams choose an annual plan.']
      },
      {
        heading: 'Setup',
        facts: [
          'Half of the visitors saw the annual toggle selected by default, from Jun 2 to Aug 11.'
        ]
      },
      {heading: 'Traffic', facts: ['About 18,000 visitors saw each version.']},
      {heading: 'Results', facts: ['The annual plan mix rose from 31% to 44% in the test group.']},
      {heading: 'Conversion', facts: ['Overall conversion did not change in a measurable way.']},
      {heading: 'Decision', facts: ['We keep the annual toggle selected by default for everyone.']}
    ]
  },
  {
    key: 'doc-referral-program-spec',
    title: 'Referral program spec',
    team: 'beacon',
    kind: 'rfc',
    component: 'billing page',
    updatedAt: '2026-07-20T15:00:00.000Z',
    intro: 'How customers invite other teams and earn credit.',
    sections: [
      {
        heading: 'Goals',
        list: ['Customers bring new teams', 'Credit is simple to understand', 'Fraud stays low']
      },
      {heading: 'How it works', facts: ['Every account gets a referral link on the billing page.']},
      {
        heading: 'Rewards',
        facts: ['Both sides get a $50 credit, capped at 10 referrals per account.']
      },
      {
        heading: 'Fraud checks',
        facts: ['Credit is only granted after the new team pays for its first month.']
      },
      {
        heading: 'Emails',
        facts: [
          'We send one email when a referral signs up and another when the credit is applied.'
        ]
      },
      {heading: 'Legal', facts: ['Legal must approve the terms and conditions before launch.']},
      {heading: 'Launch', facts: ['We launch to all paid accounts at once, with no beta.']}
    ]
  },
  {
    key: 'doc-onboarding-email-sequence',
    title: 'Onboarding email sequence',
    team: 'beacon',
    kind: 'plan',
    component: 'lifecycle emails',
    updatedAt: '2026-10-08T15:00:00.000Z',
    intro: 'The emails a new trial gets during the first two weeks.',
    sections: [
      {
        heading: 'Schedule',
        table: {
          header: ['Day', 'Email', 'Goal'],
          rows: [
            ['Day 1', 'Welcome', 'Run the first meeting'],
            ['Day 3', 'Invite your team', 'Add a second user'],
            ['Day 7', 'Templates', 'Try a new meeting template'],
            ['Day 12', 'Trial ending', 'Choose a plan']
          ]
        }
      },
      {
        heading: 'Day 3 email',
        facts: ["The day 3 email subject is 'Invite your team', and its open rate is 38%."]
      },
      {
        heading: 'Sending',
        facts: ['The lifecycle cron sends the emails at 2pm in the customer time zone.']
      },
      {heading: 'Translations', facts: ['The emails are available in English and German.']},
      {
        heading: 'Measuring',
        facts: ['We track opens, clicks and whether the team invited a second user.']
      }
    ]
  },
  {
    key: 'doc-duplicate-trial-emails-postmortem',
    title: 'Postmortem: Duplicate trial emails on Aug 27',
    team: 'beacon',
    kind: 'postmortem',
    component: 'lifecycle emails',
    updatedAt: '2026-08-31T15:00:00.000Z',
    intro: 'Every trial user received the day 3 email twice.',
    sections: [
      {heading: 'Summary', facts: ['The day 3 email went out twice to about 2,400 trial users.']},
      {
        heading: 'Impact',
        facts: ['Support received 17 tickets, and the unsubscribe rate doubled for the day.']
      },
      {
        heading: 'Root cause',
        facts: [
          'The lifecycle cron ran in both us-east and eu-west after a region was added, and each region sent the email.'
        ]
      },
      {
        heading: 'Timeline',
        table: {
          header: ['Time (UTC)', 'Event'],
          rows: [
            ['14:00', 'Both regions sent the day 3 email'],
            ['14:20', 'First support ticket'],
            ['14:35', 'Cron paused by Jonah']
          ]
        }
      },
      {heading: 'What went well', facts: ['Support had a macro ready within half an hour.']},
      {
        heading: 'Action items',
        list: [
          'Run the lifecycle cron in one region only (Jonah)',
          'Alert when the same email goes to one person twice (Yuki)'
        ]
      }
    ]
  },
  {
    key: 'doc-acme-interview-notes',
    title: 'Customer interview: Acme Corp',
    team: 'beacon',
    kind: 'evaluation',
    component: 'CSV export',
    updatedAt: '2026-07-13T15:00:00.000Z',
    intro: 'Notes from our call with the Acme Corp operations team.',
    sections: [
      {
        heading: 'Who we talked to',
        facts: ['Their operations lead and two team leads who run weekly retros.']
      },
      {heading: 'How they use us', facts: ['Forty teams run a retro every two weeks.']},
      {
        heading: 'Reporting',
        facts: ['They load the weekly CSV export into Tableau every Monday at 9am.']
      },
      {
        heading: 'Pain points',
        list: [
          'The CSV export times out after 30 seconds for their account',
          'No way to filter the export by team',
          'Reports take too many clicks'
        ]
      },
      {
        heading: 'Requests',
        list: [
          'Stream the export instead of building it in memory',
          'A scheduled export to their S3 bucket'
        ]
      },
      {
        heading: 'Follow-up',
        facts: ['Owen will update them when the export streams large accounts.']
      }
    ]
  }
]

export const SHORT_DOCS = [
  {
    key: 'doc-ideas-backlog',
    title: 'Ideas backlog',
    team: 'atlas' as TeamKey,
    updatedAt: '2026-09-15T15:00:00.000Z',
    text: 'A Slack bot that nudges people who have not posted their standup.'
  },
  {
    key: 'doc-q4-planning-draft',
    title: 'Q4 planning (draft)',
    team: 'beacon' as TeamKey,
    updatedAt: '2026-10-09T15:00:00.000Z',
    text: ''
  }
]
