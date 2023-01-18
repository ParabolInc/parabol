import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import React, {useState} from 'react'
import {RRule} from 'rrule'
import {PALETTE} from '../../../styles/paletteV3'
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

interface Props {
  recurrenceRule?: string
  closeModal: () => void
}

export const UpdateRecurrenceSettingsModal = (props: Props) => {
  const {recurrenceRule: recurrenceRuleString, closeModal} = props
  const [recurrenceRule, setRecurrenceRule] = useState<RRule | null>(
    recurrenceRuleString ? RRule.fromString(recurrenceRuleString) : null
  )

  return (
    <UpdateRecurrenceSettingsModalRoot>
      <RecurrenceSettings
        recurrenceRule={recurrenceRule}
        onRecurrenceRuleUpdated={setRecurrenceRule}
      />
      <StyledCloseButton onClick={closeModal}>
        <CloseIcon />
      </StyledCloseButton>
      <ActionsContainer>
        <UpdateButton
          onClick={() => {
            // TODO: update meeting series here
            closeModal()
          }}
        >
          Update
        </UpdateButton>
      </ActionsContainer>
    </UpdateRecurrenceSettingsModalRoot>
  )
}
