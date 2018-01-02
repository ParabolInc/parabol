import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';

const subscription = graphql`
  subscription NotificationSubscription {
    notificationSubscription {
      __typename
      ... on NotificationAdded {
        notification {
          id
          orgId
          startAt
          type

          # Requirements for persisted notifications
          ...NotificationRow_notification

          # Requiremnts for toast notifications (notificationHandler.js)
          ... on NotifyAddedToTeam {
            id
            team {
              name
            }
          }
          ... on NotifyDenial {
            inviteeEmail
          }
          ... on NotifyKickedOut {
            team {
              id
              name
            }
          }
          ... on NotifyProjectInvolves {
            involvement
            changeAuthor {
              preferredName
            }
          }
          ... on NotifyInvitation {
            inviter {
              preferredName
            }
            inviteeEmail
            team {
              id
              name
              tier
            }
          }
          ... on NotifyTeamArchived {
            team {
              name
            }
          }

          # Requirements for toast notifications that aren't persisted 
          ... on NotifyFacilitatorRequest {
            requestor {
              id
              preferredName
            }
          }
          ... on NotifyNewTeamMember {
            preferredName
            team {
              name
            }
          }
          ... on NotifyVersionInfo {
            version
          }
        }
      }
      ... on NotificationRemoved {
        notification {
          id
        }
      }
    }
  }
`;

const NotificationSubscription = (environment, queryVariables, {dispatch, history, location}) => {
  const {viewerId} = environment;
  return {
    subscription,
    updater: (store) => {
      const options = {dispatch, environment, history, location, store, viewerId};
      const payload = store.getRootField('notificationSubscription');
      const notification = payload.getLinkedRecord('notification');
      const type = payload.getValue('__typename');
      if (type === 'NotificationAdded') {
        handleAddNotifications(notification, options);
      } else if (type === 'NotificationRemoved') {
        const notificationId = notification.getValue('id');
        handleRemoveNotifications(notificationId, store, viewerId);
      }
    }
  };
};

export default NotificationSubscription;
