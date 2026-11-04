import type {HttpResponse} from 'uWebSockets.js'
import {createHistogram, usePrometheus} from '@graphql-yoga/plugin-prometheus'
import {Counter, collectDefaultMetrics, Gauge, Histogram, Registry} from 'prom-client'
import {activeClients} from './activeClients'
import getKysely from './postgres/getKysely'
import type {Embeddingsjobstateenum} from './postgres/types/pg'
import {Logger} from './utils/Logger'

export const ENABLE_METRICS = process.env.ENABLE_METRICS
  ? process.env.ENABLE_METRICS === 'true'
  : __PRODUCTION__
export const METRICS_PORT = process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT, 10) : 9090

const register = new Registry()

const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

collectDefaultMetrics({
  register,
  prefix: 'node_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  eventLoopMonitoringPrecision: 1000,
  labels: {
    server_id: process.env.SERVER_ID || 'unknown',
    port: PORT.toString()
  }
})

// Node.js metrics
new Gauge({
  name: 'node_memory_usage_bytes',
  help: 'Memory usage by type',
  labelNames: ['type'],
  registers: [register],
  collect() {
    const memoryUsage = process.memoryUsage()
    const {heapTotal, heapUsed, external, rss, arrayBuffers} = memoryUsage

    this.set({type: 'heapTotal'}, heapTotal)
    this.set({type: 'heapUsed'}, heapUsed)
    this.set({type: 'external'}, external)
    this.set({type: 'rss'}, rss)
    this.set({type: 'arrayBuffers'}, arrayBuffers)
  }
})

new Gauge({
  name: 'node_cpu_usage_seconds',
  help: 'CPU usage in seconds',
  labelNames: ['type'],
  registers: [register],
  collect() {
    const cpuUsage = process.cpuUsage()
    const userCpu = cpuUsage.user / 1_000_000
    const systemCpu = cpuUsage.system / 1_000_000
    this.set({type: 'user'}, userCpu)
    this.set({type: 'system'}, systemCpu)
  }
})

new Gauge({
  name: 'node_eventloop_lag_seconds',
  help: 'Event loop lag in seconds',
  registers: [register],
  collect() {
    return new Promise<void>((resolve) => {
      const end = this.startTimer()
      setTimeout(() => {
        end()
        resolve()
      }, 0)
    })
  }
})

new Gauge({
  name: 'node_heap_size_bytes',
  help: 'Heap size in bytes',
  labelNames: ['type'],
  registers: [register],
  collect() {
    const memoryUsage = process.memoryUsage()
    const {heapTotal, heapUsed} = memoryUsage

    this.set({type: 'total'}, heapTotal)
    this.set({type: 'used'}, heapUsed)
  }
})

new Gauge({
  name: 'node_active_handles',
  help: 'Number of active handles',
  registers: [register],
  collect() {
    const activeResources = process.getActiveResourcesInfo()
    this.set(activeResources.length)
  }
})

// WebSocket metrics
new Gauge({
  name: 'websocket_connections_total',
  help: 'Total number of active WebSocket connections',
  labelNames: ['port'],
  registers: [register],
  collect() {
    this.set({port: PORT.toString()}, activeClients.size)
  }
})

// TODO wire up these ws metrics
/*
export const wsMessages = new Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['type', 'port'],
  registers: [register]
})

export const wsMessageSize = new Histogram({
  name: 'websocket_message_size_bytes',
  help: 'Size of WebSocket messages in bytes',
  labelNames: ['type', 'port'],
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000],
  registers: [register]
})

export const wsConnectionDuration = new Histogram({
  name: 'websocket_connection_duration_seconds',
  help: 'Duration of WebSocket connections in seconds',
  labelNames: ['port'],
  buckets: [60, 300, 600, 1800, 3600, 7200, 14400, 28800, 57600, 86400],
  registers: [register]
})

export const wsErrors = new Counter({
  name: 'websocket_errors_total',
  help: 'Total number of WebSocket errors',
  labelNames: ['type', 'port'],
  registers: [register]
})
*/

export const websocketConnects = new Counter({
  name: 'parabol_websocket_connects_total',
  help: 'Websocket connections accepted after authentication',
  registers: [register]
})

export const websocketConnectAttempts = new Counter({
  name: 'parabol_websocket_connect_attempts_total',
  help: 'Websocket upgrades started, before authentication',
  registers: [register]
})

export const websocketConnectDuration = new Histogram({
  name: 'parabol_websocket_connect_duration_seconds',
  help: 'Seconds from the websocket upgrade until the connection is accepted, rejected, fails or the client leaves, by outcome',
  labelNames: ['outcome'] as const,
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
})

export const websocketMessagesDropped = new Counter({
  name: 'parabol_websocket_messages_dropped_total',
  help: 'Messages the server never sent because the socket already had more than maxBackpressure queued, by route',
  labelNames: ['route'] as const,
  registers: [register]
})

export const unexpectedGraphQLErrors = new Counter({
  name: 'parabol_graphql_unexpected_errors_total',
  help: 'Queries and mutations that returned an error the server did not mean to, by operation type',
  labelNames: ['operation_type'] as const,
  registers: [register]
})

export const logins = new Counter({
  name: 'parabol_logins_total',
  help: 'Successful logins, including sign-ups through an identity provider, by method',
  labelNames: ['method'] as const,
  registers: [register]
})

export const meetingsEnded = new Counter({
  name: 'parabol_meetings_ended_total',
  help: 'Meetings ended, whether completed or ended early, by meeting type',
  labelNames: ['meeting_type'] as const,
  registers: [register]
})

export const meetingsStarted = new Counter({
  name: 'parabol_meetings_started_total',
  help: 'Meetings started, by a person or by a meeting series, by meeting type',
  labelNames: ['meeting_type'] as const,
  registers: [register]
})

export const meetingJoins = new Counter({
  name: 'parabol_meeting_joins_total',
  help: 'Times a person joined a meeting, by meeting type',
  labelNames: ['meeting_type'] as const,
  registers: [register]
})

export const meetingSeriesChanges = new Counter({
  name: 'parabol_meeting_series_changes_total',
  help: 'Meeting series started, restarted or stopped, by meeting type and change',
  labelNames: ['meeting_type', 'change'] as const,
  registers: [register]
})

export const meetingSettingsChanges = new Counter({
  name: 'parabol_meeting_settings_changes_total',
  help: 'Times a team changed its meeting settings, by meeting type',
  labelNames: ['meeting_type'] as const,
  registers: [register]
})

export const commentsAdded = new Counter({
  name: 'parabol_comments_added_total',
  help: 'Comments and replies added in meeting discussions, by meeting type',
  labelNames: ['meeting_type'] as const,
  registers: [register]
})

export const teamPromptResponsesShared = new Counter({
  name: 'parabol_team_prompt_responses_shared_total',
  help: 'Standup responses shared with the team, counting each prompt answered',
  registers: [register]
})

export const reactjiChanges = new Counter({
  name: 'parabol_reactji_changes_total',
  help: 'Reactji added to or removed from comments, reflections and responses',
  labelNames: ['reactable_type', 'change'] as const,
  registers: [register]
})

export const reflectionsAdded = new Counter({
  name: 'parabol_reflections_added_total',
  help: 'Retrospective reflections added',
  registers: [register]
})

export const stageTimerChanges = new Counter({
  name: 'parabol_stage_timer_changes_total',
  help: 'Meeting stage timers and time limits started, updated or stopped',
  labelNames: ['change'] as const,
  registers: [register]
})

export const pokerRevotes = new Counter({
  name: 'parabol_poker_revotes_total',
  help: 'Sprint Poker dimensions sent back to voting',
  registers: [register]
})

export const templatesCreated = new Counter({
  name: 'parabol_templates_created_total',
  help: 'Meeting templates created blank or cloned from another, by meeting type and origin',
  labelNames: ['meeting_type', 'origin'] as const,
  registers: [register]
})

export const templatesShared = new Counter({
  name: 'parabol_templates_shared_total',
  help: 'Meeting templates whose sharing scope changed, by meeting type and new scope',
  labelNames: ['meeting_type', 'scope'] as const,
  registers: [register]
})

export const pokerScalesCreated = new Counter({
  name: 'parabol_poker_scales_created_total',
  help: 'Sprint Poker scales created blank or cloned from another, by origin',
  labelNames: ['origin'] as const,
  registers: [register]
})

export const teamRenames = new Counter({
  name: 'parabol_team_renames_total',
  help: 'Teams renamed, by whether the old name was the default one given at sign-up',
  labelNames: ['from_default_name'] as const,
  registers: [register]
})

export const integrationChanges = new Counter({
  name: 'parabol_integration_changes_total',
  help: 'Integrations a person added to or removed from a team, by service',
  labelNames: ['service', 'change'] as const,
  registers: [register]
})

export const inviteEmails = new Counter({
  name: 'parabol_invite_emails_total',
  help: 'Team and meeting invitation emails, by what they invite to and whether they were sent',
  labelNames: ['invite_to', 'outcome'] as const,
  registers: [register]
})

export const teamJoins = new Counter({
  name: 'parabol_team_joins_total',
  help: 'People added to a team by accepting an invitation, joining a public team or auto-joining at sign-up',
  labelNames: ['method'] as const,
  registers: [register]
})

export const teamPrivacyChanges = new Counter({
  name: 'parabol_team_privacy_changes_total',
  help: 'Teams made public or private, by new visibility',
  labelNames: ['visibility'] as const,
  registers: [register]
})

export const lockedOrgJoinAttempts = new Counter({
  name: 'parabol_locked_org_join_attempts_total',
  help: 'Invitations refused because an organization the person belongs to is locked',
  registers: [register]
})

export const teamsCreated = new Counter({
  name: 'parabol_teams_created_total',
  help: 'Teams added to an existing organization',
  registers: [register]
})

export const teamsArchived = new Counter({
  name: 'parabol_teams_archived_total',
  help: 'Teams archived on their own, not as part of archiving an organization',
  registers: [register]
})

export const orgsCreated = new Counter({
  name: 'parabol_orgs_created_total',
  help: 'Organizations created at sign-up or added later, by source',
  labelNames: ['source'] as const,
  registers: [register]
})

export const orgsArchived = new Counter({
  name: 'parabol_orgs_archived_total',
  help: 'Organizations archived',
  registers: [register]
})

export const orgUpgradeAttempts = new Counter({
  name: 'parabol_org_upgrade_attempts_total',
  help: 'Stripe subscriptions created for a card payment that has not been confirmed yet',
  registers: [register]
})

export const orgTierChanges = new Counter({
  name: 'parabol_org_tier_changes_total',
  help: 'Organization upgrades and downgrades, by old and new tier',
  labelNames: ['from_tier', 'to_tier'] as const,
  registers: [register]
})

export const downgradeReasons = new Counter({
  name: 'parabol_downgrade_reasons_total',
  help: 'Reasons picked when downgrading to Starter, one per reason',
  labelNames: ['reason'] as const,
  registers: [register]
})

export const enterpriseSeatOverages = new Counter({
  name: 'parabol_enterprise_seat_overages_total',
  help: 'Seat changes that left an enterprise organization with more active users than its subscription quantity',
  registers: [register]
})

export const billingLeaderChanges = new Counter({
  name: 'parabol_billing_leader_changes_total',
  help: 'Billing leaders added or removed',
  labelNames: ['change'] as const,
  registers: [register]
})

export const orgUsersRemoved = new Counter({
  name: 'parabol_org_users_removed_total',
  help: 'People removed from an organization',
  registers: [register]
})

export const teamLimitEmailsSent = new Counter({
  name: 'parabol_team_limit_emails_sent_total',
  help: 'Emails warning an organization that it is over the Starter team limit, by type',
  labelNames: ['type'] as const,
  registers: [register]
})

export const tasksCreated = new Counter({
  name: 'parabol_tasks_created_total',
  help: 'Tasks created, by meeting type (none outside a meeting) and the service that holds them',
  labelNames: ['meeting_type', 'service'] as const,
  registers: [register]
})

export const taskEstimates = new Counter({
  name: 'parabol_task_estimates_total',
  help: 'Sprint Poker estimates saved, by the service they were pushed to and whether the push worked',
  labelNames: ['service', 'outcome'] as const,
  registers: [register]
})

export const taskDueDatesSet = new Counter({
  name: 'parabol_task_due_dates_set_total',
  help: 'Times a task due date was set or changed',
  registers: [register]
})

export const taskMentions = new Counter({
  name: 'parabol_task_mentions_total',
  help: 'People newly mentioned in a task',
  registers: [register]
})

export const agendaItemsAdded = new Counter({
  name: 'parabol_agenda_items_added_total',
  help: 'Check-in agenda items added, by whether a check-in was running',
  labelNames: ['in_meeting'] as const,
  registers: [register]
})

export const pollsCreated = new Counter({
  name: 'parabol_polls_created_total',
  help: 'Polls created in a meeting discussion',
  registers: [register]
})

export const icebreakerRewrites = new Counter({
  name: 'parabol_icebreaker_rewrites_total',
  help: 'Icebreaker questions the AI was asked to rewrite, by tone and whether it returned one',
  labelNames: ['tone', 'outcome'] as const,
  registers: [register]
})

export const meetingMusicChanges = new Counter({
  name: 'parabol_meeting_music_changes_total',
  help: 'Meeting music tracks played or stopped by the facilitator',
  labelNames: ['change'] as const,
  registers: [register]
})

export const suggestedGroupsDuration = new Histogram({
  name: 'parabol_suggested_groups_duration_seconds',
  help: 'Seconds to suggest reflection groups, by mode and whether a stored result was reused',
  labelNames: ['mode', 'cache'] as const,
  buckets: [0.1, 0.5, 1, 2.5, 5, 10, 20, 40, 60],
  registers: [register]
})

export const legacyAutogroups = new Counter({
  name: 'parabol_legacy_autogroups_total',
  help: 'Boards rearranged by the deprecated autogroup mutation, which only clients older than suggested groups call',
  registers: [register]
})

export const reflectionGroupResets = new Counter({
  name: 'parabol_reflection_group_resets_total',
  help: 'Times a facilitator undid an autogroup',
  registers: [register]
})

export const suggestedTitleEditSimilarity = new Histogram({
  name: 'parabol_suggested_group_title_edit_similarity',
  help: 'How close a renamed group title stays to the title Parabol suggested, from 0 (unrelated) to 1 (unchanged)',
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
  registers: [register]
})

export const pagesCreated = new Counter({
  name: 'parabol_pages_created_total',
  help: 'Pages created',
  registers: [register]
})

export const pageInsightsGenerated = new Counter({
  name: 'parabol_page_insights_generated_total',
  help: 'AI page insights generated',
  registers: [register]
})

export const confluenceExportsStarted = new Counter({
  name: 'parabol_confluence_exports_started_total',
  help: 'Page exports to Confluence started',
  registers: [register]
})

export const confluenceExportDuration = new Histogram({
  name: 'parabol_confluence_export_duration_seconds',
  help: 'Seconds to export pages to Confluence, by whether every, some or no page made it',
  labelNames: ['status'] as const,
  buckets: [1, 5, 15, 30, 60, 120, 300, 600, 1800],
  registers: [register]
})

export const chatNotificationsSent = new Counter({
  name: 'parabol_chat_notifications_sent_total',
  help: 'Notifications delivered to Slack, Mattermost or Microsoft Teams, by service and event',
  labelNames: ['service', 'event'] as const,
  registers: [register]
})

export const accountsCreated = new Counter({
  name: 'parabol_accounts_created_total',
  help: 'Accounts created, by whether the person signed up from an invitation or on their own',
  labelNames: ['source'] as const,
  registers: [register]
})

export const accountsRemoved = new Counter({
  name: 'parabol_accounts_removed_total',
  help: 'Accounts deleted, by how',
  labelNames: ['method'] as const,
  registers: [register]
})

export const accountPauseChanges = new Counter({
  name: 'parabol_account_pause_changes_total',
  help: 'Accounts paused for inactivity or unpaused on return',
  labelNames: ['change'] as const,
  registers: [register]
})

export const accountRenames = new Counter({
  name: 'parabol_account_renames_total',
  help: 'People who changed their display name',
  registers: [register]
})

export const emailSubscriptionChanges = new Counter({
  name: 'parabol_email_subscription_changes_total',
  help: 'People who subscribed to or unsubscribed from an optional email, by email',
  labelNames: ['email', 'change'] as const,
  registers: [register]
})

const EMBEDDER_JOB_STATES = [
  'queued',
  'running',
  'failed'
] as const satisfies readonly Embeddingsjobstateenum[]

new Gauge({
  name: 'parabol_embedder_jobs',
  help: 'Jobs in the embedder queue by state. Every web server reports the same totals, so aggregate with max',
  labelNames: ['state'] as const,
  registers: [register],
  async collect() {
    try {
      const jobCounts = await getKysely()
        .selectFrom('EmbeddingsJobQueueV2')
        .select(({fn}) => ['state', fn.countAll<string>().as('jobs')])
        .groupBy('state')
        .execute()
      const jobsByState = new Map(jobCounts.map(({state, jobs}) => [state, Number(jobs)]))
      EMBEDDER_JOB_STATES.forEach((state) => {
        this.set({state}, jobsByState.get(state) ?? 0)
      })
    } catch (error) {
      Logger.error('Could not count embedder jobs for metrics', error)
    }
  }
})

export const graphqlPrometheusPlugin = usePrometheus({
  registry: register,
  endpoint: false,
  skipIntrospection: true,
  labels: {
    operationName: true,
    operationType: true,
    phase: true,
    path: false,
    fieldName: false,
    typeName: false,
    returnType: false
  },
  metrics: {
    graphql_envelop_request: true,
    graphql_envelop_error_result: true,
    graphql_envelop_request_duration: createHistogram({
      registry: register,
      histogram: {
        name: 'graphql_envelop_request_duration',
        help: 'Time to execute or subscribe to a GraphQL operation, in seconds',
        labelNames: ['operationType'] as const,
        buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
      },
      fillLabelsFn: ({operationType}) => ({operationType: operationType ?? 'unknown'})
    }),
    graphql_envelop_request_time_summary: false,
    graphql_envelop_phase_parse: false,
    graphql_envelop_phase_validate: false,
    graphql_envelop_phase_context: false,
    graphql_envelop_phase_execute: false,
    graphql_envelop_phase_subscribe: false,
    graphql_envelop_deprecated_field: false,
    graphql_envelop_schema_change: false,
    graphql_envelop_execute_resolver: false,
    graphql_yoga_http_duration: false
  }
})

export const metricsHandler = async (res: HttpResponse) => {
  let aborted = false
  res.onAborted(() => {
    aborted = true
  })

  try {
    const metrics = await register.metrics()
    if (!aborted) {
      res.cork(() => {
        res.writeStatus('200 OK')
        res.writeHeader('Content-Type', register.contentType)
        res.writeHeader('Cache-Control', 'no-cache')
        res.end(metrics)
      })
    }
  } catch (error) {
    Logger.error('Could not generate metrics', error)
    if (!aborted) {
      res.cork(() => {
        res.writeStatus('500 Internal Server Error')
        res.end()
      })
    }
  }
}
