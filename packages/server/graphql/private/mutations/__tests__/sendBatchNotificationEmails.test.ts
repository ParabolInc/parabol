import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import sendBatchNotificationEmails from '../sendBatchNotificationEmails'

const mockSendEmail = jest.fn(async () => true)
jest.mock('../../../../email/getMailManager', () => ({
  __esModule: true,
  default: () => ({sendEmail: mockSendEmail})
}))
jest.mock('../../../../email/ServerEnvironment', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../../email/notificationSummaryCreator', () => ({
  __esModule: true,
  default: async () => ({subject: 'You have new notifications', html: '', body: ''})
}))
jest.mock('../../../../postgres/getKysely', () => {
  const unreadCounts = [
    {userId: 'activeUser', notificationCount: '2'},
    {userId: 'deletedUser', notificationCount: '1'}
  ]
  const builder = {
    select: () => builder,
    where: () => builder,
    groupBy: () => builder,
    execute: async () => unreadCounts
  }
  return {__esModule: true, default: () => ({selectFrom: () => builder})}
})

const users = [
  {id: 'activeUser', email: 'active@example.com', preferredName: 'Active', isRemoved: false},
  {
    id: 'deletedUser',
    email: 'DELETED:deletedUser:1794482562652',
    preferredName: 'Deleted',
    isRemoved: true
  }
]
const context = {
  dataLoader: {
    get: (loaderName: string) =>
      loaderName === 'users'
        ? {loadMany: async (ids: string[]) => users.filter(({id}) => ids.includes(id))}
        : {load: async () => []}
  }
} as unknown as GQLContext

const resolve = sendBatchNotificationEmails
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

test('sends no notification summary to a removed user', async () => {
  const sentTo = await resolve({}, {}, context, {} as GraphQLResolveInfo)

  expect(sentTo).toEqual(['active@example.com'])
  expect(mockSendEmail).toHaveBeenCalledTimes(1)
  expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({to: 'active@example.com'}))
})
