import {Edit} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {type ReactNode, useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptEditablePrompt_meeting$key} from '~/__generated__/TeamPromptEditablePrompt_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import UpdateMeetingPromptMutation from '~/mutations/UpdateMeetingPromptMutation'
import {cn} from '../../ui/cn'
import TeamPromptEditablePromptModal from './TeamPromptEditablePromptModal'

interface PromptProps {
  isEditable?: boolean
  onClick?: () => void
  children: ReactNode
}

const Prompt = (props: PromptProps) => {
  const {isEditable = false, onClick, children} = props
  return (
    <h1
      className={cn(
        'mx-[7%] my-4 flex items-center justify-center text-center font-normal text-[20px] leading-8',
        isEditable ? 'cursor-pointer hover:opacity-50' : 'cursor-default'
      )}
      onClick={onClick}
    >
      {children}
    </h1>
  )
}

interface Props {
  meetingRef: TeamPromptEditablePrompt_meeting$key
}

const TeamPromptEditablePrompt = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onCompleted, onError, error} = useMutationProps()
  const [isOpen, setIsOpen] = useState(false)
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptEditablePrompt_meeting on TeamPromptMeeting {
        id
        facilitatorUserId
        meetingPrompt
        endedAt
      }
    `,
    meetingRef
  )

  const {id: meetingId, meetingPrompt, facilitatorUserId, endedAt} = meeting
  const {viewerId} = atmosphere
  const isFacilitator = viewerId === facilitatorUserId

  const handleUpdatePrompt = (newPrompt: string) => {
    if (submitting) return
    submitMutation()

    UpdateMeetingPromptMutation(atmosphere, {meetingId, newPrompt}, {onError, onCompleted})
  }

  return (
    <>
      {isFacilitator && !endedAt ? (
        <>
          <Prompt isEditable={isFacilitator} onClick={() => setIsOpen(true)}>
            {meetingPrompt}
            <Edit className='ml-4 text-fg-secondary' />
          </Prompt>
          <TeamPromptEditablePromptModal
            isOpen={isOpen}
            initialPrompt={meetingPrompt}
            onCloseModal={() => setIsOpen(false)}
            onSubmitUpdatePrompt={handleUpdatePrompt}
            error={error?.message}
            onCompleted={onCompleted}
          />
        </>
      ) : (
        <Prompt>{meetingPrompt}</Prompt>
      )}
    </>
  )
}

export default TeamPromptEditablePrompt
