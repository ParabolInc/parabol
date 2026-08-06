import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ScopePhaseAreaAddJiraServer_meeting$key} from '../__generated__/ScopePhaseAreaAddJiraServer_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {Button} from '../ui/Button/Button'
import {SALES_EMAIL} from '../utils/constants'
import JiraServerClientManager from '../utils/JiraServerClientManager'
import JiraServerSVG from './JiraServerSVG'

interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddJiraServer_meeting$key
}

const ScopePhaseAreaAddJiraServer = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddJiraServer_meeting on PokerMeeting {
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              jiraServer {
                auth {
                  id
                  isActive
                }
                sharedProviders {
                  id
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {teamId, viewerMeetingMember} = meeting

  const provider = viewerMeetingMember?.teamMember.integrations.jiraServer.sharedProviders[0]

  if (!provider)
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <div className='max-w-[360px] text-center'>
          <p className='mb-2 font-semibold text-base'>
            {'Bring your Jira Data Center issues into your retros and sprint planning.'}
          </p>
          <p className='text-fg-secondary text-sm'>
            {'Ready to unlock it for your org? Reach out to '}
            <a
              className='text-accent no-underline hover:text-sky-600 focus:text-sky-600'
              href={`mailto:${SALES_EMAIL}`}
            >
              {SALES_EMAIL}
            </a>
            {" and we'll get you set up."}
          </p>
        </div>
      </div>
    )

  const openOAuth = () => {
    JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
  }

  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <Button
        variant='raised'
        size='md'
        className='gap-2 whitespace-pre-wrap bg-slate-200 text-slate-700'
        onClick={openOAuth}
      >
        <JiraServerSVG />
        Import issues from Jira Data Center
      </Button>
      <span
        className='cursor-pointer pt-6 text-accent outline-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
        onClick={gotoParabol}
      >
        Or add new tasks in Parabol
      </span>
    </div>
  )
}

export default ScopePhaseAreaAddJiraServer
