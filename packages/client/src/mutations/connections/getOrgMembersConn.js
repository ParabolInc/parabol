import {ConnectionHandler} from 'relay-runtime'

const getOrgMembersConn = (organization) =>
  ConnectionHandler.getConnection(organization, 'OrgMembers_organizationUsers')

export default getOrgMembersConn
