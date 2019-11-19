import {matchPath} from 'react-router-dom'

const onExOrgRoute = (pathname: string, orgId: string) => {
  const res = matchPath<{orgId: string}>(pathname, {
    path: '/me/organizations/:orgId'
  })
  return res && res.params.orgId === orgId
}

export default onExOrgRoute
