import styled from '@emotion/styled'
import {Add, Check} from '@mui/icons-material'
import React from 'react'
import DialogTitle from '../../../../components/DialogTitle'
import {PALETTE} from '../../../../styles/paletteV3'
import {ExternalLinks} from '../../../../types/constEnums'

const IconBlock = styled('div')({
  padding: '0px 8px 0 8px'
})

const StyledAddIcon = styled(Add)({
  color: PALETTE.SKY_500,
  width: '24px',
  height: '24px',
  ':hover': {
    cursor: 'pointer'
  }
})

const StyledCheckIcon = styled(Check)({
  color: PALETTE.SUCCESS_LIGHT,
  width: '24px',
  height: '24px',
  ':hover': {
    cursor: 'pointer'
  }
})

const SSOEnabledToggleBlock = styled('div')({
  padding: '0 16px 28px 16px',
  maxWidth: '500px'
})

const ContentWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  border: `1px solid ${PALETTE.SLATE_500}`,
  borderRadius: '4px',
  padding: '4px 8px 4px '
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

interface Props {
  disabled: boolean
}

const OrgAuthenticationSSOEnabled = (props: Props) => {
  const {disabled} = props

  const isSSOEnabled = false

  return (
    <SSOEnabledToggleBlock>
      <ContentWrapper>
        <IconBlock>
          {isSSOEnabled ? (
            <StyledCheckIcon>{'check'}</StyledCheckIcon>
          ) : (
            <StyledAddIcon>{'add'}</StyledAddIcon>
          )}
        </IconBlock>
        <SSOEnabledLabelBlock>
          <SubTitle>Enable SSO</SubTitle>
          <SSOEnabledLabel>
            <ContactLink
              href={`${ExternalLinks.CONTACT}?subject=${
                disabled ? 'Enable SSO' : 'Update Email Domains'
              }`}
              title={'Contact customer success to enable SSO'}
            >
              Contact customer success
            </ContactLink>{' '}
            {disabled ? 'to enable SSO' : 'to update email domains'}
          </SSOEnabledLabel>
        </SSOEnabledLabelBlock>
      </ContentWrapper>
    </SSOEnabledToggleBlock>
  )
}

export default OrgAuthenticationSSOEnabled
