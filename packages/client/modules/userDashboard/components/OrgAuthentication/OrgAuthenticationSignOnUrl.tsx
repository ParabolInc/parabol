import styled from '@emotion/styled'
import {ContentCopy} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgAuthenticationSignOnUrl_saml$key} from '../../../../__generated__/OrgAuthenticationSignOnUrl_saml.graphql'
import CopyLink from '../../../../components/CopyLink'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {PALETTE} from '../../../../styles/paletteV3'
import makeAppURL from '../../../../utils/makeAppURL'

const Section = styled('div')({
  padding: '0px 28px 12px 28px'
})

const InputSection = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  padding: '0 16px'
})

const CopyButton = styled(SecondaryButton)({
  color: PALETTE.SLATE_600,
  padding: '0',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '50px',
  width: '40px',
  marginLeft: '8px'
})

const StyledContentCopyIcon = styled(ContentCopy)({
  color: PALETTE.SLATE_600,
  display: 'block',
  width: '18px',
  height: '18px'
})

interface Props {
  samlRef: OrgAuthenticationSignOnUrl_saml$key | null
}

const OrgAuthenticationSignOutUrl = (props: Props) => {
  const {samlRef} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationSignOnUrl_saml on SAML {
        id
      }
    `,
    samlRef
  )
  const domain = saml?.id ?? 'XXXX-XXXX'
  const url = makeAppURL(window.location.origin, `/saml/${domain}`)
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )

  return (
    <>
      <Section>
        <div className='flex text-base font-semibold leading-6 text-slate-700'>
          Single Sign-On URL
        </div>
        <div className={'flex items-center text-sm text-slate-700'}>
          Copy and paste this into your identity provider’s SAML configuration
        </div>
      </Section>
      <InputSection>
        <BasicInput
          readOnly
          name='singleSignOnUrl'
          value={url}
          error={undefined}
          onFocus={(e) => e.target.select()}
          className='select-all'
        />
        <CopyButton onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={originRef}>
          <CopyLink title={undefined} tooltip={undefined} url={url}>
            <StyledContentCopyIcon />
          </CopyLink>
        </CopyButton>
        {tooltipPortal('Copy')}
      </InputSection>
    </>
  )
}

export default OrgAuthenticationSignOutUrl
