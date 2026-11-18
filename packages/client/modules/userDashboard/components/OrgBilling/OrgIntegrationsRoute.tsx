import OrgIntegrations from '../OrgIntegrations/OrgIntegrations'
import useOrganizationOutlet from './useOrganizationOutlet'

const OrgIntegrationsRoute = () => {
  const {organization} = useOrganizationOutlet()
  return <OrgIntegrations organizationRef={organization} />
}

export default OrgIntegrationsRoute
