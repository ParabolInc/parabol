import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import RemoveOrgUserMutation from '../../../../mutations/RemoveOrgUserMutation'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props {
  orgId: string
}

const StyledDialogContainer = styled(DialogContainer)({
  width: 'auto'
})

const LeaveOrgModal = (props: Props) => {
  const {orgId} = props

  //FIXME i18n: Leave the organization
  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleClick = () => {
    if (submitting) return
    submitMutation()
    RemoveOrgUserMutation(
      atmosphere,
      {orgId, userId: atmosphere.viewerId},
      {history},
      onError,
      onCompleted
    )
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{t('LeaveOrgModal.AreYouSure')}</DialogTitle>
      <DialogContent>
        {t('LeaveOrgModal.ThisWillRemoveYouFromTheOrganizationAndAllTeamsUnderIt')}
        <br />
        {t('LeaveOrgModal.ToUndoItYouLlHaveToAskAnotherBillingLeaderToReAddYou')}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label='Leave the organization' />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default LeaveOrgModal
