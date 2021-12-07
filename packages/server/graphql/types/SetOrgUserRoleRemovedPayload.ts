import {GraphQLObjectType} from 'graphql'
import SetOrgUserRolePayload, {setOrgUserRoleFields} from './SetOrgUserRolePayload'
import {GQLContext} from '../graphql'

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
