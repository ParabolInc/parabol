import {commitMutation} from 'react-relay';
import {MAX_PROJECTS_HIT} from 'universal/utils/constants';
import {showError} from 'universal/modules/toast/ducks/toastDuck';

const mutation = graphql`
  mutation CreateProjectMutation($newProject: ProjectInput!) {
    createProject(newProject: $newProject) {
      project {
        id
        agendaId
        content
        createdAt
        createdBy
        sortOrder
        status
        tags
        teamId
        teamMemberId
        updatedAt
        userId
      }
    }
  }
`;

const CreateProjectMutation = (environment, newProject, dispatch, history) => {
  // const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {newProject},
    // updater: (store) => {
    // },
    // optimisticUpdater: (store) => {
    // TODO add the team to the sidebar when we move teams to relay
    // },
    onError: (error) => {
      if (error._error === MAX_PROJECTS_HIT) {
        if (error.orgId) {
          dispatch(showError({
            autoDismiss: 10,
            title: 'Awh shoot',
            message: 'You\'ve hit the project limit for a personal account.',
            action: {
              label: 'Upgrade!',
              callback: () => {
                history.push(`/me/organizations/${error.orgId}/billing`);
              }
            }
          }));
        } else if (error.billingLeader) {
          const {preferredName, email} = error.billingLeader;
          dispatch(showError({
            autoDismiss: 10,
            title: 'Awh shoot',
            message: `You've hit the project limit for a personal account. Tell ${preferredName} at ${email} to upgrade!`
          }));
        }
      }
    }
    // onCompleted,
  });
};

export default CreateProjectMutation;
