import {getUserQueryJobData} from '../publishToEmbedder'

jest.mock('../../../../utils/embeddingResponder', () => ({
  embeddingResponder: {channelName: 'embedderResponse:1', nextRequestId: () => 7}
}))

afterEach(() => {
  jest.restoreAllMocks()
})

it('expires the job when the requester stops waiting', () => {
  jest.spyOn(Date, 'now').mockReturnValue(1_000)
  expect(getUserQueryJobData('retro', 3_000).expiresAt).toBe(4_000)
  expect(getUserQueryJobData('retro').expiresAt).toBe(11_000)
})

it('takes its request id from the responder that every requester shares', () => {
  expect(getUserQueryJobData('retro').requestId).toBe(7)
})
