import {matchPath} from 'react-router-dom'

const onExOrgRoute = (pathname: string, orgId: string) => {
  const res = matchPath('/me/organizations/:orgId', pathname)
  return res && res.params.orgId === orgId
}

export default onExOrgRoute
