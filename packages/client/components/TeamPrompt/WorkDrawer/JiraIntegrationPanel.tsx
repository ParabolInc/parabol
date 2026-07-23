import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import type {JiraIntegrationPanel_meeting$key} from '../../../__generated__/JiraIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import useMutationProps from '../../../hooks/useMutationProps'
import AtlassianClientManager from '../../../utils/AtlassianClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import InspirationItemsPanel from './InspirationItemsPanel'
import JiraIntegrationResultsRoot from './JiraIntegrationResultsRoot'
import {WorkDrawerDateFilter} from './WorkDrawerDateFilter'

interface Props {
  meetingRef: JiraIntegrationPanel_meeting$key
}

const JiraIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment JiraIntegrationPanel_meeting on NewMeeting {
        ...useInspirationDrawer_meeting
        id
        teamId
        jiraInspirationItems: inspirationItems(service: jira) {
          id
          title
          content
          promptId
        }
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              atlassian {
                isActive
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()
  const teamMember = meeting.viewerMeetingMember?.teamMember

  const {dateRange, setDateRange, onResultCount, getHasResults} = useInspirationDrawer(
    'jira',
    meeting
  )

  // JQL search re-run server-side when drafting a response, so the query the user sees and the
  // query the server runs stay in sync by construction.
  const dateQueryString = dateRange
    ? `updated >= "${dayjs(dateRange.startAt).format('YYYY-MM-DD HH:mm')}" AND updated <= "${dayjs(dateRange.endAt).format('YYYY-MM-DD HH:mm')}"`
    : ''
  const conditions = ['assignee = currentUser()', dateQueryString].filter(Boolean).join(' AND ')
  const searchQuery = `${conditions} order by updated DESC`
  const hasResults = getHasResults(searchQuery)

  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps

  const authJira = () => {
    if (!teamMember) {
      return onError(new Error('Could not find team member'))
    }
    AtlassianClientManager.openOAuth(atmosphere, teamMember.teamId, mutationProps)

    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'jira'
    })
  }

  return (
    <>
      {teamMember?.integrations.atlassian?.isActive ? (
        <>
          <div className='mb-2 flex w-full px-2'>
            <WorkDrawerDateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
            {hasResults && (
              <InspirationItemsPanel
                meetingId={meeting.id}
                service='jira'
                searchQuery={searchQuery}
                initialItems={meeting.jiraInspirationItems}
              />
            )}
            <JiraIntegrationResultsRoot
              teamId={teamMember.teamId}
              searchQuery={searchQuery}
              onResultCount={onResultCount}
            />
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center gap-2 pt-12'>
          <div className='h-10 w-10'>{/* <img className='h-10 w-10' src={gitHubSVG} /> */}</div>
          <b>Connect to Jira</b>
          <div className='w-1/2 text-center text-sm'>Connect to Jira to view your issues.</div>
          <button
            className='mt-4 cursor-pointer rounded-md bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authJira}
          >
            Connect
          </button>
          {error && <div className='text-fg-error'>Error: {error.message}</div>}
        </div>
      )}
    </>
  )
}

export default JiraIntegrationPanel
