import UploadFileIcon from '@mui/icons-material/UploadFile'
import graphql from 'babel-plugin-relay/macro'
import * as React from 'react'
import {useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import orgAuthenticationMetadataQuery, {
  OrgAuthenticationMetadataQuery
} from '../../../../__generated__/OrgAuthenticationMetadataQuery.graphql'
import {OrgAuthenticationMetadata_saml$key} from '../../../../__generated__/OrgAuthenticationMetadata_saml.graphql'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {useUploadIdPMetadata} from '../../../../mutations/useUploadIdPMetadataMutation'
import {Button} from '../../../../ui/Button/Button'
import getOAuthPopupFeatures from '../../../../utils/getOAuthPopupFeatures'
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
        orgId
      }
    `,
    samlRef
  )
  const atmosphere = useAtmosphere()
  const [metadataURL, setMetadataURL] = useState(saml?.metadataURL ?? '')
  const isMetadataURLSaved = saml ? saml.metadataURL === metadataURL : false
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const submitMetadataURL = async () => {
    if (submitting || !metadataURL) return
    submitMutation()
    const domain = saml?.id
    if (!domain) {
      onError(new Error('Domain not provided. Please contact customer support'))
    }

    // Open popup before the first async call to prevent popup blockers
    const optimisticPopup = window.open(
      '',
      'SSO',
      getOAuthPopupFeatures({width: 385, height: 576, top: 64})
    )

    // Get the Sign-on URL, which includes metadataURL in the RelayState
    const res = await atmosphere.fetchQuery<OrgAuthenticationMetadataQuery>(
      orgAuthenticationMetadataQuery,
      {metadataURL, domain}
    )
    if (!res || res instanceof Error) {
      onError(new Error('Could not reach server. Please try again'))
      optimisticPopup?.close()
      return
    }
    const {viewer} = res
    const {parseSAMLMetadata} = viewer
    const {error} = parseSAMLMetadata
    if (error) {
      onError(new Error(error.message))
      optimisticPopup?.close()
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

  const uploadInputRef = useRef<HTMLInputElement>(null)
  const onUploadClick = () => {
    uploadInputRef.current?.click()
  }
  const [commit] = useUploadIdPMetadata()
  const uploadXML = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.currentTarget
    const file = files?.[0]
    if (!file || !saml?.orgId) return
    commit({
      variables: {orgId: saml.orgId},
      uploadables: {file: file},
      onCompleted: (res) => {
        const {uploadIdPMetadata} = res
        const {error, url} = uploadIdPMetadata
        const message = error?.message
        if (message) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'errorUploadIdPtMetadata',
            message,
            autoDismiss: 5
          })
          return
        }
        setMetadataURL(url!)
      }
    })
  }

  return (
    <>
      <div className='px-6 pb-3'>
        <div className='flex text-base leading-6 font-semibold text-slate-700'>Metadata URL</div>
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
        <Button className='px-0' variant='ghost' shape='pill' size='sm' onClick={onUploadClick}>
          <UploadFileIcon className={'text-xl'} />
          Click to upload XML File
        </Button>
        <input
          className='hidden'
          accept='.xml'
          onChange={uploadXML}
          type='file'
          ref={uploadInputRef}
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
