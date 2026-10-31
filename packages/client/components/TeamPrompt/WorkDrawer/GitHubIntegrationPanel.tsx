import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment, usePreloadedQuery} from 'react-relay'
import type {GitHubIntegrationPanel_meeting$key} from '../../../__generated__/GitHubIntegrationPanel_meeting.graphql'
import type {GitHubIntegrationPanelQuery} from '../../../__generated__/GitHubIntegrationPanelQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import type {WorkDrawerQueryPanelProps} from '../../../integrations/platform/ClientIntegrationDefinition'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import GitHubIntegrationResultsRoot from './GitHubIntegrationResultsRoot'
import GitHubRepoFilterBar from './GitHubRepoFilterBar'
import InspirationItemsPanel from './InspirationItemsPanel'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

const GITHUB_QUERY_TABS: {key: 'issue' | 'pullRequest'; label: string}[] = [
  {
    key: 'issue',
    label: 'Issues'
  },
  {
    key: 'pullRequest',
    label: 'Pull Requests'
  }
]

const GITHUB_QUERY_MAPPING = {
  issue: 'is:issue sort:updated involves:@me',
  pullRequest: 'is:pr sort:updated involves:@me'
}

const query = graphql`
  query GitHubIntegrationPanelQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) @required(action: THROW) {
        ...GitHubIntegrationPanel_meeting
      }
    }
  }
`

const GitHubIntegrationPanel = (props: WorkDrawerQueryPanelProps<GitHubIntegrationPanelQuery>) => {
  const {queryRef, meetingId, teamId} = props
  const {viewer} = usePreloadedQuery<GitHubIntegrationPanelQuery>(query, queryRef)
  const meeting = useFragment<GitHubIntegrationPanel_meeting$key>(
    graphql`
      fragment GitHubIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        githubInspirationItems: inspirationItems(service: github) {
          id
          title
          content
          promptId
        }
        viewerMeetingMember {
          teamMember {
            ...GitHubRepoFilterBar_teamMember
          }
        }
      }
    `,
    viewer.meeting
  )

  const atmosphere = useAtmosphere()
  const teamMember = meeting.viewerMeetingMember?.teamMember

  const {dateRange, setDateRange, onResultCount, getResultCount} = useInspirationDrawer(
    'github',
    meeting
  )

  const [githubType, setGithubType] = useSessionStorageState<'issue' | 'pullRequest'>(
    `Inspiration:github:type:${meetingId}`,
    'pullRequest'
  )
  const [selectedRepos, setSelectedRepos] = useSessionStorageState<string[]>(
    `Inspiration:github:repos:${meetingId}`,
    []
  )

  const repoQueryString = selectedRepos.map((repo) => `repo:${repo}`).join(' ')
  const dateQueryString = dateRange
    ? `updated:${dayjs(dateRange.startAt).format('YYYY-MM-DD')}..${dayjs(dateRange.endAt).format('YYYY-MM-DD')}`
    : ''
  const searchQuery = [GITHUB_QUERY_MAPPING[githubType], repoQueryString, dateQueryString]
    .filter(Boolean)
    .join(' ')

  const trackTabNavigated = (label: string) => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Tag Navigated', {
      service: 'github',
      buttonLabel: label
    })
  }

  const filterBar = teamMember ? (
    <>
      <GitHubRepoFilterBar
        teamMemberRef={teamMember}
        selectedRepos={selectedRepos}
        setSelectedRepos={(repos) => {
          SendClientSideEvent(atmosphere, 'Your Work Filter Changed', {
            teamId,
            meetingId,
            service: 'github'
          })
          setSelectedRepos(repos)
        }}
      />
      <div className='mb-2 flex w-full gap-2 px-4'>
        {GITHUB_QUERY_TABS.map((tab) => (
          <Button
            key={tab.key}
            size='md'
            aria-pressed={tab.key === githubType}
            className={cn(
              'w-1/2 text-fg-primary',
              tab.key === githubType
                ? 'bg-surface-selected font-semibold text-fg-selected hover:bg-surface-selected focus:text-fg-selected'
                : 'border border-hairline-strong bg-transparent hover:bg-surface-hover'
            )}
            onClick={() => {
              trackTabNavigated(tab.label)
              setGithubType(tab.key)
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className='mb-2 flex w-full px-2'>
        <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
      </div>
    </>
  ) : null

  return (
    <>
      {filterBar}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <InspirationItemsPanel
          meetingId={meetingId}
          service='github'
          searchQuery={searchQuery}
          initialItems={meeting.githubInspirationItems}
          hideDraftPanel={!getResultCount(searchQuery)}
        >
          <GitHubIntegrationResultsRoot
            teamId={teamId}
            queryType={githubType}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        </InspirationItemsPanel>
      </div>
    </>
  )
}

export default GitHubIntegrationPanel
