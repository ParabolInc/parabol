import publishChangeNotifications from '../publishChangeNotifications'
import getKysely from '../../../../postgres/getKysely'

// Mock getKysely and its return functions
jest.mock('../../../../postgres/getKysely', () => {
  const mockExecute = jest.fn().mockResolvedValue({})
  const mockValues = jest.fn().mockReturnValue({ execute: mockExecute })
  const mockInsertInto = jest.fn().mockReturnValue({ values: mockValues })
  
  return jest.fn().mockReturnValue({
    insertInto: mockInsertInto
  })
})

describe('publishChangeNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should attempt to insert a null userId when unassigning a task', async () => {
    // Setup test data
    const oldTask = {
      id: 'task123',
      userId: 'user1',
      teamId: 'team1',
      tags: [],
      content: '{"type":"doc","content":[]}'
    }

    // The new task has userId set to null (unassigned)
    const newTask = {
      id: 'task123',
      userId: null, // This is the key part - simulating unassigning a task
      teamId: 'team1',
      tags: [],
      content: '{"type":"doc","content":[]}'
    }

    const changeUser = {
      id: 'user2',
      email: 'user2@example.com'
    }

    const usersToIgnore = []

    // Run the function that should trigger the bug
    await publishChangeNotifications(
      newTask,
      oldTask,
      changeUser,
      usersToIgnore
    )

    // Get the mocked functions
    const mockGetKysely = getKysely as jest.MockedFunction<typeof getKysely>
    const mockDb = mockGetKysely()
    
    // Check if insertInto was called
    expect(mockDb.insertInto).toHaveBeenCalledWith('Notification')
    
    // Get the values that were passed to values()
    const mockValues = mockDb.insertInto('Notification').values
    
    // This test will fail if publishChangeNotifications correctly validates userId
    // before adding to notificationsToAdd
    expect(mockValues).toHaveBeenCalled()
    
    // Check the notifications that were passed
    const notificationsArg = mockValues.mock.calls[0][0]
    
    // Verify that there's at least one notification in the array
    expect(notificationsArg.length).toBeGreaterThan(0)
    
    // Find any notification with a null userId
    const hasNullUserId = notificationsArg.some(notification => notification.userId === null)
    
    // The bug exists if we find a notification with null userId
    // This should cause the test to fail because it's trying to insert a null userId
    expect(hasNullUserId).toBe(true)
  })
})
