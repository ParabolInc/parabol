import {approveToOrgNotificationUpdater} from 'universal/mutations/ApproveToOrgMutation';

// ... on NotificationAdded {
//  notification {
//    id
//    orgId
//    startAt
//    type
//
//          # Requirements for persisted notifications
//  ...NotificationRow_notification
//
//          # Requiremnts for toast notifications (notificationHandler.js)
//  ... on NotifyAddedToTeam {
//      id
//      team {
//        name
//      }
//    }
//  ... on NotifyDenial {
//      inviteeEmail
//    }
//  ... on NotifyKickedOut {
//      team {
//        id
//        name
//      }
//    }
//  ... on NotifyProjectInvolves {
//      involvement
//      changeAuthor {
//        preferredName
//      }
//    }
//  ,,, on NotifyInviteeApproved {
//      inviteeEmail
//      team {
//        id
//        name
//      }
//    }
//  ... on NotifyInvitation {
//      inviter {
//        preferredName
//      }
//      inviteeEmail
//      team {
//        id
//        name
//        tier
//      }
//    }
//  ... on NotifyTeamArchived {
//      team {
//        name
//      }
//    }
//
//          # Requirements for toast notifications that aren't persisted
//  ... on NotifyFacilitatorRequest {
//      requestor {
//        id
//        preferredName
//      }
//    }
//  ... on NotifyNewTeamMember {
//      preferredName
//      team {
//        name
//      }
//    }
//  ... on NotifyVersionInfo {
//      version
//    }
//  }
// }
// ... on NotificationRemoved {
//  notification {
//    id
//  }
// }

const subscription = graphql`
  subscription NotificationSubscription {
    notificationSubscription {
      __typename
      ...ApproveToOrgMutation_notification
    }
  }
`;

const NotificationSubscription = (environment, queryVariables, {dispatch, history, location}) => {
  //const {viewerId} = environment;
  return {
    subscription,
    updater: (store) => {
      const options = {dispatch, environment, history, location, store};
      const payload = store.getRootField('notificationSubscription');
      const type = payload.getValue('__typename');
      switch (type) {
        case 'ApproveToOrgPayload':
          approveToOrgNotificationUpdater(payload, options);
          break;
        default:
          console.error('NotificationSubscription case fail', type);
      }
      // const notification = payload.getLinkedRecord('notification');
      // if (type === 'NotificationAdded') {
      //  handleAddNotifications(notification, options);
      // } else if (type === 'NotificationRemoved') {
      //  const notificationId = notification.getValue('id');
      //  handleRemoveNotifications(notificationId, store, viewerId);
      // }
    }
  };
};

export default NotificationSubscription;
