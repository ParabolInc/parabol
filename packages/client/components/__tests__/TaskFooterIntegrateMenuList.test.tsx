import {renderToString} from 'react-dom/server'
import {RelayEnvironmentProvider} from 'react-relay'
import {
  Environment,
  fetchQuery,
  type GraphQLResponse,
  Network,
  Observable,
  RecordSource,
  Store
} from 'relay-runtime'
import TaskFooterIntegrateMenuListLocalQuery from '../../__generated__/TaskFooterIntegrateMenuListLocalQuery.graphql'
import TaskFooterIntegrateMenuList from '../TaskFooterIntegrateMenuList'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: (strings: TemplateStringsArray) => {
    const name = strings[0]!.match(/(?:query|fragment) (TaskFooterIntegrateMenu\w+)/)?.[1]
    return name ? jest.requireActual(`../../__generated__/${name}.graphql`).default : {}
  }
}))

const teamId = 'team1'

const menuBeforeJiraWasConnected: GraphQLResponse[] = [
  {
    data: {
      viewer: {
        id: 'user1',
        teamMember: {
          id: 'teamMember1',
          prevUsedRepoIntegrations: {items: []},
          services: [
            {
              __typename: 'JiraIntegrationService',
              id: 'jiraService',
              service: 'jira',
              isConnected: false
            }
          ]
        }
      }
    }
  },
  {
    data: {
      __typename: 'JiraIntegrationService',
      __isIntegrationService: 'JiraIntegrationService',
      id: 'jiraService',
      service: 'jira',
      repos: []
    },
    label:
      'TaskFooterIntegrateMenuListLocalQuery$defer$TaskFooterIntegrateMenuServiceRepos_service',
    path: ['viewer', 'teamMember', 'services', 0]
  }
]

describe('TaskFooterIntegrateMenuList', () => {
  it('refetches the cached repo list so newly connected integrations show up', async () => {
    const fetchFn = jest.fn(() =>
      Observable.create<GraphQLResponse>((sink) => {
        menuBeforeJiraWasConnected.forEach((payload) => sink.next(payload))
        sink.complete()
      })
    )
    const environment = new Environment({
      network: Network.create(fetchFn),
      store: new Store(new RecordSource())
    })
    await fetchQuery(environment, TaskFooterIntegrateMenuListLocalQuery, {teamId}).toPromise()
    expect(fetchFn).toHaveBeenCalledTimes(1)

    renderToString(
      <RelayEnvironmentProvider environment={environment}>
        <TaskFooterIntegrateMenuList
          placeholder='Search'
          teamId={teamId}
          onPushToIntegration={() => {}}
        />
      </RelayEnvironmentProvider>
    )
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})
