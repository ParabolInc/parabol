import OrgTeams from '../OrgTeams/OrgTeams'
import useOrganizationOutlet from './useOrganizationOutlet'

const OrgTeamsRoute = () => {
  const {organization} = useOrganizationOutlet()
  return <OrgTeams organizationRef={organization} />
}

export default OrgTeamsRoute
