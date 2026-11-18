import OrgMembersRoot from '../../containers/OrgMembers/OrgMembersRoot'
import useOrganizationOutlet from './useOrganizationOutlet'

const OrgMembersRoute = () => {
  const {orgId} = useOrganizationOutlet()
  return <OrgMembersRoot orgId={orgId} />
}

export default OrgMembersRoute
