import React from 'react'
import {Poll_poll} from '~/__generated__/Poll_poll.graphql'

export type PollState = 'creating' | 'created'

interface PollContextType {
  pollState: PollState
  canCreatePoll: boolean
  poll: Poll_poll
  updatePoll: (pollId: string, title: string) => void
  updatePollOption: (optionId: string, title: string) => void
  createPoll: () => void
  addPollOption: () => void
  onPollOptionSelected: (optionId: string) => void
  selectedPollOptionId: string | null
  onPollFocused: () => void
  onPollBlurred: () => void
}
export const PollContext = React.createContext<PollContextType | null>(null)

export const usePollContext = () => {
  const context = React.useContext(PollContext)
  if (!context) {
    throw new Error(`Poll compound components cannot be rendered outside the Poll component`)
  }
  return context
}
