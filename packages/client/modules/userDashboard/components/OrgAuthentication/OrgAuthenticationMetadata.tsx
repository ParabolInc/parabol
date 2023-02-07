import styled from '@emotion/styled'
import React, {useState} from 'react'
import DialogTitle from '../../../../components/DialogTitle'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import SecondaryButton from '../../../../components/SecondaryButton'
import {PALETTE} from '../../../../styles/paletteV3'

const Section = styled('div')({
  margin: '0 auto',
  maxWidth: '608px',
  padding: '0px 16px 12px 16px'
})

const InputSection = styled(Section)({
  display: 'flex',
  padding: 0,
  maxWidth: '500px',
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

const Container = styled('div')({
  marginBottom: '24px'
})

const ButtonSection = styled('div')({
  display: 'flex',
  justifyContent: 'right',
  marginTop: '8px',
  width: '515px'
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
        <SubTitle>Metadata</SubTitle>
        <StatBlockLabel>Paste metadata from your identify provider</StatBlockLabel>
      </Section>
      <InputSection>
        <BasicTextArea
          disabled={disabled}
          name='metadata'
          placeholder='Paste your metadata here'
          value={metadata}
          error={undefined}
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
