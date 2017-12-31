import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';

const subscription = graphql`
  subscription NotificationsAddedSubscription {
    notificationsAdded {
      notifications {
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
          isKickout
          team {
            id
            name
          }
        }
        ... on NotifyPayment {
          orgId
          last4
          brand
        }
        ... on NotifyProjectInvolves {
          involvement
          changeAuthor {
            preferredName
          }
        }
        ... on NotifyPromotion {
          orgId
          groupName
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
        ... on NotifyFacilitatorDisconnected {
          newFacilitator {
            id
            preferredName
            userId
          }
          oldFacilitator {
            preferredName
          }
          teamId
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
  }
`;

const NotificationsAddedSubscription = (environment, queryVariables, {dispatch, history, location}) => {
  const {viewerId} = environment;
  return {
    subscription,
    updater: (store) => {
      const options = {dispatch, environment, history, location, store, viewerId};
      const notifications = store.getRootField('notificationsAdded').getLinkedRecords('notifications');
      handleAddNotifications(notifications, options);
    }
  };
};

export default NotificationsAddedSubscription;
