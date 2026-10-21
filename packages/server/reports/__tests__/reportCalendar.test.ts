import {
  buildReportSteps,
  chooseReportStepLength,
  type ReportLocalRange,
  type ReportStep,
  resolveReportPeriod,
  shiftReportRange
} from '../reportCalendar'

const UTC = 'UTC'
const NEW_YORK = 'America/New_York'
const now = new Date('2026-10-20T15:00:00Z')
const orgCreatedAt = new Date('2025-02-10T12:00:00Z')

const resolve = (period: Parameters<typeof resolveReportPeriod>[0], timeZone = UTC) =>
  resolveReportPeriod(period, null, {timeZone, now, orgCreatedAt})

const toSteps = (
  range: ReportLocalRange,
  ...args: [Parameters<typeof buildReportSteps>[1], string]
) => {
  const steps = buildReportSteps(range, ...args)
  if (typeof steps === 'string') throw new Error(steps)
  return steps
}

const hoursIn = ({start, end}: ReportStep) => (end.getTime() - start.getTime()) / 3_600_000

describe('resolveReportPeriod', () => {
  test('day presets end today, in the report time zone', () => {
    expect(resolve({preset: 'LAST_7_DAYS'})).toEqual({
      startDate: '2026-10-14',
      endDate: '2026-10-21',
      isWholeMonths: false
    })
    expect(resolve({preset: 'LAST_30_DAYS'})).toEqual({
      startDate: '2026-09-21',
      endDate: '2026-10-21',
      isWholeMonths: false
    })
    const lateEvening = new Date('2026-10-20T02:00:00Z')
    expect(
      resolveReportPeriod({preset: 'LAST_7_DAYS'}, null, {
        timeZone: 'America/Los_Angeles',
        now: lateEvening,
        orgCreatedAt
      })
    ).toEqual({startDate: '2026-10-13', endDate: '2026-10-20', isWholeMonths: false})
  })

  test('month presets cover whole months up to the last full one', () => {
    expect(resolve({preset: 'LAST_3_MONTHS'})).toEqual({
      startDate: '2026-07-01',
      endDate: '2026-10-01',
      isWholeMonths: true
    })
    expect(resolve({preset: 'LAST_12_MONTHS'})).toEqual({
      startDate: '2025-10-01',
      endDate: '2026-10-01',
      isWholeMonths: true
    })
  })

  test('PAGE takes the page period, or 3 months without one', () => {
    const options = {timeZone: UTC, now, orgCreatedAt}
    expect(resolveReportPeriod({preset: 'PAGE'}, {preset: 'LAST_7_DAYS'}, options)).toEqual(
      resolve({preset: 'LAST_7_DAYS'})
    )
    expect(resolveReportPeriod({preset: 'PAGE'}, null, options)).toEqual(
      resolve({preset: 'LAST_3_MONTHS'})
    )
    expect(resolveReportPeriod({preset: 'PAGE'}, {preset: 'PAGE'}, options)).toEqual(
      resolve({preset: 'LAST_3_MONTHS'})
    )
  })

  test('ALL_TIME starts the day the organization was created', () => {
    expect(resolve({preset: 'ALL_TIME'})).toEqual({
      startDate: '2025-02-10',
      endDate: '2026-10-21',
      isWholeMonths: false
    })
  })

  test('a custom period includes its end date and ends today at the latest', () => {
    expect(resolve({startDate: '2026-09-01', endDate: '2026-09-30'})).toEqual({
      startDate: '2026-09-01',
      endDate: '2026-10-01',
      isWholeMonths: false
    })
    expect(resolve({startDate: '2026-10-01', endDate: '2026-10-20'})).toEqual({
      startDate: '2026-10-01',
      endDate: '2026-10-21',
      isWholeMonths: false
    })
    expect(typeof resolve({startDate: '2026-10-01', endDate: '2026-10-21'})).toBe('string')
    expect(typeof resolve({startDate: '2026-10-02', endDate: '2026-10-01'})).toBe('string')
    expect(typeof resolve({startDate: '2026-10-01'})).toBe('string')
  })
})

describe('chooseReportStepLength', () => {
  const range = (startDate: string, endDate: string) => ({startDate, endDate, isWholeMonths: false})

  test('TIME picks days up to a month, weeks up to 6 months, then months', () => {
    expect(chooseReportStepLength('TIME', range('2026-09-20', '2026-10-21'))).toBe('DAY')
    expect(chooseReportStepLength('TIME', range('2026-09-19', '2026-10-21'))).toBe('WEEK')
    expect(chooseReportStepLength('TIME', range('2026-04-18', '2026-10-21'))).toBe('WEEK')
    expect(chooseReportStepLength('TIME', range('2026-04-17', '2026-10-21'))).toBe('MONTH')
  })

  test('a named step is kept', () => {
    expect(chooseReportStepLength('DAY', range('2025-10-01', '2026-10-01'))).toBe('DAY')
    expect(chooseReportStepLength('MONTH', range('2026-10-14', '2026-10-21'))).toBe('MONTH')
  })
})

describe('buildReportSteps', () => {
  test('days follow daylight saving in the report time zone', () => {
    const spring = toSteps(
      {startDate: '2026-03-07', endDate: '2026-03-10', isWholeMonths: false},
      'DAY',
      NEW_YORK
    )
    expect(spring.map(hoursIn)).toEqual([24, 23, 24])
    expect(spring[1]!.start.toISOString()).toBe('2026-03-08T05:00:00.000Z')
    expect(spring[1]!.end.toISOString()).toBe('2026-03-09T04:00:00.000Z')
    const fall = toSteps(
      {startDate: '2026-10-31', endDate: '2026-11-03', isWholeMonths: false},
      'DAY',
      NEW_YORK
    )
    expect(fall.map(hoursIn)).toEqual([24, 25, 24])
  })

  test('weeks start on Monday and the period cuts the ends short', () => {
    const steps = toSteps(
      {startDate: '2026-09-23', endDate: '2026-10-22', isWholeMonths: false},
      'WEEK',
      UTC
    )
    expect(steps.map(({naturalStartDate}) => naturalStartDate)).toEqual([
      '2026-09-21',
      '2026-09-28',
      '2026-10-05',
      '2026-10-12',
      '2026-10-19'
    ])
    expect(steps.map(({isPartial}) => isPartial)).toEqual([true, false, false, false, true])
    expect(steps[0]!.start.toISOString()).toBe('2026-09-23T00:00:00.000Z')
    expect(steps[4]!.end.toISOString()).toBe('2026-10-22T00:00:00.000Z')
  })

  test('whole-month periods have whole-month steps', () => {
    const steps = toSteps(
      {startDate: '2026-04-01', endDate: '2026-10-01', isWholeMonths: true},
      'MONTH',
      NEW_YORK
    )
    expect(steps).toHaveLength(6)
    expect(steps.some(({isPartial}) => isPartial)).toBe(false)
    expect(steps[0]!.start.toISOString()).toBe('2026-04-01T04:00:00.000Z')
  })

  test('without a step, the period is one step', () => {
    const steps = toSteps(
      {startDate: '2026-10-14', endDate: '2026-10-21', isWholeMonths: false},
      null,
      UTC
    )
    expect(steps).toEqual([
      {
        start: new Date('2026-10-14T00:00:00Z'),
        end: new Date('2026-10-21T00:00:00Z'),
        naturalStartDate: '2026-10-14',
        isPartial: false
      }
    ])
  })

  test('too many steps is an error, not a huge query', () => {
    const steps = buildReportSteps(
      {startDate: '2024-01-01', endDate: '2026-01-01', isWholeMonths: false},
      'DAY',
      UTC
    )
    expect(typeof steps).toBe('string')
  })
})

describe('shiftReportRange', () => {
  test('the previous period is the same length, just before', () => {
    expect(
      shiftReportRange(
        {startDate: '2026-10-14', endDate: '2026-10-21', isWholeMonths: false},
        'PREVIOUS_PERIOD'
      )
    ).toEqual({startDate: '2026-10-07', endDate: '2026-10-14', isWholeMonths: false})
    expect(
      shiftReportRange(
        {startDate: '2026-07-01', endDate: '2026-10-01', isWholeMonths: true},
        'PREVIOUS_PERIOD'
      )
    ).toEqual({startDate: '2026-04-01', endDate: '2026-07-01', isWholeMonths: true})
  })

  test('a week or a year earlier', () => {
    const range = {startDate: '2026-09-21', endDate: '2026-10-21', isWholeMonths: false}
    expect(shiftReportRange(range, 'A_WEEK_EARLIER')).toEqual({
      startDate: '2026-09-14',
      endDate: '2026-10-14',
      isWholeMonths: false
    })
    expect(shiftReportRange(range, 'A_YEAR_EARLIER')).toEqual({
      startDate: '2025-09-21',
      endDate: '2025-10-21',
      isWholeMonths: false
    })
  })
})
