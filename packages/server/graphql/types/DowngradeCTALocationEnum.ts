import {GraphQLEnumType} from 'graphql'

export type DowngradeCTALocationEnumType = 'billing'

const DowngradeCTALocationEnum = new GraphQLEnumType({
  name: 'DowngradeCTALocationEnum',
  description: 'Where the downgrade CTA button was clicked',
  values: {
    billing: {}
  }
})

export default DowngradeCTALocationEnum
