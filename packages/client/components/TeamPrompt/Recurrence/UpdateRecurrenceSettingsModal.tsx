import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import UpdateRecurrenceSettingsMutation from '~/mutations/UpdateRecurrenceSettingsMutation'
import {UpdateRecurrenceSettingsModal_meeting$key} from '~/__generated__/UpdateRecurrenceSettingsModal_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps, {getOnCompletedError} from '../../../hooks/useMutationProps'
import {PALETTE} from '../../../styles/paletteV3'
import {CompletedHandler} from '../../../types/relayMutations'
import {UpdateRecurrenceSettingsMutationResponse} from '../../../__generated__/UpdateRecurrenceSettingsMutation.graphql'
import PlainButton from '../../PlainButton/PlainButton'
import {RecurrenceSettings} from './RecurrenceSettings'

const UpdateRecurrenceSettingsModalRoot = styled('div')({
  backgroundColor: PALETTE.WHITE,
  position: 'relative',
  width: 400
})

const StyledCloseButton = styled(PlainButton)({
  position: 'absolute',
  height: 24,
  top: 0,
  right: 0,
  margin: 16
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5
  }
})

const ActionsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 16
})

const UpdateButton = styled(PlainButton)({
  height: 36,
  backgroundColor: PALETTE.SKY_500,
  color: PALETTE.WHITE,
  padding: '0px 16px',
  textAlign: 'center',
  borderRadius: 32,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: PALETTE.SKY_600
  },
  ':focus, :focus-visible, :active': {
    outline: `1px solid ${PALETTE.SKY_600}`,
    outlineOffset: 1
  }
})

const ErrorContainer = styled('div')({
  color: PALETTE.TOMATO_500,
  padding: '0px 16px 16px 16px'
})

interface Props {
  meeting: UpdateRecurrenceSettingsModal_meeting$key
  recurrenceRule?: string
  closeModal: () => void
}

export const UpdateRecurrenceSettingsModal = (props: Props) => {
  const {recurrenceRule: recurrenceRuleString, closeModal, meeting: meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment UpdateRecurrenceSettingsModal_meeting on NewMeeting {
        id
      }
    `,
    meetingRef
  )

  const atmosphere = useAtmosphere()
  const [recurrenceRule, setRecurrenceRule] = useState<RRule | null>(
    recurrenceRuleString ? RRule.fromString(recurrenceRuleString) : null
  )
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const onRecurrenceSettingsUpdated: CompletedHandler<UpdateRecurrenceSettingsMutationResponse> = (
    res,
    errors
  ) => {
    onCompleted(res as any, errors)
    const error = getOnCompletedError(res as any, errors)
    if (!error) {
      closeModal()
    }
  }

  const onUpdateRecurrenceClicked = () => {
    if (submitting) return
    submitMutation()

    UpdateRecurrenceSettingsMutation(
      atmosphere,
      {meetingId: meeting.id, recurrenceRule: recurrenceRule?.toString()},
      {onError, onCompleted: onRecurrenceSettingsUpdated}
    )
  }

  return (
    <UpdateRecurrenceSettingsModalRoot>
      <RecurrenceSettings
        parentId='updateRecurrenceSettingsModal'
        recurrenceRule={recurrenceRule}
        onRecurrenceRuleUpdated={setRecurrenceRule}
      />
      <StyledCloseButton onClick={closeModal}>
        <CloseIcon />
      </StyledCloseButton>
      <ActionsContainer>
        <UpdateButton onClick={onUpdateRecurrenceClicked}>Update</UpdateButton>
      </ActionsContainer>
      {error && <ErrorContainer>{error.message}</ErrorContainer>}
    </UpdateRecurrenceSettingsModalRoot>
  )
}
