import styled from '@emotion/styled'
import React from 'react'
import DialogContainer from '~/components/DialogContainer'
import DialogContent from '~/components/DialogContent'
import DialogTitle from '~/components/DialogTitle'
import PrimaryButton from '~/components/PrimaryButton'
import SecondaryButton from '~/components/SecondaryButton'

interface Props {
  onClose: () => void
  onConfirm: () => void
  serviceName: string
  teamName: string
}

const StyledDialogContainer = styled(DialogContainer)({
  width: 480
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const StyledTip = styled('p')({
  fontSize: 14,
  lineHeight: '20px',
  margin: 0,
  padding: '0 0 16px'
})

const StyledPrimaryButton = styled(PrimaryButton)({
  marginLeft: 16
})

const TaskFooterTeamAssigneeAddIntegrationDialog = (props: Props) => {
  const {onClose, onConfirm, serviceName, teamName} = props

  return (
    <StyledDialogContainer>
      <DialogTitle>
        {serviceName} integration for {teamName}
      </DialogTitle>
      <DialogContent>
        <div>
          <StyledTip>
            You don't have {serviceName} configured for {teamName}. Do you want to add it now?
          </StyledTip>
          <ButtonGroup>
            <SecondaryButton onClick={onClose} size='medium'>
              Cancel
            </SecondaryButton>
            <StyledPrimaryButton onClick={onConfirm} size='medium'>
              Add it now
            </StyledPrimaryButton>
          </ButtonGroup>
        </div>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default TaskFooterTeamAssigneeAddIntegrationDialog
