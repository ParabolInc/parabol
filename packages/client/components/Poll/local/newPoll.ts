import {commitLocalUpdate, RecordSourceProxy} from 'relay-runtime'
import Atmosphere from '../../../Atmosphere'
import getDiscussionThreadConn from '../../../mutations/connections/getDiscussionThreadConn'
import safePutNodeInConn from '../../../mutations/handlers/safePutNodeInConn'
import clientTempId from '../../../utils/relay/clientTempId'
import createProxyRecord from '../../../utils/relay/createProxyRecord'

const NEW_POLL_OPTIONS_COUNT = 2

export const isLocalPoll = (threadable: {id: string}) =>
  threadable.id.startsWith('poll') && threadable.id.endsWith('tmp')

export const createLocalPoll = (
  atmosphere: Atmosphere,
  discussionId: string,
  threadSortOrder: number
) =>
  commitLocalUpdate(atmosphere, (store) => {
    const {viewerId} = atmosphere
    const user = store.get(viewerId)
    if (!user) return

    const pollId = clientTempId('poll')
    const now = new Date().toJSON()
    const newPollRecord = createProxyRecord(store, 'Poll', {
      id: pollId,
      createdAt: now,
      updatedAt: now,
      createdById: viewerId,
      title: '',
      threadSortOrder
    })
      .setLinkedRecord(user, 'createdByUser')
      .setLinkedRecords(
        Array.from({length: NEW_POLL_OPTIONS_COUNT}).map(() =>
          createEmptyPollOption(pollId, store)
        ),
        'options'
      )

    const threadConn = getDiscussionThreadConn(store, discussionId)
    safePutNodeInConn(threadConn, newPollRecord, store, 'threadSortOrder', true)
  })

export const updateLocalPoll = (atmosphere: Atmosphere, id: string, title: string) =>
  commitLocalUpdate(atmosphere, (store) => {
    const poll = store.get(id)
    if (!poll) return

    poll.setValue(title, 'title')
  })

export const updateLocalPollOption = (atmosphere: Atmosphere, id: string, title: string) =>
  commitLocalUpdate(atmosphere, (store) => {
    const pollOption = store.get(id)
    if (!pollOption) return

    pollOption.setValue(title, 'title')
  })

export const addLocalPollOption = (atmosphere: Atmosphere, pollId: string) =>
  commitLocalUpdate(atmosphere, (store) => {
    const poll = store.get(pollId)
    if (!poll) return

    const pollOptions = poll.getLinkedRecords('options') || []
    const pollOption = createEmptyPollOption(pollId, store)
    poll.setLinkedRecords([...pollOptions, pollOption], 'options')
    poll.setValue(new Date().toJSON(), 'updatedAt')
  })

const createEmptyPollOption = (pollId: string, store: RecordSourceProxy) => {
  return createProxyRecord(store, 'PollOption', {
    id: clientTempId('poll'),
    title: '',
    pollId
  })
}
