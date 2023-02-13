import React from 'react'
import Panel from '../../../../components/Panel/Panel'
import OrgAuthenticationHeader from './OrgAuthenticationHeader'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
import OrgAuthenticationSignOnUrl from './OrgAuthenticationSignOnUrl'
import OrgAuthenticationSSOEnabled from './OrgAuthenticationSSOEnabled'

const OrgAuthentication = () => {
  const disabled = true
  return (
    <Panel>
      <OrgAuthenticationHeader />
      <OrgAuthenticationSSOEnabled disabled={disabled} />
      <OrgAuthenticationSignOnUrl disabled={disabled} />
      <OrgAuthenticationMetadata disabled={disabled} />
    </Panel>
  )
}

export default OrgAuthentication
