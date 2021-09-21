import React from 'react'
import {Poll_poll} from '~/__generated__/Poll_poll.graphql'

export type PollState = 'creating' | 'created'

interface PollContextType {
  pollState: PollState
  poll: Poll_poll
  updatePoll: (optionId: string, title: string) => void
  updatePollOption: (optionId: string, title: string) => void
  onOptionSelected: (optionId: string) => void
  createPoll: () => void
  addPollOption: () => void
  selectedOptionId: string | null
}
export const PollContext = React.createContext<PollContextType | null>(null)

export const usePollContext = () => {
  const context = React.useContext(PollContext)
  if (!context) {
    throw new Error(`Poll compound components cannot be rendered outside the Poll component`)
  }
  return context
}
