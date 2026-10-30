import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {Link} from 'react-router'
import {UploadFile as UploadFileIcon} from '~/ui/icons'
import type {OrgAuthenticationMetadata_saml$key} from '../../../../__generated__/OrgAuthenticationMetadata_saml.graphql'
import BasicInput from '../../../../components/InputField/BasicInput'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {snackOnError} from '../../../../mutations/handlers/snackOnError'
import useRequestSAMLMetadataChangeMutation from '../../../../mutations/useRequestSAMLMetadataChangeMutation'
import {useUploadIdPMetadata} from '../../../../mutations/useUploadIdPMetadataMutation'
import {Button} from '../../../../ui/Button/Button'
import getOAuthPopupFeatures from '../../../../utils/getOAuthPopupFeatures'
import loginSSO from '../../../../utils/loginSSO'
import OrgAuthenticationDisconnectIdP from './OrgAuthenticationDisconnectIdP'

interface Props {
  samlRef: OrgAuthenticationMetadata_saml$key
  isOrgAdmin: boolean
}

const OrgAuthenticationMetadata = (props: Props) => {
  const {samlRef, isOrgAdmin} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationMetadata_saml on SAML {
        id
        domains
        metadataURL
        orgId
        ...OrgAuthenticationDisconnectIdP_saml
      }
    `,
    samlRef
  )
  const atmosphere = useAtmosphere()
  const {orgId, domains} = saml
  const [metadataURL, setMetadataURL] = useState(saml.metadataURL ?? '')
  const isMetadataURLSaved = saml.metadataURL === metadataURL
  const [requestSAMLMetadataChange, isRequestingChange] = useRequestSAMLMetadataChangeMutation()
  const [isTestingSignIn, setIsTestingSignIn] = useState(false)
  const [error, setError] = useState('')
  const submitting = isRequestingChange || isTestingSignIn

  const testSignIn = async (signOnURL: string) => {
    setIsTestingSignIn(true)
    const response = await loginSSO(signOnURL)
    setIsTestingSignIn(false)
    if ('error' in response) {
      setError(response.error || 'Error logging in')
      return
    }
    commitLocalUpdate(atmosphere, (store) => {
      store.get(saml.id)?.setValue(metadataURL, 'metadataURL')
    })
    atmosphere.eventEmitter.emit('addSnackbar', {
      message: 'SSO Configured Successfully',
      autoDismiss: 5,
      key: 'submitMetadata'
    })
  }

  const submitMetadataURL = () => {
    if (submitting || !metadataURL) return
    setError('')

    // Open popup before the first async call to prevent popup blockers
    const optimisticPopup = window.open(
      '',
      'SSO',
      getOAuthPopupFeatures({width: 385, height: 576, top: 64})
    )
    const failRequest = (message: string) => {
      setError(message)
      optimisticPopup?.close()
    }
    requestSAMLMetadataChange({
      variables: {samlId: saml.id, metadataURL},
      onCompleted: (res, errors) => {
        const firstError = errors?.[0]
        if (firstError) {
          failRequest(firstError.message)
          return
        }
        testSignIn(res.requestSAMLMetadataChange.signOnURL)
      },
      onError: (err) => failRequest(err.message)
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
    if (!file) return
    commit({
      variables: {samlId: saml.id},
      uploadables: {file},
      onCompleted: (res) => {
        setMetadataURL(res.uploadIdPMetadata.url)
      },
      onError: snackOnError(atmosphere, 'errorUploadIdPtMetadata')
    })
  }

  return (
    <>
      {!isOrgAdmin && (
        <div className='px-6 pb-3 text-fg-primary text-sm'>
          {orgId ? (
            <Link
              className='font-semibold text-accent hover:text-sky-600'
              to={`/me/organizations/${orgId}/members`}
            >
              Contact an Org Admin
            </Link>
          ) : (
            'Contact an Admin'
          )}
          {' to update the metadata'}
        </div>
      )}
      <div className={!isOrgAdmin ? 'pointer-events-none select-none opacity-50' : ''}>
        <div className='px-6 pt-2 pb-4'>
          <div className='font-semibold text-base text-fg-primary leading-6'>Metadata URL</div>
          <div className='mb-3 text-fg-primary text-sm'>
            Paste the metadata URL from this identity provider. Saving opens a test sign-in: sign in
            as an Org Admin with an {domains.map((emailDomain) => `@${emailDomain}`).join(' or ')}{' '}
            address.
          </div>
          <BasicInput
            name='metadataURL'
            placeholder={`https://idp.example.com/app/sso/saml/metadata`}
            value={metadataURL}
            onChange={(e) => setMetadataURL(e.target.value)}
            disabled={!isOrgAdmin}
            error={undefined}
          />
          <Button
            className='mt-3 px-0'
            variant='ghost'
            size='sm'
            onClick={onUploadClick}
            disabled={!isOrgAdmin}
          >
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
        <div className={'px-6 text-fg-error empty:hidden'}>{error}</div>
        <div className='flex items-center justify-between gap-4 px-6 pb-8'>
          {saml.metadataURL ? (
            <OrgAuthenticationDisconnectIdP samlRef={saml} disabled={!isOrgAdmin} />
          ) : (
            <div />
          )}
          <Button
            variant='outline'
            size='md'
            onClick={submitMetadataURL}
            disabled={!isOrgAdmin || submitting || isMetadataURLSaved || !metadataURL}
          >
            {saml.metadataURL ? 'Update Metadata' : 'Save & test sign-in'}
          </Button>
        </div>
      </div>
    </>
  )
}

export default OrgAuthenticationMetadata
