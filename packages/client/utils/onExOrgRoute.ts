import {matchPath} from 'react-router-dom'

const onExOrgRoute = (pathname: string, orgId: string) => {
  const res = matchPath({path: '/me/organizations/:orgId', end: false}, pathname)
  return res && res.params.orgId === orgId
}

export default onExOrgRoute
