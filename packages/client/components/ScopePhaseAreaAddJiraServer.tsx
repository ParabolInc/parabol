import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ScopePhaseAreaAddJiraServer_meeting$key} from '../__generated__/ScopePhaseAreaAddJiraServer_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {SALES_EMAIL} from '../utils/constants'
import JiraServerClientManager from '../utils/JiraServerClientManager'
import JiraServerSVG from './JiraServerSVG'
import RaisedButton from './RaisedButton'

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
          <p className='text-slate-600 text-sm'>
            {'Ready to unlock it for your org? Reach out to '}
            <a
              className='text-sky-500 no-underline hover:text-sky-600 focus:text-sky-600'
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
      <RaisedButton className='gap-2 whitespace-pre-wrap' onClick={openOAuth} size={'medium'}>
        <JiraServerSVG />
        Import issues from Jira Data Center
      </RaisedButton>
      <span
        className='cursor-pointer pt-6 text-sky-500 outline-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
        onClick={gotoParabol}
      >
        Or add new tasks in Parabol
      </span>
    </div>
  )
}

export default ScopePhaseAreaAddJiraServer
