import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import orgAuthenticationMetadataQuery, {
  OrgAuthenticationMetadataQuery
} from '../../../../__generated__/OrgAuthenticationMetadataQuery.graphql'
import {OrgAuthenticationMetadata_saml$key} from '../../../../__generated__/OrgAuthenticationMetadata_saml.graphql'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import SecondaryButton from '../../../../components/SecondaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {PALETTE} from '../../../../styles/paletteV3'
import getTokenFromSSO from '../../../../utils/getTokenFromSSO'

graphql`
  query OrgAuthenticationMetadataQuery($metadata: String!, $domain: String!) {
    viewer {
      parseSAMLMetadata(metadata: $metadata, domain: $domain) {
        ... on ErrorPayload {
          error {
            message
          }
        }
        ... on ParseSAMLMetadataSuccess {
          url
        }
      }
    }
  }
`

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
        id
        metadata
      }
    `,
    samlRef
  )
  const atmosphere = useAtmosphere()
  const [metadata, setMetadata] = useState(saml?.metadata ?? '')
  const isMetadataSaved = saml ? saml.metadata === metadata : false
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const submitMetadata = async () => {
    if (submitting) return
    submitMutation()
    const domain = saml?.id
    if (!domain) {
      onError(new Error('Domain not provided. Please contact customer support'))
    }
    // Get the Sign-on URL, which includes metadata in the RelayState
    const res = await atmosphere.fetchQuery<OrgAuthenticationMetadataQuery>(
      orgAuthenticationMetadataQuery,
      {metadata, domain}
    )
    if (!res) {
      onError(new Error('Could not reach server. Please try again'))
      return
    }
    const {viewer} = res
    const {parseSAMLMetadata} = viewer
    const {error} = parseSAMLMetadata
    if (error) {
      onError(new Error(error.message))
      return
    }
    const url = parseSAMLMetadata.url!

    // Attempt logging in to test for errors
    const response = await getTokenFromSSO(url)
    if ('error' in response) {
      onError(new Error(response.error || 'Error logging in'))
      return
    }
    onCompleted()
    commitLocalUpdate(atmosphere, (store) => {
      store.get(saml!.id)?.setValue(metadata, 'metadata')
    })
    atmosphere.eventEmitter.emit('addSnackbar', {
      message: 'SSO Configured Successfully',
      autoDismiss: 5,
      key: 'submitMetadata'
    })
  }
  const checkForURL = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData?.getData('Text')
    if (!pastedText) return
    try {
      const url = new URL(pastedText)
      const fetchedMetadata = await fetch(url)
      const fetchedMetadataStr = await fetchedMetadata.text()
      if (fetchedMetadataStr.startsWith('<?xml')) {
        setMetadata(fetchedMetadataStr)
      }
    } catch {
      // not a URL
    }
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
          onPaste={checkForURL}
        />
      </InputSection>
      <div className={'px-4 text-tomato-500 empty:hidden'}>{error?.message}</div>
      <ButtonSection>
        <SecondaryButton
          size='medium'
          onClick={submitMetadata}
          disabled={submitting || isMetadataSaved}
        >
          Update Metadata
        </SecondaryButton>
      </ButtonSection>
    </Container>
  )
}

export default OrgAuthenticationMetadata
