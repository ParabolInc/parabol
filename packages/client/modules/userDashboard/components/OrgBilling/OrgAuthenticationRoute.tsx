import OrgAuthenticationRoot from '../../containers/OrgAuthentication/OrgAuthenticationRoot'
import useOrganizationOutlet from './useOrganizationOutlet'

const OrgAuthenticationRoute = () => {
  const {orgId} = useOrganizationOutlet()
  return <OrgAuthenticationRoot orgId={orgId} />
}

export default OrgAuthenticationRoute
