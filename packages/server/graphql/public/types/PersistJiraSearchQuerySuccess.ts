import type {PersistJiraSearchQuerySuccessResolvers} from '../resolverTypes'

export type PersistJiraSearchQuerySuccessSource = {
  teamId: string
  userId: string
}

const PersistJiraSearchQuerySuccess: PersistJiraSearchQuerySuccessResolvers = {
  atlassianIntegration: ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('freshAtlassianAuth').load({teamId, userId})
  }
}

export default PersistJiraSearchQuerySuccess
