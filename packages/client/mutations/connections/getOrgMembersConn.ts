import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getOrgMembersConn = (organization: ReadOnlyRecordProxy) =>
  ConnectionHandler.getConnection(organization, 'OrgMembers_organizationUsers')

export default getOrgMembersConn
