import styled from '@emotion/styled'
import {Edit} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptEditablePrompt_meeting$key} from '~/__generated__/TeamPromptEditablePrompt_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import UpdateMeetingPromptMutation from '~/mutations/UpdateMeetingPromptMutation'
import TeamPromptEditablePromptModal from './TeamPromptEditablePromptModal'

const Prompt = styled('h1')<{isEditable?: boolean}>(({isEditable = false}) => ({
  textAlign: 'center',
  margin: '16px 7%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  lineHeight: '32px',
  fontWeight: 400,
  cursor: isEditable ? 'pointer' : 'default',
  ':hover': {
    opacity: isEditable ? 0.5 : undefined
  }
}))

const StyledIcon = styled(Edit)({
  color: 'var(--color-fg-secondary)',
  marginLeft: 16
})

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
            <StyledIcon />
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
