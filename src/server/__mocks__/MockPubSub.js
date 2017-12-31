import * as getPubSub from 'server/utils/getPubSub';

const fieldsToSerialize = {
  invitation: [
    'channelId',
    'message.data.invitation.id',
    'message.data.invitation.email',
    'message.data.invitation.hashedToken',
    'message.data.invitation.id',
    'message.data.invitation.invitedBy',
    'message.data.invitation.teamId'
  ],
  invitationAdded: [
    'channelId',
    'message.invitationAdded.invitation.id',
    'message.invitationAdded.invitation.email',
    'message.invitationAdded.invitation.hashedToken',
    'message.invitationAdded.invitation.id',
    'message.invitationAdded.invitation.invitedBy',
    'message.invitationAdded.invitation.teamId'
  ],
  invitationRemoved: [
    'channelId',
    'message.invitationRemoved.invitation.id',
    'message.invitationRemoved.invitation.email',
    'message.invitationRemoved.invitation.hashedToken',
    'message.invitationRemoved.invitation.inviteToken',
    'message.invitationRemoved.invitation.invitedBy',
    'message.invitationRemoved.invitation.teamId'
  ],
  newAuthToken: [
    'channelId',
    'message.newAuthToken'
  ],
  notification: [
    'channelId',
    'message.data.notifications.id',
    'message.data.notifications.orgId',
    'message.data.notifications.teamId',
    'message.data.notifications.userIds',
    'message.data.notifications.inviteeEmail'
  ],
  notificationsCleared: [
    'channelId',
    'message.notificationsCleared.deletedIds'
  ],
  orgApprovalRemoved: [
    'channelId',
    'message.orgApprovalRemoved.orgApproval.approvedBy',
    'message.orgApprovalRemoved.orgApproval.deniedBy',
    'message.orgApprovalRemoved.orgApproval.email',
    'message.orgApprovalRemoved.orgApproval.id',
    'message.orgApprovalRemoved.orgApproval.orgId',
    'message.orgApprovalRemoved.orgApproval.teamId'
  ],
  teamAdded: [
    'channelId',
    'message.teamAdded.notification.teamId',
    'message.teamAdded.teamId',
    'message.teamAdded.teamMemberId'
  ],
  teamUpdated: [
    'channelId',
    'message.teamUpdated.team.id',
    'message.teamUpdated.team.orgId'
  ],
  teamMemberAdded: [
    'channelId',
    'message.teamMemberAdded.teamMember.id',
    'message.teamMemberAdded.teamMember.email',
    'message.teamMemberAdded.teamMember.teamId',
    'message.teamMemberAdded.teamMember.userId'
  ]
};

const fieldsToSort = {
  notificationsAdded: [
    'message.notificationsAdded.notifications.0.teamName',
    'message.notificationsAdded.notifications.0.type'
  ],
  orgApprovalRemoved: [
    'message.orgApprovalRemoved.orgApproval.createdAt'
  ]
};

const unsortables = new Set(['invitationAdded']);


const getPath = (str, obj) => str.split('.').reduce((o, i) => o[i], obj);

export default class MockPubSub {
  constructor() {
    getPubSub.default = () => this;
    this.db = {};
  }

  __serialize(dynamicSerializer) {
    const channels = Object.keys(this.db).sort();
    const snapshot = {};
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      const doc = this.db[channel];
      const channelFields = fieldsToSerialize[channel];
      if (!channelFields) {
        throw new Error(`BAD MOCK: No fieldsToSerialize for pubsub channel ${channel}`);
      }
      snapshot[channel] = dynamicSerializer.toStatic(doc, channelFields, {constant: unsortables.has(channel)});
      // we don't care about the order, so make it repeatable
      const customSorts = fieldsToSort[channel] || [];
      const sortFields = customSorts.concat('channelId');
      snapshot[channel].sort((a, b) => {
        for (let ii = 0; ii < sortFields.length; ii++) {
          const sortField = sortFields[ii];
          const aVal = getPath(sortField, a);
          const bVal = getPath(sortField, b);
          if (aVal === bVal) continue;
          return aVal > bVal;
        }
        return 0;
      });
    }
    return snapshot;
  }

  publish(channel, message) {
    const [channelName, channelId] = channel.split('.');
    this.db[channelName] = this.db[channelName] || [];
    this.db[channelName].push({channelId, message});
  }
}

