import React, {Suspense} from 'react'
import OrgAuthentication from '../../components/OrgAuthentication/OrgAuthentication'

const OrgAuthenticationRoot = () => {
  return (
    <Suspense fallback={''}>
      <OrgAuthentication />
    </Suspense>
  )
}

export default OrgAuthenticationRoot
