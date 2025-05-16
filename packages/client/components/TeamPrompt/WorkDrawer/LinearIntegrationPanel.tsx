import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {LinearIntegrationPanel_meeting$key} from '../../../__generated__/LinearIntegrationPanel_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import linearSVG from '../../../styles/theme/images/graphics/linear.svg'
import LinearClientManager from '../../../utils/LinearClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import LinearIntegrationResultsRoot from './LinearIntegrationResultsRoot'
import LinearProjectFilterBar from './LinearProjectFilterBar'

interface Props {
  meetingRef: LinearIntegrationPanel_meeting$key
}

const LinearIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment LinearIntegrationPanel_meeting on TeamPromptMeeting {
        teamId
        id
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              linear {
                api {
                  query {
                    viewer {
                      id
                    }
                  }
                }
                auth {
                  isActive
                }
                cloudProvider {
                  id
                  clientId
                  serverBaseUrl
                }
              }
            }
            ...LinearProjectFilterBar_teamMember
          }
        }
      }
    `,
    meetingRef
  )

  const teamMember = meeting.viewerMeetingMember?.teamMember
  const linear = teamMember?.integrations?.linear
  const isActive = !!linear?.auth?.isActive
  const provider = linear?.cloudProvider

  const linearViewerId = linear?.api?.query?.viewer?.id

  const [selectedLinearIds, setSelectedLinearIds] = useState<string[]>([])

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps

  const authLinear = () => {
    if (!teamMember) {
      return onError(new Error('Could not find team member'))
    }
    if (!provider) {
      return onError(new Error('Could not find Linear provider'))
    }
    LinearClientManager.openOAuth(atmosphere, teamMember.teamId, provider, mutationProps)

    SendClientSideEvent(atmosphere, 'Your Work Drawer Integration Connected', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: 'linear'
    })
  }

  return (
    <>
      {isActive && linearViewerId && teamMember ? (
        <>
          <LinearProjectFilterBar
            teamMemberRef={teamMember}
            selectedLinearIds={selectedLinearIds}
            setSelectedLinearIds={(ids) => {
              SendClientSideEvent(atmosphere, 'Your Work Filter Changed', {
                teamId: meeting.teamId,
                meetingId: meeting.id,
                service: 'linear'
              })
              setSelectedLinearIds(ids)
            }}
          />
          <LinearIntegrationResultsRoot
            linearViewerId={linearViewerId}
            selectedLinearIds={selectedLinearIds}
            teamId={teamMember.teamId}
          />
        </>
      ) : !linearViewerId ? (
        <div className='-mt-14 flex h-full flex-col items-center justify-center gap-2'>
          <b>Error: Linear Integration API Not Responding</b>
          <div className='w-1/2 text-center text-sm'>Please try your request again later.</div>
        </div>
      ) : (
        <div className='-mt-14 flex h-full flex-col items-center justify-center gap-2'>
          <div className='h-10 w-10'>
            <img className='h-10 w-10' src={linearSVG} />
          </div>
          <b>Connect to Linear</b>
          <div className='w-1/2 text-center text-sm'>
            Connect to Linear to view your issues and PRs.
          </div>
          <button
            className='mt-4 cursor-pointer rounded-full bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authLinear}
          >
            Connect
          </button>
          {error && <div className='text-tomato-500'>Error: {error.message}</div>}
        </div>
      )}
    </>
  )
}

export default LinearIntegrationPanel
