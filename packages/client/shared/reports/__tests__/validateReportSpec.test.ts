import type {ReportSpec} from '../reportCatalog'
import {validateReportSpec} from '../validateReportSpec'

const spec = (overrides: Partial<ReportSpec>): ReportSpec => ({
  measures: ['MEETINGS'],
  breakdown: [],
  filters: [],
  where: [],
  period: {preset: 'LAST_3_MONTHS'},
  showAs: 'NUMBER',
  ...overrides
})

test.each<[string, Partial<ReportSpec>]>([
  ['a number', {}],
  [
    'a line over time split by team',
    {showAs: 'LINE', breakdown: [{dimension: 'WEEK'}, {dimension: 'TEAM'}]}
  ],
  [
    'a heatmap of tasks by meeting type and status',
    {
      measures: ['NEW_TASKS'],
      showAs: 'HEATMAP',
      breakdown: [{dimension: 'MEETING_TYPE'}, {dimension: 'TASK_STATUS'}]
    }
  ],
  [
    'a table of teams that have not met in 30 days',
    {
      measures: ['LAST_MEETING', 'MEETINGS'],
      showAs: 'TABLE',
      breakdown: [{dimension: 'TEAM'}],
      where: [{measure: 'LAST_MEETING', operator: 'OLDER_THAN_DAYS', value: 30}],
      sort: {by: 'NAME'}
    }
  ],
  [
    'teams that met, filtered to some teams',
    {measures: ['TEAMS_THAT_MET'], filters: [{dimension: 'TEAM', values: ['team1', 'team2']}]}
  ],
  ['a custom period', {period: {startDate: '2026-02-01', endDate: '2026-02-28'}}],
  ['a comparison', {compareTo: 'PREVIOUS_PERIOD'}],
  ['a limit', {showAs: 'BARS', breakdown: [{dimension: 'TEAM'}], limit: 10}],
  [
    'a line of each team’s active share',
    {
      measures: ['ACTIVE_SHARE'],
      showAs: 'LINE',
      breakdown: [{dimension: 'MONTH'}, {dimension: 'TEAM'}]
    }
  ],
  [
    'the oldest open tasks by owner',
    {
      measures: ['OPEN_TASKS'],
      showAs: 'BARS',
      breakdown: [{dimension: 'PERSON'}],
      filters: [{dimension: 'TASK_AGE', values: ['over180Days']}]
    }
  ],
  [
    'a flow of new tasks from meeting type to status',
    {
      measures: ['NEW_TASKS'],
      showAs: 'FLOW',
      breakdown: [{dimension: 'MEETING_TYPE'}, {dimension: 'TASK_STATUS'}]
    }
  ],
  [
    'each team’s health against its check before',
    {
      measures: ['HEALTH_SCORE'],
      showAs: 'HEATMAP',
      breakdown: [{dimension: 'TEAM'}, {dimension: 'CATEGORY'}],
      compareTo: 'PREVIOUS_CHECK'
    }
  ],
  [
    'two org structure levels, filtered by a third',
    {
      showAs: 'HEATMAP',
      breakdown: [
        {dimension: 'TEAM_LEVEL', levelId: 'level1'},
        {dimension: 'TEAM_LEVEL', levelId: 'level2'}
      ],
      filters: [{dimension: 'TEAM_LEVEL', levelId: 'level3', values: ['notSet']}]
    }
  ]
])('accepts %s', (_name, overrides) => {
  expect(validateReportSpec(spec(overrides))).toBeNull()
})

test.each<[string, Partial<ReportSpec>, string]>([
  ['a chart with two measures', {measures: ['MEETINGS', 'DISCUSSIONS']}, 'NUMBER takes 1 measure'],
  [
    'a measure twice',
    {showAs: 'TABLE', measures: ['MEETINGS', 'MEETINGS']},
    'A measure can only be used once'
  ],
  ['a number with a breakdown', {breakdown: [{dimension: 'TEAM'}]}, 'NUMBER takes 0 breakdowns'],
  [
    'a heatmap with one breakdown',
    {showAs: 'HEATMAP', breakdown: [{dimension: 'TEAM'}]},
    'HEATMAP takes 2 to 3 breakdowns'
  ],
  [
    'a line that does not start with time',
    {showAs: 'LINE', breakdown: [{dimension: 'TEAM'}, {dimension: 'WEEK'}]},
    'LINE must break down by time first'
  ],
  [
    'two time breakdowns',
    {showAs: 'HEATMAP', breakdown: [{dimension: 'WEEK'}, {dimension: 'MONTH'}]},
    'only break down by time once'
  ],
  [
    'a breakdown twice',
    {showAs: 'HEATMAP', breakdown: [{dimension: 'TEAM'}, {dimension: 'TEAM'}]},
    'A breakdown can only be used once'
  ],
  [
    'an org structure level twice',
    {
      showAs: 'HEATMAP',
      breakdown: [
        {dimension: 'TEAM_LEVEL', levelId: 'level1'},
        {dimension: 'TEAM_LEVEL', levelId: 'level1'}
      ]
    },
    'A breakdown can only be used once'
  ],
  [
    'org structure without a level',
    {showAs: 'BARS', breakdown: [{dimension: 'TEAM_LEVEL'}]},
    'TEAM_LEVEL needs the levelId of an org structure level'
  ],
  [
    'a breakdown the measure lacks',
    {showAs: 'BARS', measures: ['MEMBERS'], breakdown: [{dimension: 'MEETING_TYPE'}]},
    "MEMBERS can't be broken down by MEETING_TYPE"
  ],
  [
    'a time filter',
    {filters: [{dimension: 'WEEK', values: ['2026-10-12']}]},
    'Use the period to filter by time'
  ],
  [
    'a filter the measure lacks',
    {filters: [{dimension: 'TASK_STATUS', values: ['done']}]},
    "MEETINGS can't be filtered by TASK_STATUS"
  ],
  [
    'an empty filter',
    {filters: [{dimension: 'MEETING_TYPE', values: []}]},
    'A filter takes 1 to 100 values'
  ],
  [
    'an unknown filter value',
    {filters: [{dimension: 'MEETING_TYPE', values: ['standup']}]},
    "standup isn't a MEETING_TYPE value"
  ],
  [
    'an unknown task age',
    {measures: ['OPEN_TASKS'], filters: [{dimension: 'TASK_AGE', values: ['ancient']}]},
    "ancient isn't a TASK_AGE value"
  ],
  [
    'a stacked median',
    {
      measures: ['DAYS_TO_DONE'],
      showAs: 'BARS',
      breakdown: [{dimension: 'TEAM'}, {dimension: 'PERSON'}]
    },
    "DAYS_TO_DONE can't be stacked"
  ],
  [
    'a flow of something that isn’t a count',
    {
      measures: ['HEALTH_SCORE'],
      showAs: 'FLOW',
      breakdown: [{dimension: 'TEAM'}, {dimension: 'CATEGORY'}]
    },
    'FLOW only shows counts'
  ],
  [
    'a flow through time',
    {
      measures: ['NEW_TASKS'],
      showAs: 'FLOW',
      breakdown: [{dimension: 'MONTH'}, {dimension: 'TEAM'}]
    },
    "FLOW stages can't be time"
  ],
  [
    'a flow that counts a meeting for each person',
    {
      measures: ['MEETINGS'],
      showAs: 'FLOW',
      breakdown: [{dimension: 'TEAM'}, {dimension: 'PERSON'}]
    },
    'MEETINGS counts toward more than one PERSON'
  ],
  [
    'a previous check for something other than health',
    {compareTo: 'PREVIOUS_CHECK'},
    'PREVIOUS_CHECK only compares HEALTH_SCORE'
  ],
  [
    'a previous check over time',
    {
      measures: ['HEALTH_SCORE'],
      showAs: 'LINE',
      breakdown: [{dimension: 'MONTH'}],
      compareTo: 'PREVIOUS_CHECK'
    },
    "PREVIOUS_CHECK can't be used over time"
  ],
  [
    'a dimension filtered twice',
    {
      filters: [
        {dimension: 'MEETING_TYPE', values: ['poker']},
        {dimension: 'MEETING_TYPE', values: ['action']}
      ]
    },
    'A dimension can only be filtered once'
  ],
  [
    'a test on a measure the report lacks',
    {where: [{measure: 'DISCUSSIONS', operator: 'AT_LEAST', value: 1}]},
    "DISCUSSIONS isn't in the report"
  ],
  [
    'a date test on a count',
    {where: [{measure: 'MEETINGS', operator: 'WITHIN_DAYS', value: 7}]},
    "WITHIN_DAYS doesn't apply to MEETINGS"
  ],
  [
    'a count test on a date',
    {
      measures: ['LAST_MEETING'],
      showAs: 'TABLE',
      breakdown: [{dimension: 'TEAM'}],
      where: [{measure: 'LAST_MEETING', operator: 'AT_LEAST', value: 1}]
    },
    "AT_LEAST doesn't apply to LAST_MEETING"
  ],
  [
    'a negative test',
    {where: [{measure: 'MEETINGS', operator: 'AT_LEAST', value: -1}]},
    'a number of 0 or more'
  ],
  [
    'a preset and dates',
    {period: {preset: 'LAST_7_DAYS', startDate: '2026-10-01', endDate: '2026-10-07'}},
    'either a preset or a start and end date'
  ],
  ['no period', {period: {}}, 'either a preset or a start and end date'],
  ['a start without an end', {period: {startDate: '2026-10-01'}}, 'needs a start and end date'],
  [
    'a date that does not exist',
    {period: {startDate: '2026-02-01', endDate: '2026-02-30'}},
    'needs a start and end date'
  ],
  [
    'a month that does not exist',
    {period: {startDate: '2026-13-01', endDate: '2026-13-02'}},
    'needs a start and end date'
  ],
  [
    'an end before the start',
    {period: {startDate: '2026-10-07', endDate: '2026-10-01'}},
    'has to end after it starts'
  ],
  [
    'comparing a date',
    {
      measures: ['LAST_MEETING'],
      showAs: 'TABLE',
      breakdown: [{dimension: 'TEAM'}],
      compareTo: 'PREVIOUS_PERIOD'
    },
    "LAST_MEETING can't be compared"
  ],
  [
    'a date as bars',
    {measures: ['LAST_MEETING'], showAs: 'BARS', breakdown: [{dimension: 'TEAM'}]},
    "LAST_MEETING can't be shown as BARS"
  ],
  ['a time sort without time', {sort: {by: 'TIME'}}, 'Sorting by time needs a time breakdown'],
  [
    'a name sort without names',
    {showAs: 'LINE', breakdown: [{dimension: 'WEEK'}], sort: {by: 'NAME'}},
    'Sorting by name needs a breakdown other than time'
  ],
  [
    'a limit of 0',
    {showAs: 'BARS', breakdown: [{dimension: 'TEAM'}], limit: 0},
    'A limit is a whole number'
  ],
  [
    'a limit past 50',
    {showAs: 'BARS', breakdown: [{dimension: 'TEAM'}], limit: 51},
    'A limit is a whole number'
  ],
  [
    'a fractional limit',
    {showAs: 'BARS', breakdown: [{dimension: 'TEAM'}], limit: 2.5},
    'A limit is a whole number'
  ]
])('rejects %s', (_name, overrides, message) => {
  expect(validateReportSpec(spec(overrides))).toContain(message)
})
