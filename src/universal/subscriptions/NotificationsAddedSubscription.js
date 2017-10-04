import notificationHandler from 'universal/subscriptions/helpers/notificationHandler';

const subscription = graphql`
  subscription NotificationsAddedSubscription {
    notificationsAdded {
      notifications {
        id
        orgId
        startAt
        type
        ... on NotifyAddedToTeam {
          authToken
          teamName
          teamId
        }
        ... on NotifyDenial {
          reason
          deniedByName
          inviteeEmail
        }
        ... on NotifyFacilitatorRequest {
          requestorName
          requestorId
        }
        ... on NotifyInvitation {
          inviterName
          inviteeEmail
          teamId
          teamName
        }
        ... on NotifyKickedOut {
          authToken
          isKickout
          teamName
          teamId
        }
        ... on NotifyNewTeamMember {
          preferredName
          teamName
        }
        ... on NotifyPayment {
          last4
          brand
        }
        ... on NotifyPromotion {
          groupName
        }
        ... on NotifyTeamArchived {
          teamName
        }
      }
    }
  }
`;


const NotificationsAddedSubscription = (environment, queryVariables, {dispatch, history, location}) => {
  const {ensureSubscription, viewerId} = environment;
  return ensureSubscription({
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
  });
};

export default NotificationsAddedSubscription;
