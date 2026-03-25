import {Add, Check} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OrgAuthenticationSSOFrame_saml$key} from '../../../../__generated__/OrgAuthenticationSSOFrame_saml.graphql'
import {ExternalLinks} from '../../../../types/constEnums'

interface Props {
  samlRef: OrgAuthenticationSSOFrame_saml$key | null
}

const OrgAuthenticationSSOFrame = (props: Props) => {
  const {samlRef} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationSSOFrame_saml on SAML {
        id
        domains
      }
    `,
    samlRef
  )
  const disabled = !saml
  const domains: readonly string[] = saml?.domains ?? []

  return (
    <div className='px-6 pb-8'>
      <div className='flex flex-row rounded border border-slate-500 px-2 py-1'>
        <div className='px-2'>
          {disabled ? (
            <Add className='h-6 w-6 text-sky-500' />
          ) : (
            <Check className='h-6 w-6 text-green-500' />
          )}
        </div>
        <div className='flex flex-col'>
          <span className='font-semibold text-base text-slate-700'>
            {disabled ? 'Enable SSO' : 'SSO Enabled'}
          </span>
          <span className='text-slate-700 text-sm'>
            <a
              className='font-semibold text-sky-500 text-sm focus:text-sky-500 active:text-sky-500'
              href={`${ExternalLinks.CONTACT}?subject=${
                disabled ? 'Enable SSO' : 'Update Email Domains'
              }`}
              title={'Contact customer success to enable SSO'}
            >
              Contact customer success
            </a>{' '}
            {disabled ? 'to enable SSO' : 'to update email domains'}
          </span>
          <div className='flex flex-wrap gap-2 pt-2 pb-1 empty:hidden'>
            {domains.map((domain) => {
              return (
                <div
                  key={domain}
                  className='w-max select-none rounded-full bg-slate-200 px-3 py-1 font-semibold text-slate-800 text-xs'
                >
                  {domain}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrgAuthenticationSSOFrame
