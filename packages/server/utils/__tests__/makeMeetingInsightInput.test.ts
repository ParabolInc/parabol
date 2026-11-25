import type {DataLoaderInstance} from '../../dataloader/RootDataLoader'
import type {RetrospectiveMeeting} from '../../postgres/types/Meeting'
import {makeRetroMeetingInsightInput} from '../makeMeetingInsightInput'

jest.mock('../../graphql/public/mutations/helpers/getComments', () => ({
  getComments: async () => []
}))

const meeting = {
  id: 'meeting1',
  meetingType: 'retrospective',
  reflectionCount: 3,
  disableAnonymity: false,
  phases: [{phaseType: 'discuss', stages: [{reflectionGroupId: 'group1'}]}]
} as unknown as RetrospectiveMeeting

const tasks = [
  {createdBy: 'sally', plaintextContent: 'Shared task', tags: []},
  {createdBy: 'sally', plaintextContent: 'Private task', tags: ['private']}
]

const dataLoader = {
  get: (loaderName: string) => {
    switch (loaderName) {
      case 'retroReflectionGroupsByMeetingId':
        return {load: async () => [{id: 'group1', title: 'Deploys', voterIds: []}]}
      case 'retroReflectionsByGroupId':
        return {load: async () => []}
      case 'discussions':
        return {load: async () => ({id: 'discussion1'})}
      case 'tasksByDiscussionId':
        return {load: async () => tasks}
      case 'users':
        return {loadNonNull: async () => ({preferredName: 'Sally'})}
      default:
        throw new Error(`Unexpected loader ${loaderName}`)
    }
  }
} as unknown as DataLoaderInstance

test('the insight input leaves private tasks out of a topic', async () => {
  const input = await makeRetroMeetingInsightInput(meeting, dataLoader, 0, 0)

  expect(input?.topics[0]?.tasks).toEqual([{text: 'Shared task', author: 'Sally'}])
})
