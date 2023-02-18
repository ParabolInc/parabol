import styled from '@emotion/styled'
import React, {useState} from 'react'
import DialogTitle from '../../../../components/DialogTitle'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import SecondaryButton from '../../../../components/SecondaryButton'
import {PALETTE} from '../../../../styles/paletteV3'

const Section = styled('div')({
  padding: '24px 16px 8px 28px'
})

const InputSection = styled('div')({
  display: 'flex',
  padding: '0 16px 8px 16px'
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
  marginBottom: '16px'
})

const ButtonSection = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '0px 16px 0px 16px',
  backgroundColor: PALETTE.WHITE
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
