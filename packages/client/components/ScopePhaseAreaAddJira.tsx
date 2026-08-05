import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {ScopePhaseAreaAddJira_meeting$key} from '../__generated__/ScopePhaseAreaAddJira_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {ExternalLinks} from '../types/constEnums'
import AtlassianClientManager, {ERROR_POPUP_CLOSED} from '../utils/AtlassianClientManager'
import JiraSVG from './JiraSVG'
import RaisedButton from './RaisedButton'

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
    <div className='flex h-full flex-col items-center justify-center'>
      <RaisedButton className='gap-2 whitespace-pre-wrap' onClick={authJira} size={'medium'}>
        <JiraSVG />
        Import issues from Jira
      </RaisedButton>
      {errorMessage && (
        <div className='p-4 pb-0 text-fg-error [&_a]:font-semibold [&_a]:text-fg-error [&_a]:underline'>
          {errorMessage}
        </div>
      )}
      <span
        className='cursor-pointer pt-6 text-accent outline-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
        onClick={gotoParabol}
      >
        Or add new tasks in Parabol
      </span>
    </div>
  )
}

export default ScopePhaseAreaAddJira
