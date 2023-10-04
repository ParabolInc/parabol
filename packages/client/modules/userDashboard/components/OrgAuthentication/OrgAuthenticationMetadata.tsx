import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import orgAuthenticationMetadataQuery, {
  OrgAuthenticationMetadataQuery
} from '../../../../__generated__/OrgAuthenticationMetadataQuery.graphql'
import {OrgAuthenticationMetadata_saml$key} from '../../../../__generated__/OrgAuthenticationMetadata_saml.graphql'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import getTokenFromSSO from '../../../../utils/getTokenFromSSO'

graphql`
  query OrgAuthenticationMetadataQuery($metadataURL: String!, $domain: String!) {
    viewer {
      parseSAMLMetadata(metadataURL: $metadataURL, domain: $domain) {
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

interface Props {
  samlRef: OrgAuthenticationMetadata_saml$key | null
}

const OrgAuthenticationMetadata = (props: Props) => {
  const {samlRef} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationMetadata_saml on SAML {
        id
        metadataURL
      }
    `,
    samlRef
  )
  const atmosphere = useAtmosphere()
  const [metadataURL, setMetadataURL] = useState(saml?.metadataURL ?? '')
  const isMetadataURLSaved = saml ? saml.metadataURL === metadataURL : false
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const submitMetadataURL = async () => {
    if (submitting) return
    submitMutation()
    const domain = saml?.id
    if (!domain) {
      onError(new Error('Domain not provided. Please contact customer support'))
    }
    // Get the Sign-on URL, which includes metadataURL in the RelayState
    const res = await atmosphere.fetchQuery<OrgAuthenticationMetadataQuery>(
      orgAuthenticationMetadataQuery,
      {metadataURL, domain}
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
      store.get(saml!.id)?.setValue(metadataURL, 'metadataURL')
    })
    atmosphere.eventEmitter.emit('addSnackbar', {
      message: 'SSO Configured Successfully',
      autoDismiss: 5,
      key: 'submitMetadata'
    })
  }
  return (
    <>
      <div className='px-6 pb-3'>
        <div className='flex text-base font-semibold leading-6 text-slate-700'>Metadata URL</div>
        <div className={'flex items-center text-sm text-slate-700'}>
          Paste the metadata URL from your identity provider
        </div>
      </div>
      <div className='px-6 pb-3'>
        <BasicInput
          name='metadataURL'
          placeholder={`https://idp.example.com/app/sso/saml/metadata`}
          value={metadataURL}
          onChange={(e) => setMetadataURL(e.target.value)}
          error={undefined}
        />
      </div>
      <div className={'px-6 text-tomato-500 empty:hidden'}>{error?.message}</div>
      <div className='flex justify-end px-6 pb-8'>
        <SecondaryButton
          size='medium'
          onClick={submitMetadataURL}
          disabled={submitting || isMetadataURLSaved}
        >
          Update Metadata
        </SecondaryButton>
      </div>
    </>
  )
}

export default OrgAuthenticationMetadata
