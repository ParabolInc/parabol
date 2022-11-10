import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import SetOrgUserRolePayload, {setOrgUserRoleFields} from './SetOrgUserRolePayload'

const SetOrgUserRoleRemovedPayload: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<
  any,
  GQLContext
>({
  name: 'SetOrgUserRoleRemovedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields
  })
})

export default SetOrgUserRoleRemovedPayload
