import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaAddJira_meeting$key} from '../__generated__/ScopePhaseAreaAddJira_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {PALETTE} from '../styles/paletteV3'
import {ExternalLinks} from '../types/constEnums'
import AtlassianClientManager, {ERROR_POPUP_CLOSED} from '../utils/AtlassianClientManager'
import JiraSVG from './JiraSVG'
import RaisedButton from './RaisedButton'

const AddJiraArea = styled('div')({
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

const AddJiraButton = styled(RaisedButton)({
  whiteSpace: 'pre-wrap'
})
interface Props {
  gotoParabol: () => void
  meetingRef: ScopePhaseAreaAddJira_meeting$key
}

const ScopePhaseAreaAddJira = (props: Props) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error} = mutationProps

  const {gotoParabol, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAddJira_meeting on PokerMeeting {
        teamId
      }
    `,
    meetingRef
  )
  const {teamId} = meeting

  const errorMessage = useMemo(() => {
    if (!error) return undefined
    const {message} = error
    if (message === ERROR_POPUP_CLOSED) {
      return (
        <>
          Having trouble authorizing Parabol? Try our{' '}
          <a
            href={ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_AUTHORIZATION}
            target='_blank'
            rel='noreferrer'
          >
            troubleshooting guide
          </a>
        </>
      )
    }
    return message
  }, [error])

  const authJira = () => {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  return (
    <AddJiraArea>
      <AddJiraButton onClick={authJira} size={'medium'}>
        <JiraSVG />
        Import issues from Jira
      </AddJiraButton>
      {errorMessage && (
        <div className='p-4 pb-0 text-tomato-500 [&_a]:font-semibold [&_a]:text-tomato-500 [&_a]:underline'>
          {errorMessage}
        </div>
      )}
      <StyledLink onClick={gotoParabol}>Or add new tasks in Parabol</StyledLink>
    </AddJiraArea>
  )
}

export default ScopePhaseAreaAddJira
