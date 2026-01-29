import {Check, Close, RestartAlt} from '@mui/icons-material'
import * as Popover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment, useMutation} from 'react-relay'
import type {
  OrgAuthenticationSCIM_saml$key,
  SCIMAuthenticationTypeEnum
} from '../../../../__generated__/OrgAuthenticationSCIM_saml.graphql'
import {OrgAuthenticationSCIMUpdateSCIMMutation} from '../../../../__generated__/OrgAuthenticationSCIMUpdateSCIMMutation.graphql'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import SecondaryButton from '../../../../components/SecondaryButton'
import useMutationProps from '../../../../hooks/useMutationProps'
import {ExternalLinks} from '../../../../types/constEnums'
import {Select} from '../../../../ui/Select/Select'
import {SelectContent} from '../../../../ui/Select/SelectContent'
import {SelectGroup} from '../../../../ui/Select/SelectGroup'
import {SelectItem} from '../../../../ui/Select/SelectItem'
import {SelectTrigger} from '../../../../ui/Select/SelectTrigger'
import {SelectValue} from '../../../../ui/Select/SelectValue'
import makeAppURL from '../../../../utils/makeAppURL'
import {CopyServiceProviderURL} from './CopyServiceProviderURL'

interface Props {
  samlRef: OrgAuthenticationSCIM_saml$key | null
}

const CensoredSecret = (props: {secret: string; label: string; onReset: () => void}) => {
  const {label, secret, onReset} = props
  const [confirming, setConfirming] = useState(false)

  return (
    <>
      <div className='font-bold leading-7'>{label}</div>
      <div className='contents'>
        <div className='break-all'>{secret}</div>
        <Popover.Root open={confirming} onOpenChange={setConfirming}>
          <Popover.Trigger asChild>
            <PlainButton onClick={() => setConfirming(true)}>
              <RestartAlt className='h-5 w-5 text-sky-500 hover:text-sky-700' />
            </PlainButton>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className='rounded-md border border-slate-200 bg-white p-2 shadow-md'>
              <div className='flex flex-col items-center gap-2'>
                Reset {label}?
                <div className='flex gap-4'>
                  <PlainButton
                    onClick={() => {
                      onReset()
                      setConfirming(false)
                    }}
                  >
                    <Check alt='yes' className='h-5 w-5 text-sky-500 hover:text-sky-700' />
                  </PlainButton>
                  <PlainButton
                    onClick={() => {
                      setConfirming(false)
                    }}
                  >
                    <Close alt='no' className='h-5 w-5 text-sky-500 hover:text-sky-700' />
                  </PlainButton>
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </>
  )
}

const OrgAuthenticationSCIM = (props: Props) => {
  const {samlRef} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationSCIM_saml on SAML {
        id
        orgId
        scimAuthenticationType
        scimCensoredBearerToken
        scimOAuthClientId
        scimCensoredOAuthClientSecret
      }
    `,
    samlRef
  )
  const {submitMutation, submitting, onCompleted, onError} = useMutationProps()
  const [commitUpdateSCIM] = useMutation<OrgAuthenticationSCIMUpdateSCIMMutation>(graphql`
    mutation OrgAuthenticationSCIMUpdateSCIMMutation(
      $orgId: ID!
      $authenticationType: SCIMAuthenticationTypeEnum
    ) {
      updateSCIM(orgId: $orgId, authenticationType: $authenticationType) {
        saml {
          ...OrgAuthenticationSCIM_saml
        }
        scimBearerToken
        scimOAuthClientSecret
      }
    }
  `)

  const [bearerToken, setBearerToken] = useState<string | null>(null)
  const [oauthClientSecret, setOAuthClientSecret] = useState<string | null>(null)
  const [nextScimAuthenticationType, setNextScimAuthenticationType] =
    useState<SCIMAuthenticationTypeEnum | null>(saml?.scimAuthenticationType ?? null)

  if (!saml || !saml.orgId) {
    return (
      <div className='px-6 pb-3 text-sm text-tomato-500'>
        Your SAML configuration is corrupted, please{' '}
        <a
          className='font-bold text-tomato-500 hover:text-tomato-500 active:text-tomato-500'
          href={`${ExternalLinks.CONTACT}?subject=${'SAML config corrupted'}`}
          title={'Contact customer success to enable SSO'}
        >
          contact customer success
        </a>
        .
      </div>
    )
  }
  const {orgId, scimAuthenticationType} = saml

  const updateSCIM = (authenticationType: SCIMAuthenticationTypeEnum | null) => {
    submitMutation()
    commitUpdateSCIM({
      variables: {
        orgId,
        authenticationType
      },
      onCompleted: (data) => {
        onCompleted()
        const {scimBearerToken, scimOAuthClientSecret} = data.updateSCIM
        setBearerToken(scimBearerToken ?? null)
        setOAuthClientSecret(scimOAuthClientSecret ?? null)
      },
      onError
    })
  }

  const resetSecret = () => {
    if (scimAuthenticationType) {
      updateSCIM(scimAuthenticationType)
    }
  }

  const onChangeAuthenticationType = (value: SCIMAuthenticationTypeEnum | 'disabled') => {
    setNextScimAuthenticationType(value === 'disabled' ? null : value)
  }

  const RenderSettings = () => {
    if (scimAuthenticationType === null) {
      return (
        <div className='text- py-6 text-slate-700'>
          SCIM provisioning is currently disabled. Please select an authentication method to
          proceed.
        </div>
      )
    }
    const {
      id: domain,
      scimCensoredBearerToken,
      scimOAuthClientId,
      scimCensoredOAuthClientSecret
    } = saml
    const startURL = window.location.origin
    const scimURL = makeAppURL(startURL, `/scim/${domain}`)
    const tokenURL = makeAppURL(startURL, `/oauth/token`)
    return (
      <div>
        <div className='flex pt-6 font-semibold text-base text-slate-700 leading-6'>
          Set up your Identity Provider
        </div>
        <div className={'flex items-center text-slate-700 text-sm'}>
          Paste the following URL into your Identity Provider’s SCIM configuration
        </div>
        <div className='column-ga grid grid-cols-[max-content_fit-content(400px)_24px] items-center gap-x-2 pt-4 pb-8'>
          <CopyServiceProviderURL url={scimURL} label={'SCIM URL'} />
          {scimAuthenticationType === 'bearerToken' && (
            <>
              {bearerToken !== null ? (
                <CopyServiceProviderURL url={bearerToken} label={'Bearer Token'} />
              ) : (
                <CensoredSecret
                  secret={scimCensoredBearerToken!}
                  label={'Bearer Token'}
                  onReset={resetSecret}
                />
              )}
            </>
          )}
          {scimAuthenticationType === 'oauthClientCredentials' && (
            <>
              <CopyServiceProviderURL url={tokenURL} label={'Token endpoint'} />
              <CopyServiceProviderURL url={scimOAuthClientId!} label={'Client ID'} />
              {oauthClientSecret !== null ? (
                <CopyServiceProviderURL url={oauthClientSecret} label={'Client secret'} />
              ) : (
                <CensoredSecret
                  secret={scimCensoredOAuthClientSecret!}
                  label={'Client secret'}
                  onReset={resetSecret}
                />
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='px-6 pb-3'>
        <div className='flex font-semibold text-base text-slate-700 leading-6'>
          Authentication Method
        </div>
        <div className='flex gap-8'>
          <Select
            onValueChange={onChangeAuthenticationType}
            value={nextScimAuthenticationType ?? 'disabled'}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position='item-aligned'>
              <SelectGroup>
                <SelectItem value={'disabled'}>Disabled</SelectItem>
                <SelectItem value={'bearerToken'}>Bearer Token</SelectItem>
                <SelectItem value={'oauthClientCredentials'}>
                  OAuth 2.0 Client Credentials
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <SecondaryButton
            disabled={nextScimAuthenticationType === scimAuthenticationType}
            onClick={() => updateSCIM(nextScimAuthenticationType)}
          >
            {!scimAuthenticationType
              ? 'Enable SCIM'
              : !nextScimAuthenticationType
                ? 'Disable SCIM'
                : 'Change Authentication Method'}
          </SecondaryButton>
        </div>
        <RenderSettings />
      </div>
    </>
  )
}

export default OrgAuthenticationSCIM
