import {commitMutation} from 'react-relay';
import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';

graphql`
  fragment AddOrgMutation_organization on AddOrgPayload {
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
    team {
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`;

const mutation = graphql`
  mutation AddOrgMutation($newTeam: NewTeamInput!, $invitees: [Invitee!], $orgName: String!) {
    addOrg(newTeam: $newTeam, invitees: $invitees, orgName: $orgName) {
      ...AddOrgMutation_organization @relay(mask: false)      
    }
  }
`;

export const addOrgMutationOrganizationUpdater = (payload, store, viewerId) => {
  const organization = payload.getLinkedRecord('organization');
  handleAddOrganization(organization, store, viewerId);

  const team = payload.getLinkedRecord('team');
  handleAddTeams(team, store, viewerId);
};

const AddOrgMutation = (environment, newTeam, invitees, orgName, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {newTeam, invitees, orgName},
    updater: (store) => {
      const payload = store.getRootField('addOrg');
      addOrgMutationOrganizationUpdater(payload, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default AddOrgMutation;
