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
  userId: string
  preferredName: string
}

const StyledDialogContainer = styled(DialogContainer)({
  width: '400'
})

const RemoveFromOrgModal = (props: Props) => {
  const {orgId, preferredName, userId} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleClick = () => {
    submitMutation()
    RemoveOrgUserMutation(atmosphere, {orgId, userId}, {history}, onError, onCompleted)
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{t('RemoveFromOrgModal.AreYouSure')}</DialogTitle>
      <DialogContent>
        {`This will remove ${preferredName} from the organization. Any outstanding tasks will be given
        to the team leads. Any time remaining on their subscription will be refunded on the next
        invoice.`}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Remove ${preferredName}`} />
        </StyledButton>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default RemoveFromOrgModal
