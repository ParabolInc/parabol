import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import LinearClientManager from '~/utils/LinearClientManager'
import {ScopePhaseAreaAddLinear_meeting$key} from '../__generated__/ScopePhaseAreaAddLinear_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {PALETTE} from '../styles/paletteV3'
import LinearSVG from './LinearSVG'
import RaisedButton from './RaisedButton'

const AddLinearArea = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100%'
})

const StyledLink = styled('span')({
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  outline: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SKY_600
  },
  paddingTop: 24
})

const AddLinearButton = styled(RaisedButton)({
  whiteSpace: 'pre-wrap'
})

interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddLinear_meeting$key
}

const ScopePhaseAreaAddLinear = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddLinear_meeting on PokerMeeting {
        teamId
        viewerMeetingMember {
          teamMember {
            integrations {
              linear {
                cloudProvider {
                  id
                  clientId
                  serverBaseUrl
                }
                sharedProviders {
                  id
                  clientId
                  serverBaseUrl
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
  if (!viewerMeetingMember) return null
  const {teamMember} = viewerMeetingMember
  const {integrations} = teamMember
  const {linear} = integrations
  const provider = linear?.sharedProviders[0] ?? linear?.cloudProvider
  if (!provider) return null

  const authLinear = () => {
    LinearClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }
  return (
    <AddLinearArea>
      <AddLinearButton onClick={authLinear} size={'medium'}>
        <LinearSVG />
        Import issues from Linear
      </AddLinearButton>
      <StyledLink onClick={gotoParabol}>Or add new tasks in Parabol</StyledLink>
    </AddLinearArea>
  )
}

export default ScopePhaseAreaAddLinear
