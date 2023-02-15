import styled from '@emotion/styled'
import React, {useState} from 'react'
import makeMaxWidthMediaQuery from '~/utils/makeMaxWidthMediaQuery'
import DialogTitle from '../../../../components/DialogTitle'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import SecondaryButton from '../../../../components/SecondaryButton'
import {PALETTE} from '../../../../styles/paletteV3'

const mobileBreakpoint = makeMaxWidthMediaQuery(420)
const largeMobileBreakpoint = makeMaxWidthMediaQuery(540)

const Section = styled('div')({
  margin: '0 auto',
  maxWidth: '608px',
  padding: '0px 16px 12px 16px',
  [mobileBreakpoint]: {
    padding: '0px 28px 12px 28px'
  }
})

const InputSection = styled('div')({
  display: 'flex',
  padding: 0,
  width: '500px',
  margin: '0 16px 8px 16px',
  [mobileBreakpoint]: {
    maxWidth: '350px'
  },
  [largeMobileBreakpoint]: {
    width: 'auto'
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

const Container = styled('div')({
  marginBottom: '24px'
})

const ButtonSection = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '8px',
  width: '500px',
  backgroundColor: PALETTE.WHITE,
  margin: '0 16px 28px 16px',
  [largeMobileBreakpoint]: {
    width: 'auto'
  }
})

interface Props {
  disabled: boolean
}

const OrgAuthenticationMetadata = (props: Props) => {
  const [metadata, setMetadata] = useState('')
  const {disabled} = props

  return (
    <Container>
      <Section>
        <SubTitle disabled={disabled}>Metadata</SubTitle>
        <Label disabled={disabled}>Paste metadata from your identity provider</Label>
      </Section>
      <InputSection>
        <BasicTextArea
          disabled={disabled}
          name='metadata'
          placeholder='Paste your metadata here'
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
        />
      </InputSection>
      <ButtonSection>
        <SecondaryButton disabled={disabled} size='medium'>
          Update Metadata
        </SecondaryButton>
      </ButtonSection>
    </Container>
  )
}

export default OrgAuthenticationMetadata
