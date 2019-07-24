import {GraphQLEnumType} from 'graphql'
import {GITHUB, SLACK} from '../../../client/utils/constants'

const IntegrationServiceEnum = new GraphQLEnumType({
  name: 'IntegrationServiceEnum',
  description: 'The list of services for integrations',
  values: {
    [GITHUB]: {},
    [SLACK]: {},
    atlassian: {}
  }
})

export default IntegrationServiceEnum
