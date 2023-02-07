import React, {useState} from 'react'
import Panel from '../../../../components/Panel/Panel'
import OrgAuthenticationHeader from './OrgAuthenticationHeader'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
import OrgAuthenticationSignOnUrl from './OrgAuthenticationSignOnUrl'
import OrgAuthenticationSSOEnabled from './OrgAuthenticationSSOEnabled'

const OrgAuthentication = () => {
  const [disabled] = useState(true)
  return (
    <Panel>
      <OrgAuthenticationHeader />
      <OrgAuthenticationSSOEnabled />
      <OrgAuthenticationSignOnUrl disabled={disabled} />
      <OrgAuthenticationMetadata disabled={disabled} />
    </Panel>
  )
}

export default OrgAuthentication
