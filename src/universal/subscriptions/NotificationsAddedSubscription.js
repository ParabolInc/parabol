import notificationHandler from 'universal/subscriptions/helpers/notificationHandler';

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
          inviterName
          inviteeEmail
          team {
            id
            name
            tier
          }
        }
        ... on NotifyTeamArchived {
          teamName
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
          teamName
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
      notifications.forEach((payload) => {
        const type = payload.getValue('type');
        const handler = notificationHandler[type];
        if (handler) {
          handler(payload, options);
        }
      });
    }
  };
};

export default NotificationsAddedSubscription;
