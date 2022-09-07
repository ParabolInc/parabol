import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
import upgradeLaterSvg from '../../../static/images/illustrations/conversion_prompt-upgrade_later.svg'
import DialogContainer from './DialogContainer'
import InvitationDialogCopy from './InvitationDialogCopy'
import SecondaryButton from './SecondaryButton'

const Illustration = styled('img')({
  display: 'block ',
  maxWidth: 256
})

const ButtonBlock = styled('div')({
  padding: 24
})

const ModalButton = styled(SecondaryButton)({
  padding: 8,
  width: 264
})

const Container = styled(DialogContainer)({
  alignItems: 'center'
})

const CopySpacer = styled(InvitationDialogCopy)({
  paddingTop: 16
})

interface Props {
  closePortal: () => void
}

const UpgradeLater = (props: Props) => {
  const {closePortal} = props

  const {t} = useTranslation()

  return (
    <Container>
      <Illustration src={upgradeLaterSvg} />
      <InvitationDialogCopy>{t('UpgradeLater.YourOrganizationHasExceeded')}</InvitationDialogCopy>
      <InvitationDialogCopy>
        {t('UpgradeLater.TheFreeTierLimitOf')}
        <b>{t('UpgradeLater.2Teams')}</b>
        {t('UpgradeLater.')}
      </InvitationDialogCopy>
      <CopySpacer>{t('UpgradeLater.WeLlSendYouAnEmailSo')}</CopySpacer>
      <InvitationDialogCopy>{t('UpgradeLater.YouCanUpgradeLater')}</InvitationDialogCopy>
      <ButtonBlock>
        <ModalButton size='large' onClick={closePortal}>
          {t('UpgradeLater.BackToBusiness')}
        </ModalButton>
      </ButtonBlock>
    </Container>
  )
}

export default UpgradeLater
