import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Add, Check} from '~/ui/icons'
import type {OrgAuthenticationSSOFrame_samls$key} from '../../../../__generated__/OrgAuthenticationSSOFrame_samls.graphql'
import {ExternalLinks} from '../../../../types/constEnums'

interface Props {
  samlsRef: OrgAuthenticationSSOFrame_samls$key
}

const OrgAuthenticationSSOFrame = (props: Props) => {
  const {samlsRef} = props
  const samls = useFragment(
    graphql`
      fragment OrgAuthenticationSSOFrame_samls on SAML @relay(plural: true) {
        metadataURL
      }
    `,
    samlsRef
  )
  const total = samls.length
  const activeCount = samls.filter(({metadataURL}) => metadataURL).length
  const disabled = total === 0
  const title = disabled
    ? 'Enable SSO'
    : total === 1
      ? 'SSO Enabled'
      : `SSO Enabled · ${activeCount} of ${total} identity providers active`

  return (
    <div className='px-6 pb-6'>
      <div className='flex flex-row rounded border border-hairline-field px-2 py-1'>
        <div className='px-2'>
          {disabled ? (
            <Add className='h-6 w-6 text-accent' />
          ) : (
            <Check className='h-6 w-6 text-jade-500' />
          )}
        </div>
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='font-semibold text-base text-fg-primary'>{title}</span>
          <span className='text-fg-primary text-sm'>
            {!disabled &&
              'People sign in with the identity provider that owns their email domain. '}
            <a
              className='font-semibold text-accent text-sm focus:text-accent active:text-accent'
              href={`${ExternalLinks.CONTACT}?subject=${disabled ? 'Enable SSO' : 'Update Identity Providers'}`}
              title={'Contact customer success'}
            >
              Contact customer success
            </a>{' '}
            {disabled ? 'to enable SSO' : 'to add an identity provider or change email domains.'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default OrgAuthenticationSSOFrame
