import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
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

  const {t} = useTranslation()

  return (
    <StyledDialogContainer>
      <DialogTitle>
        {serviceName}
        {t('TaskFooterTeamAssigneeAddIntegrationDialog.IntegrationFor')}
        {teamName}
      </DialogTitle>
      <DialogContent>
        <div>
          <StyledTip>
            {t('TaskFooterTeamAssigneeAddIntegrationDialog.YouDontHave')}
            {serviceName}
            {t('TaskFooterTeamAssigneeAddIntegrationDialog.ConfiguredFor')}
            {teamName}
            {t('TaskFooterTeamAssigneeAddIntegrationDialog.DoYouWantToAddItNow')}
          </StyledTip>
          <ButtonGroup>
            <SecondaryButton onClick={onClose} size='medium'>
              {t('TaskFooterTeamAssigneeAddIntegrationDialog.Cancel')}
            </SecondaryButton>
            <StyledPrimaryButton onClick={onConfirm} size='medium'>
              {t('TaskFooterTeamAssigneeAddIntegrationDialog.AddItNow')}
            </StyledPrimaryButton>
          </ButtonGroup>
        </div>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default TaskFooterTeamAssigneeAddIntegrationDialog
