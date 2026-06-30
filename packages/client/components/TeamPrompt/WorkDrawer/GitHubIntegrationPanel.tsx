import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useCallback, useState} from 'react'
import {useFragment} from 'react-relay'
import type {GitHubIntegrationPanel_meeting$key} from '../../../__generated__/GitHubIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import gitHubSVG from '../../../styles/theme/images/graphics/github-circle.svg'
import {cn} from '../../../ui/cn'
import GitHubClientManager from '../../../utils/GitHubClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import GitHubIntegrationResultsRoot from './GitHubIntegrationResultsRoot'
import GitHubRepoFilterBar from './GitHubRepoFilterBar'
import InspirationItemsPanel from './InspirationItemsPanel'
import {WorkDrawerDateFilter, type WorkDrawerDateRange} from './WorkDrawerDateFilter'

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

interface Props {
  meetingRef: GitHubIntegrationPanel_meeting$key
}

const GitHubIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubIntegrationPanel_meeting on TeamPromptMeeting {
        teamId
        id
        prevMeeting {
          createdAt
        }
        inspirationItems(service: "github") {
          id
          title
          content
        }
        responses {
          id
          userId
          content
          plaintextContent
        }
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              github {
                isActive
              }
            }
            ...GitHubRepoFilterBar_teamMember
          }
        }
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const teamMember = meeting.viewerMeetingMember?.teamMember

  const [githubType, setGithubType] = useSessionStorageState<'issue' | 'pullRequest'>(
    `Inspiration:github:type:${meeting.id}`,
    'issue'
  )
  const [selectedRepos, setSelectedRepos] = useSessionStorageState<string[]>(
    `Inspiration:github:repos:${meeting.id}`,
    []
  )
  const [dateRange, setDateRange] = useSessionStorageState<WorkDrawerDateRange | undefined>(
    `Inspiration:github:dateRange:${meeting.id}`,
    () => ({
      startAt: meeting.prevMeeting?.createdAt ?? dayjs().subtract(24, 'hour').toISOString(),
      endAt: dayjs().endOf('day').toISOString()
    })
  )

  const repoQueryString = selectedRepos.map((repo) => `repo:${repo}`).join(' ')
  const dateQueryString = dateRange
    ? `updated:${dayjs(dateRange.startAt).format('YYYY-MM-DD')}..${dayjs(dateRange.endAt).format('YYYY-MM-DD')}`
    : ''
  const searchQuery = [GITHUB_QUERY_MAPPING[githubType], repoQueryString, dateQueryString]
    .filter(Boolean)
    .join(' ')

  const viewerResponse = meeting.responses.find((response) => response.userId === viewerId) ?? null

  // The results list lives in a separate Suspense subtree, so it reports its count back up here.
  // We pair the count with the query it came from to avoid showing the draft UI against a stale
  // result set while a new search is loading.
  const [searchResult, setSearchResult] = useState<{query: string; count: number}>()
  const onResultCount = useCallback((query: string, count: number) => {
    setSearchResult({query, count})
  }, [])
  const hasResults = searchResult?.query === searchQuery && searchResult.count > 0

  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps

  const authGitHub = () => {
    if (!teamMember) {
      return onError(new Error('Could not find team member'))
    }
    teamMember && GitHubClientManager.openOAuth(atmosphere, teamMember.teamId, mutationProps)

    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'github'
    })
  }

  const trackTabNavigated = (label: string) => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Tag Navigated', {
      service: 'github',
      buttonLabel: label
    })
  }

  return (
    <>
      {teamMember?.integrations.github?.isActive ? (
        <>
          <GitHubRepoFilterBar
            teamMemberRef={teamMember}
            selectedRepos={selectedRepos}
            setSelectedRepos={(repos) => {
              SendClientSideEvent(atmosphere, 'Your Work Filter Changed', {
                teamId: meeting.teamId,
                meetingId: meeting.id,
                service: 'github'
              })
              setSelectedRepos(repos)
            }}
          />
          <div className='mb-2 flex w-full gap-2 px-4'>
            {GITHUB_QUERY_TABS.map((tab) => (
              <div
                key={tab.key}
                className={cn(
                  'w-1/2 cursor-pointer rounded-full px-4 py-2 text-center text-slate-800 text-sm leading-3',
                  tab.key === githubType
                    ? 'bg-grape-700 font-semibold text-white focus:text-white'
                    : 'border border-slate-300 bg-white'
                )}
                onClick={() => {
                  trackTabNavigated(tab.label)
                  setGithubType(tab.key)
                }}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div className='mb-2 flex w-full px-4'>
            <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          {hasResults && (
            <InspirationItemsPanel
              meetingId={meeting.id}
              service='github'
              searchQuery={searchQuery}
              initialItems={meeting.inspirationItems}
              viewerResponse={viewerResponse}
            />
          )}
          <GitHubIntegrationResultsRoot
            teamId={teamMember.teamId}
            queryType={githubType}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        </>
      ) : (
        <div className='flex flex-col items-center gap-2 pt-12'>
          <div className='h-10 w-10'>
            <img className='h-10 w-10' src={gitHubSVG} />
          </div>
          <b>Connect to GitHub</b>
          <div className='w-1/2 text-center text-sm'>
            Connect to GitHub to view your issues and PRs.
          </div>
          <button
            className='mt-4 cursor-pointer rounded-full bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authGitHub}
          >
            Connect
          </button>
          {error && <div className='text-tomato-500'>Error: {error.message}</div>}
        </div>
      )}
    </>
  )
}

export default GitHubIntegrationPanel
