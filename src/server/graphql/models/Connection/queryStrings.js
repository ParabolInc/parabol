export const addConnectionString = `
mutation ($userId: ID!, $socketId: ID!) {
  addConnection(userId: $userId, socketId: $socketId)
}`;
