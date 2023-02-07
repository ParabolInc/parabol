import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import React from 'react'
import DialogTitle from '../../../../components/DialogTitle'
import {PALETTE} from '../../../../styles/paletteV3'

const IconBlock = styled('div')({
  display: 'flex',
  marginRight: '8px'
})

const StyledAddIcon = styled(Add)({
  color: PALETTE.SKY_500,
  width: '24px',
  height: '24px',
  ':hover': {
    cursor: 'pointer'
  }
})

const SSOEnabledToggleBlock = styled('div')({
  display: 'flex',
  width: '500px',
  padding: '4px 16px',
  border: `1px solid ${PALETTE.SLATE_500}`,
  borderRadius: '4px',
  marginLeft: '16px',
  marginBottom: '28px'
})

const SSOEnabledLabelBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const SubTitle = styled(DialogTitle)({
  color: PALETTE.SLATE_700,
  fontSize: '16px',
  padding: 0
})

const SSOEnabledLabel = styled('span')({
  color: PALETTE.SLATE_700,
  fontSize: '14px'
})

const ContactLink = styled('a')({
  fontSize: '14px',
  fontWeight: 600,
  color: PALETTE.SKY_500,

  '&:focus, &:active': {
    color: PALETTE.SKY_500
  }
})

const OrgAuthenticationSSOEnabled = () => {
  return (
    <SSOEnabledToggleBlock>
      <IconBlock>
        <StyledAddIcon>{'info'}</StyledAddIcon>
      </IconBlock>
      <SSOEnabledLabelBlock>
        <SubTitle>Enable SSO</SubTitle>
        <SSOEnabledLabel>
          <ContactLink
            href={'mailto:support@parabol.co'}
            title={'Contact customer success to enable SSO'}
          >
            Contact customer success
          </ContactLink>{' '}
          to enable SSO
        </SSOEnabledLabel>
      </SSOEnabledLabelBlock>
    </SSOEnabledToggleBlock>
  )
}

export default OrgAuthenticationSSOEnabled
