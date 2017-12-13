const fieldsToSerialize = {
  NotificationsClearedPayload: [
    'deletedIds'
  ],
  RejectOrgApprovalPayload: [
    'notifications.id',
    'notifications.inviteeEmail',
    'notifications.inviterUserId',
    'notifications.orgId',
    'notifications.teamId',
    'notifications.userIds',
    'orgApprovals.deniedBy'
  ]
};

const serializeGraphQLType = (actualResult, type, dynamicSerializer) => {
  const typeMap = fieldsToSerialize[type];
  if (!typeMap) {
    throw new Error(`BAD MOCK: No fieldsToSerialize for GraphQL type ${type}`);
  }
  return dynamicSerializer.toStatic(actualResult, typeMap);
};

export default serializeGraphQLType;
