import type {RepoListCapability} from '../platform/ServerIntegrationDefinition'

export interface ClickUpRepo {
  service: 'clickup'
  id: string
  name: string
}

const fetchClickUpRepos: RepoListCapability<ClickUpRepo>['fetchRepos'] = async () =>
  new Error('ClickUp: listing repos is not implemented')

export default fetchClickUpRepos
