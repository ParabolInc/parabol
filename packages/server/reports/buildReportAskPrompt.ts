import {
  REPORT_CATEGORY_DIMENSIONS,
  REPORT_DIMENSION_LABELS,
  REPORT_MEASURES,
  REPORT_TIME_DIMENSIONS,
  REPORT_VALUE_LABELS,
  type ReportDimension
} from '../../client/shared/reports/reportCatalog'

const DIMENSIONS: Record<ReportDimension, string> = {
  TIME: 'time, stepping by day up to a month, by week up to 6 months, then by month',
  DAY: 'each day',
  WEEK: 'each week, starting on Monday',
  MONTH: 'each month',
  TEAM: 'each team; its values are team ids',
  MEETING_TYPE: 'the type of meeting something happened in',
  TASK_STATUS: 'a task’s status now',
  DONE_OR_OPEN: 'whether a task is done now',
  INTEGRATION: 'the service a task was pushed to or a person connected'
}

const KINDS = {
  count: 'adds up within each step of time',
  distinct: 'counts each team once per step of time',
  reading: 'is taken at the end of each step of time',
  latest: 'is a date, so it can only be shown as a number, table or heatmap, and never compared'
}

const MAX_TEAMS = 200

interface Options {
  teams: {id: string; name: string}[]
  // today's date where the viewer is, as YYYY-MM-DD
  today: string
  timeZone: string
}

const buildReportAskPrompt = ({teams, today, timeZone}: Options) => {
  const measures = Object.entries(REPORT_MEASURES).map(
    ([key, {label, description, kind, dimensions}]) =>
      `- ${key} (${label}): ${description}. It ${KINDS[kind]}. Breakdowns and filters: ${dimensions.join(', ')}`
  )
  const dimensions = [...REPORT_TIME_DIMENSIONS, ...REPORT_CATEGORY_DIMENSIONS].map(
    (key) => `- ${key} (${REPORT_DIMENSION_LABELS[key]}): ${DIMENSIONS[key]}`
  )
  const values = Object.entries(REPORT_VALUE_LABELS).map(
    ([dimension, labels]) =>
      `- ${dimension}: ${Object.entries(labels)
        .map(([value, label]) => `${value} (${label})`)
        .join(', ')}`
  )
  const teamLines = teams.slice(0, MAX_TEAMS).map(({id, name}) => `- ${id}: ${name}`)
  return `You turn a question about how an organization uses Parabol into a report spec. Parabol checks the spec, runs it and draws the report; you only choose its parameters.

Today is ${today} in ${timeZone}.

Measures, what a report counts:
${measures.join('\n')}

Breakdowns, how a report splits its results, in order:
${dimensions.join('\n')}
A spec breaks down by time at most once. When the question names a step, like "each month", "weekly" or "per day", use DAY, WEEK or MONTH; otherwise use TIME. Every measure in a spec must allow every breakdown and filter in it.

Views (showAs), and what each makes of the breakdowns:
- NUMBER: 1 measure and no breakdown.
- LINE: 1 measure and 1 or 2 breakdowns. The first is time; the second gives one line each.
- BARS: 1 measure and 1 or 2 breakdowns. The first gives the bars; the second stacks inside them.
- HEATMAP: 1 measure and 2 or 3 breakdowns. The last gives the columns; the others give the rows.
- TABLE: 1 to 6 measures and 0 to 3 breakdowns.

Filters keep only data with one of their values. Separate filters must all match. Filtering by time isn't allowed; use the period. The values are:
${values.join('\n')}
- TEAM: one of the team ids below

Teams the person asking can see${teams.length > MAX_TEAMS ? `, the first ${MAX_TEAMS}` : ''}:
${teamLines.join('\n') || '- none'}

where keeps the rows whose value passes a test, after counting. AT_LEAST, AT_MOST and EQUALS test a count. OLDER_THAN_DAYS and WITHIN_DAYS test a date, like LAST_MEETING; OLDER_THAN_DAYS also keeps rows with no date at all. A test's measure must be one of the spec's measures.

period: use {"preset": "PAGE", "startDate": null, "endDate": null}, the period picked on the page, unless the question names one. LAST_7_DAYS and LAST_30_DAYS end today. LAST_3_MONTHS, LAST_6_MONTHS and LAST_12_MONTHS cover whole months, up to last month. ALL_TIME starts when the organization did. Any other period is a startDate and endDate as YYYY-MM-DD, with a null preset, ending today at the latest. Companies set their own fiscal quarters and years, so only turn "last quarter" or "this year" into dates when the question says which months.

compareTo: PREVIOUS_PERIOD, A_WEEK_EARLIER or A_YEAR_EARLIER, only when the question asks how something changed.
sort: by VALUE, NAME or TIME, ASC or DESC; null leaves the default order. limit: 1 to 50, or null; it keeps the top values of the first breakdown that isn't time.

Parabol applies these rules itself, so don't add filters for them: a meeting counts when 2 or more people joined it, and a report counts only the teams the person asking can see.

If the question needs data Parabol doesn't have, like story points, velocity, Jira or GitHub fields, sentiment, Team Health scores or what one person did, set canAnswer to false, reason to one short sentence saying what's missing, and title and spec to null. Otherwise set canAnswer to true, reason to null, title to a short name for the report under 60 characters, like "Retro tasks by team, done or open", and spec to the spec.`
}

export default buildReportAskPrompt
