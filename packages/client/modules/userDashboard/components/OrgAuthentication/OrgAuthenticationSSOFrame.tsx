import styled from '@emotion/styled'
import {Add, Check} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgAuthenticationSSOFrame_saml$key} from '../../../../__generated__/OrgAuthenticationSSOFrame_saml.graphql'
import DialogTitle from '../../../../components/DialogTitle'
import {PALETTE} from '../../../../styles/paletteV3'
import {ExternalLinks} from '../../../../types/constEnums'

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
  samlRef: OrgAuthenticationSSOFrame_saml$key | null
}

const OrgAuthenticationSSOFrame = (props: Props) => {
  const {samlRef} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationSSOFrame_saml on SAML {
        id
        domains
      }
    `,
    samlRef
  )
  const disabled = !saml
  const domains: readonly string[] = saml?.domains ?? []

  return (
    <div className='px-6 pb-8'>
      <ContentWrapper>
        <IconBlock>{disabled ? <StyledAddIcon /> : <StyledCheckIcon />}</IconBlock>
        <SSOEnabledLabelBlock>
          <SubTitle>{disabled ? 'Enable SSO' : 'SSO Enabled'}</SubTitle>
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
          <div className={'flex gap-2 pt-2 pb-1 empty:hidden'}>
            {domains.map((domain) => {
              return (
                <div
                  key={domain}
                  className={
                    'bg w-max rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 select-none'
                  }
                >
                  {domain}
                </div>
              )
            })}
          </div>
        </SSOEnabledLabelBlock>
      </ContentWrapper>
    </div>
  )
}

export default OrgAuthenticationSSOFrame
