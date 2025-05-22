// This script directly demonstrates the bug in publishChangeNotifications.ts
// when unassigning a task (setting userId to null)

// Mock the function needed by publishChangeNotifications
const mockExecute = () => Promise.resolve({});
const mockValues = () => ({ execute: mockExecute });
const mockInsertInto = () => ({ values: mockValues });
const mockGetKysely = () => ({ insertInto: mockInsertInto });

// Mock generateUID to avoid dependency on SERVER_ID
const generateUID = () => 'mock-uid-123';

// Mock the analytics
const mockAnalytics = {
  mentionedOnTask: () => {}
};

// Import the functions from the source files
const getAllNodesAttributesByType = (contentJSON, type) => {
  if (type === 'mention') {
    // For our test, let's return a mention to show the bug
    return type === 'mention' ? [{id: 'user3'}] : [];
  }
  return [];
};

// Simplified publishChangeNotifications function based on the source
const publishChangeNotifications = async (
  task,
  oldTask,
  changeUser,
  usersToIgnore
) => {
  const pg = mockGetKysely();
  const changeAuthorId = `${changeUser.id}::${task.teamId}`;
  const oldContentJSON = JSON.parse(oldTask.content);
  const contentJSON = JSON.parse(task.content);
  const wasPrivate = oldTask.tags.includes('private');
  const isPrivate = task.tags.includes('private');
  const oldMentions = wasPrivate
    ? []
    : getAllNodesAttributesByType(oldContentJSON, 'mention').map(({id}) => id);
  const mentions = isPrivate
    ? []
    : getAllNodesAttributesByType(contentJSON, 'mention').map(({id}) => id);

  // intersect the mentions to get the ones to add and remove
  const userIdsToRemove = oldMentions.filter((userId) => !mentions.includes(userId));
  const notificationsToAdd = mentions
    .filter(
      (userId) =>
        !oldMentions.includes(userId) &&
        userId !== task.userId &&
        changeUser.id !== userId &&
        !usersToIgnore.includes(userId)
    )
    .map((userId) => ({
      id: generateUID(),
      type: 'TASK_INVOLVES',
      userId,
      involvement: 'MENTIONEE',
      taskId: task.id,
      changeAuthorId,
      teamId: task.teamId
    }));

  // add in the assignee changes
  if (oldTask.userId && oldTask.userId !== task.userId) {
    // This is the bug! When task.userId is null/undefined, we should validate it
    // But we're trying to add it without validation
    notificationsToAdd.push({
      id: generateUID(),
      type: 'TASK_INVOLVES',
      userId: task.userId, // Here task.userId is null, which violates DB constraint
      involvement: 'ASSIGNEE',
      taskId: task.id,
      changeAuthorId,
      teamId: task.teamId
    });
    userIdsToRemove.push(oldTask.userId);
  }

  // update changes in the db
  if (notificationsToAdd.length) {
    await pg.insertInto('Notification').values(notificationsToAdd).execute();
  }

  // Log the notifications to see if any have null userId
  console.log('Notifications to add:', JSON.stringify(notificationsToAdd, null, 2));
  
  // Check for null userId in notifications
  const hasNullUserId = notificationsToAdd.some(n => n.userId === null);
  if (hasNullUserId) {
    console.error('BUG DETECTED: Attempted to add notification with null userId');
  }
  
  return { notificationsToAdd };
};

// Create test data
const oldTask = {
  id: 'task123',
  userId: 'user1',
  teamId: 'team1',
  tags: [],
  content: '{"type":"doc","content":[]}'
};

// The new task has userId set to null (unassigned)
const newTask = {
  id: 'task123',
  userId: null, // This is the key part - simulating unassigning a task
  teamId: 'team1',
  tags: [],
  content: '{"type":"doc","content":[]}'
};

const changeUser = {
  id: 'user2',
  email: 'user2@example.com'
};

const usersToIgnore = [];

// Run the function to see if it creates a notification with null userId
console.log('Running bug reproduction for publishChangeNotifications.ts');
console.log('Scenario: Unassigning a task (setting userId from "user1" to null)');
console.log('--------------------------------------------------------------');

publishChangeNotifications(
  newTask,
  oldTask,
  changeUser,
  usersToIgnore
).then(() => {
  console.log('--------------------------------------------------------------');
  console.log('If you see "BUG DETECTED" above, the bug has been reproduced.');
  console.log('The bug exists because no validation is performed when adding notifications');
  console.log('for tasks that are being unassigned (userId set to null).');
}).catch(err => {
  console.error('Error:', err);
});
