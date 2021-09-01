import React from 'react'

interface PollContextType {
  onOptionSelected: (optionId: string) => void
  selectedOptionId: string | null
}
export const PollContext = React.createContext<PollContextType>(null)

export const usePollContext = () => {
  const context = React.useContext(PollContext)
  if (!context) {
    throw new Error(`Poll compound components cannot be rendered outside the Poll component`)
  }
  return context
}
