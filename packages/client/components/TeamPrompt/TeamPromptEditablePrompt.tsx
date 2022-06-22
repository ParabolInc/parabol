import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useModal from '~/hooks/useModal'
import useMutationProps from '~/hooks/useMutationProps'
import UpdateMeetingPromptMutation from '~/mutations/UpdateMeetingPromptMutation'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {TeamPromptEditablePrompt_meeting$key} from '~/__generated__/TeamPromptEditablePrompt_meeting.graphql'
import Icon from '../Icon'
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

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginLeft: 16
})

interface Props {
  meetingRef: TeamPromptEditablePrompt_meeting$key
}

const TeamPromptEditablePrompt = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onCompleted, onError, error} = useMutationProps()
  const {closePortal, openPortal, modalPortal} = useModal()
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

  const handleUpdatePrompt = (newPrompt) => {
    if (submitting) return
    submitMutation()

    UpdateMeetingPromptMutation(atmosphere, {meetingId, newPrompt}, {onError, onCompleted})
  }

  return (
    <>
      {isFacilitator && !endedAt ? (
        <>
          <Prompt isEditable={isFacilitator} onClick={openPortal}>
            {meetingPrompt}
            <StyledIcon>edit</StyledIcon>
          </Prompt>
          {modalPortal(
            <TeamPromptEditablePromptModal
              initialPrompt={meetingPrompt}
              onCloseModal={closePortal}
              onSubmitUpdatePrompt={handleUpdatePrompt}
              error={error?.message}
              onCompleted={onCompleted}
            />
          )}
        </>
      ) : (
        <Prompt>{meetingPrompt}</Prompt>
      )}
    </>
  )
}

export default TeamPromptEditablePrompt
