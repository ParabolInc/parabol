import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptReplyButton_edges$key} from '~/__generated__/TeamPromptReplyButton_edges.graphql'
import type {TeamPromptResponseFooter_response$key} from '~/__generated__/TeamPromptResponseFooter_response.graphql'
import {cn} from '../../../ui/cn'
import {TeamPromptResponseEmojis} from '../TeamPromptResponseEmojis'
import TeamPromptReplyButton from './TeamPromptReplyButton'

interface Props {
  meetingId: string
  responseRef: TeamPromptResponseFooter_response$key
  edgesRef: TeamPromptReplyButton_edges$key
  onReply: () => void
  isPhone?: boolean
  className?: string
}

const TeamPromptResponseFooter = ({
  meetingId,
  responseRef,
  edgesRef,
  onReply,
  isPhone,
  className
}: Props) => {
  const response = useFragment(
    graphql`
      fragment TeamPromptResponseFooter_response on TeamPromptResponse {
        ...TeamPromptResponseEmojis_response
      }
    `,
    responseRef
  )
  return (
    <div className={cn('flex flex-wrap items-center justify-start pt-1', className)}>
      <TeamPromptResponseEmojis responseRef={response} meetingId={meetingId} isPhone={isPhone} />
      <TeamPromptReplyButton edgesRef={edgesRef} onReply={onReply} isPhone={isPhone} />
    </div>
  )
}

export default TeamPromptResponseFooter
