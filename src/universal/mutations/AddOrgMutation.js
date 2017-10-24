import {commitMutation} from 'react-relay';
import {insertNodeBefore} from 'universal/utils/relay/insertEdge';

const mutation = graphql`
  mutation AddOrgMutation($newTeam: TeamInput!, $invitees: [Invitee!], $orgName: String!) {
    addOrg(newTeam: $newTeam, invitees: $invitees, orgName: $orgName) {
      organization {
        id
        name
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        picture
        tier
      }
    }
  }
`;

export const addOrgUpdater = (store, viewerId, newNode) => {
  // update the organizations page
  const viewer = store.get(viewerId);
  const organizations = viewer.getLinkedRecords('organizations');
  if (organizations) {
    const newNodes = insertNodeBefore(organizations, newNode, 'name');
    viewer.setLinkedRecords(newNodes, 'organizations');
  }
};

const AddOrgMutation = (environment, newTeam, invitees, orgName, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {newTeam, invitees, orgName},
    updater: (store) => {
      const node = store.getRootField('addOrg').getLinkedRecord('organization');
      addOrgUpdater(store, viewerId, node);
    },
    onCompleted,
    onError
  });
};

export default AddOrgMutation;
