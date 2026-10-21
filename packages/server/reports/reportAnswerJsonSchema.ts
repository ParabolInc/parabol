import {
  REPORT_CATEGORY_DIMENSIONS,
  REPORT_COMPARE_TO,
  REPORT_CONDITION_OPERATORS,
  REPORT_MEASURES,
  REPORT_PERIOD_PRESETS,
  REPORT_SORT_BY,
  REPORT_SORT_ORDERS,
  REPORT_TIME_DIMENSIONS,
  REPORT_VIEWS
} from '../../client/shared/reports/reportCatalog'

// OpenAI's strict structured output: every key is required, nothing extra is allowed, and a value
// that can be left out is nullable. Built from the same lists that ReportSpecInput is checked against
const strictObject = (properties: Record<string, unknown>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false
})

const oneOf = (values: readonly string[]) => ({type: 'string', enum: values})
const nullableOneOf = (values: readonly string[]) => ({
  type: ['string', 'null'],
  enum: [...values, null]
})

const MEASURES = Object.keys(REPORT_MEASURES)
const DIMENSIONS = [...REPORT_TIME_DIMENSIONS, ...REPORT_CATEGORY_DIMENSIONS]

const SPEC_SCHEMA = strictObject({
  measures: {type: 'array', items: oneOf(MEASURES)},
  breakdown: {type: 'array', items: strictObject({dimension: oneOf(DIMENSIONS)})},
  filters: {
    type: 'array',
    items: strictObject({
      dimension: oneOf(DIMENSIONS),
      values: {type: 'array', items: {type: 'string'}}
    })
  },
  where: {
    type: 'array',
    items: strictObject({
      measure: oneOf(MEASURES),
      operator: oneOf(REPORT_CONDITION_OPERATORS),
      value: {type: 'number'}
    })
  },
  period: strictObject({
    preset: nullableOneOf(REPORT_PERIOD_PRESETS),
    startDate: {type: ['string', 'null']},
    endDate: {type: ['string', 'null']}
  }),
  compareTo: nullableOneOf(REPORT_COMPARE_TO),
  showAs: oneOf(Object.keys(REPORT_VIEWS)),
  sort: {
    anyOf: [
      strictObject({by: oneOf(REPORT_SORT_BY), order: oneOf(REPORT_SORT_ORDERS)}),
      {type: 'null'}
    ]
  },
  limit: {type: ['integer', 'null']}
})

export const REPORT_ANSWER_JSON_SCHEMA = strictObject({
  canAnswer: {type: 'boolean'},
  reason: {type: ['string', 'null']},
  title: {type: ['string', 'null']},
  spec: {anyOf: [SPEC_SCHEMA, {type: 'null'}]}
})
