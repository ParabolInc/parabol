import styled from '@emotion/styled'
import React from 'react'
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
  return (
    <Container>
      <Illustration src={upgradeLaterSvg} />
      <InvitationDialogCopy>{'Your organization has exceeded'}</InvitationDialogCopy>
      <InvitationDialogCopy>
        {'the free tier limit of '}
        <b>{'2 teams'}</b>
        {'.'}
      </InvitationDialogCopy>
      <CopySpacer>{'We’ll send you an email so'}</CopySpacer>
      <InvitationDialogCopy>{'you can upgrade later'}</InvitationDialogCopy>
      <ButtonBlock>
        <ModalButton size='large' onClick={closePortal}>
          {'Back to Business'}
        </ModalButton>
      </ButtonBlock>
    </Container>
  )
}

export default UpgradeLater
