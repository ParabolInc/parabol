import styled from '@emotion/styled'
import {ContentCopy} from '@mui/icons-material'
import React, {useState} from 'react'
import DialogTitle from '../../../../components/DialogTitle'
import BasicInput from '../../../../components/InputField/BasicInput'
import {PALETTE} from '../../../../styles/paletteV3'

const Section = styled('div')({
  margin: '0 auto',
  maxWidth: '608px',
  padding: '0px 16px 12px 16px'
})

const InputSection = styled(Section)({
  display: 'flex',
  padding: 0,
  maxWidth: '560px',
  marginLeft: '16px'
})

const SubTitle = styled(DialogTitle)({
  color: PALETTE.SLATE_600,
  fontSize: '16px',
  padding: 0
})

const StatBlockLabel = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center'
})

const CopyButton = styled('div')({
  display: 'flex',
  color: PALETTE.SLATE_600,
  marginRight: '8px',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '50px',
  height: '40px',
  width: '40px',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '16px'
})

const StyledContentCopyIcon = styled(ContentCopy)({
  color: PALETTE.SLATE_600,
  width: '18px',
  height: '18px',
  ':hover': {
    cursor: 'pointer'
  }
})

const Container = styled('div')({
  marginBottom: '24px'
})

interface Props {
  disabled: boolean
}

const OrgAuthenticationSignOutUrl = (props: Props) => {
  const [singleSignOnUrl, setSingleSignOnUrl] = useState('')
  const {disabled} = props
  return (
    <Container>
      <Section>
        <SubTitle>Single Sign-On URL</SubTitle>
        <StatBlockLabel>
          Copy and paste this into your identity providers SAML configuration
        </StatBlockLabel>
      </Section>
      <InputSection>
        <BasicInput
          disabled={disabled}
          name='singleSignOnUrl'
          placeholder='https://action.parabol.co/sso/saml/xxxxxxx-xxxxx-xxxxx-xxxxxxx'
          value={singleSignOnUrl}
          error={undefined}
          onChange={(e) => setSingleSignOnUrl(e.target.value)}
        />
        <CopyButton>
          <StyledContentCopyIcon />
        </CopyButton>
      </InputSection>
    </Container>
  )
}

export default OrgAuthenticationSignOutUrl
