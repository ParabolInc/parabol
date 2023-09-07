import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {OrgAuthenticationMetadata_saml$key} from '../../../../__generated__/OrgAuthenticationMetadata_saml.graphql'
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
  samlRef: OrgAuthenticationMetadata_saml$key | null
}

const OrgAuthenticationMetadata = (props: Props) => {
  const {samlRef} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationMetadata_saml on SAML {
        metadata
      }
    `,
    samlRef
  )
  const [metadata, setMetadata] = useState(saml?.metadata ?? '')
  const submitMetadata = () => {
    /*  */
  }
  return (
    <Container>
      <Section>
        <div className='flex text-base font-semibold leading-6 text-slate-700'>Metadata</div>
        <div className={'flex items-center text-sm text-slate-700'}>
          Paste metadata from your identity provider
        </div>
      </Section>
      <InputSection>
        <BasicTextArea
          name='metadata'
          placeholder={`<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID=...`}
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
        />
      </InputSection>
      <ButtonSection>
        <SecondaryButton size='medium' onClick={submitMetadata}>
          Update Metadata
        </SecondaryButton>
      </ButtonSection>
    </Container>
  )
}

export default OrgAuthenticationMetadata
