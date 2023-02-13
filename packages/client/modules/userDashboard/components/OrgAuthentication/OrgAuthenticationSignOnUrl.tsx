import styled from '@emotion/styled'
import {ContentCopy} from '@mui/icons-material'
import React from 'react'
import makeMaxWidthMediaQuery from '~/utils/makeMaxWidthMediaQuery'
import CopyLink from '../../../../components/CopyLink'
import DialogTitle from '../../../../components/DialogTitle'
import BasicInput from '../../../../components/InputField/BasicInput'
import RowActions from '../../../../components/Row/RowActions'
import SecondaryButton from '../../../../components/SecondaryButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {PALETTE} from '../../../../styles/paletteV3'

const mobileBreakpoint = makeMaxWidthMediaQuery(420)

const largeMobileBreakpoint = makeMaxWidthMediaQuery(540)

const Section = styled('div')({
  margin: '0 auto',
  maxWidth: '608px',
  padding: '0px 16px 12px 16px',
  [mobileBreakpoint]: {
    padding: '0 28px 12px 28px'
  }
})

const InputSection = styled('div')({
  display: 'flex',
  padding: 0,
  maxWidth: '560px',
  marginLeft: '16px',
  [mobileBreakpoint]: {
    marginLeft: '16px'
  }
})

const SubTitle = styled(DialogTitle)<{disabled: boolean}>(({disabled}) => ({
  color: disabled ? PALETTE.SLATE_600 : PALETTE.SLATE_700,
  fontSize: '16px',
  padding: 0
}))

const Label = styled('div')<{disabled: boolean}>(({disabled}) => ({
  color: disabled ? PALETTE.SLATE_600 : PALETTE.SLATE_700,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center'
}))

const CopyButton = styled(SecondaryButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '16px',
  marginRight: '8px',
  color: PALETTE.SLATE_600,
  padding: '0',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '50px',
  width: '40px',
  height: '40px',
  [mobileBreakpoint]: {
    marginLeft: '0px'
  },
  [largeMobileBreakpoint]: {
    marginLeft: '8px',
    marginRight: '16px'
  }
})

const StyledContentCopyIcon = styled(ContentCopy)({
  color: PALETTE.SLATE_600,
  display: 'block',
  width: '18px',
  height: '18px',
  ':hover': {
    cursor: 'pointer',
    color: PALETTE.SLATE_700
  }
})

const Container = styled('div')({
  marginBottom: '24px'
})

interface Props {
  disabled: boolean
  singleSignOnUrl?: string | null
}

const OrgAuthenticationSignOutUrl = (props: Props) => {
  const {disabled} = props
  const singleSignOnUrl = props.singleSignOnUrl ?? ''

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )

  return (
    <Container>
      <Section>
        <SubTitle disabled={disabled}>Single Sign-On URL</SubTitle>
        <Label disabled={disabled}>
          Copy and paste this into your identity providers SAML configuration
        </Label>
      </Section>
      <InputSection>
        <BasicInput
          readOnly
          disabled={disabled}
          name='singleSignOnUrl'
          placeholder='https://action.parabol.co/sso/saml/xxxxxxx-xxxxx-xxxxx-xxxxxxx'
          value={singleSignOnUrl}
          error={undefined}
          onChange={(e) => e.preventDefault()}
        />
        <RowActions>
          <CopyButton onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={originRef}>
            <CopyLink title={undefined} tooltip={undefined} url={singleSignOnUrl}>
              <StyledContentCopyIcon />
            </CopyLink>
          </CopyButton>
          {tooltipPortal('Copy')}
        </RowActions>
      </InputSection>
    </Container>
  )
}

export default OrgAuthenticationSignOutUrl
