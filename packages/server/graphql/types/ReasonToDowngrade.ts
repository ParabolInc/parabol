import {GraphQLEnumType} from 'graphql'

export type ReadableReasonToDowngradeEnum =
  | 'Parabol is too expensive'
  | 'Budget changes'
  | 'Missing key features'
  | `Not using Parabol's paid features`
  | 'Moving to another tool (please specify)'

const ReasonToDowngradeEnum = new GraphQLEnumType({
  name: 'ReasonToDowngradeEnum',
  description: 'Where the upgrade CTA button was clicked',
  values: {
    tooExpensive: {},
    budgetChanges: {},
    missingKeyFeatures: {},
    notUsingPaidFeatures: {},
    anotherTool: {}
  }
})

export default ReasonToDowngradeEnum
