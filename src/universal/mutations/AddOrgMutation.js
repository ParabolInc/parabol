import {commitMutation} from 'react-relay';
import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';

const mutation = graphql`
  mutation AddOrgMutation($newTeam: NewTeamInput!, $invitees: [Invitee!], $orgName: String!) {
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
      team {
        ...CompleteTeamFragWithMembers
      }
    }
  }
`;

const AddOrgMutation = (environment, newTeam, invitees, orgName, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {newTeam, invitees, orgName},
    updater: (store) => {
      const payload = store.getRootField('addOrg');
      const organization = payload.getLinkedRecord('organization');
      const team = payload.getLinkedRecord('team');
      handleAddOrganization(organization, store, viewerId);
      handleAddTeams(team, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default AddOrgMutation;
