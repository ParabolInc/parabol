import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {Add, Check} from '@mui/icons-material'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgAuthenticationSSOFrame_samlInfo$key} from '~/__generated__/OrgAuthenticationSSOFrame_samlInfo.graphql'
import makeMaxWidthMediaQuery from '~/utils/makeMaxWidthMediaQuery'
import DialogTitle from '../../../../components/DialogTitle'
import {PALETTE} from '../../../../styles/paletteV3'
import {ExternalLinks} from '../../../../types/constEnums'

const mobileBreakpoint = makeMaxWidthMediaQuery(420)

const IconBlock = styled('div')({
  padding: '0px 8px 0 8px'
})

const StyledAddIcon = styled(Add)({
  color: PALETTE.SKY_500,
  width: '24px',
  height: '24px'
})

const StyledCheckIcon = styled(Check)({
  color: PALETTE.SUCCESS_LIGHT,
  width: '24px',
  height: '24px'
})

const SSOEnabledToggleBlock = styled('div')({
  padding: '0 16px 28px 16px'
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

const DomainWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  [mobileBreakpoint]: {
    flexDirection: 'column'
  }
})

const DomainChips = styled('span')({
  backgroundColor: PALETTE.SLATE_200,
  borderRadius: '12px',
  padding: '4px 12px',
  margin: '8px 8px 4px 0',
  fontSize: '14px',
  fontWeight: 600,
  color: PALETTE.SLATE_800,
  width: 'fit-content'
})

interface Props {
  samlInfo: OrgAuthenticationSSOFrame_samlInfo$key | null
  disabled: boolean
}

const OrgAuthenticationSSOFrame = (props: Props) => {
  const {samlInfo: samlInfoRef, disabled} = props

  const samlInfo = useFragment(
    graphql`
      fragment OrgAuthenticationSSOFrame_samlInfo on SAMLInfo {
        id
        domains
        url
        metadata
      }
    `,
    samlInfoRef
  )

  const isSSOEnabled = samlInfo?.domains && samlInfo?.url && samlInfo?.metadata

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
          {samlInfo?.domains && samlInfo?.domains.length > 0 && (
            <DomainWrapper>
              {samlInfo.domains.map((domain) => (
                <DomainChips key={domain}>{domain}</DomainChips>
              ))}
            </DomainWrapper>
          )}
        </SSOEnabledLabelBlock>
      </ContentWrapper>
    </SSOEnabledToggleBlock>
  )
}

export default OrgAuthenticationSSOFrame
