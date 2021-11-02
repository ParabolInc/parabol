import isTempId from '../../utils/relay/isTempId'

export type PollState = 'creating' | 'created'

export const getPollState = (pollId: string) => {
  return isTempId(pollId) ? 'creating' : 'created'
}
