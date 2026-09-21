import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptReplyButton_edges$key} from '~/__generated__/TeamPromptReplyButton_edges.graphql'
import type {TeamPromptResponseFooter_response$key} from '~/__generated__/TeamPromptResponseFooter_response.graphql'
import {TeamPromptResponseEmojis} from '../TeamPromptResponseEmojis'
import TeamPromptReplyButton from './TeamPromptReplyButton'

interface Props {
  meetingId: string
  responseRef: TeamPromptResponseFooter_response$key
  edgesRef: TeamPromptReplyButton_edges$key
  onReply: () => void
}

const TeamPromptResponseFooter = ({meetingId, responseRef, edgesRef, onReply}: Props) => {
  const response = useFragment(
    graphql`
      fragment TeamPromptResponseFooter_response on TeamPromptResponse {
        ...TeamPromptResponseEmojis_response
      }
    `,
    responseRef
  )
  return (
    <div className='flex flex-wrap items-center justify-start pt-1'>
      <TeamPromptResponseEmojis responseRef={response} meetingId={meetingId} />
      <TeamPromptReplyButton edgesRef={edgesRef} onReply={onReply} />
    </div>
  )
}

export default TeamPromptResponseFooter
