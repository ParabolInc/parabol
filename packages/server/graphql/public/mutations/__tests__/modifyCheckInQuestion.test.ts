import type {GraphQLResolveInfo} from 'graphql'
import publish from '../../../../utils/publish'
import type {GQLContext} from '../../../graphql'
import modifyCheckInQuestion from '../modifyCheckInQuestion'

jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../../utils/OpenAIServerManager', () => ({
  __esModule: true,
  default: class {
    modifyCheckInQuestion = async () => 'A rewritten question'
  }
}))

const buildContext = () => {
  const loaders: Record<string, unknown> = {
    newMeetings: {load: async () => ({id: 'meeting1', endedAt: null})}
  }
  return {
    authToken: {sub: 'viewer1'},
    socketId: 'socket1',
    dataLoader: {get: (name: string) => loaders[name], share: () => 'op'}
  } as unknown as GQLContext
}

const info = {} as GraphQLResolveInfo
const resolve = modifyCheckInQuestion
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

describe('modifyCheckInQuestion', () => {
  it('returns the modified question only to the caller, without publishing to the meeting channel', async () => {
    const res = await resolve(
      {},
      {meetingId: 'meeting1', checkInQuestion: 'What is up?', modifyType: 'FUNNY'},
      buildContext(),
      info
    )
    expect(res).toEqual({modifiedCheckInQuestion: 'A rewritten question'})
    expect(publish).not.toHaveBeenCalled()
  })
})
