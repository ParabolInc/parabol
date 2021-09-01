import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Poll_poll} from '~/__generated__/Poll_poll.graphql'

import {PollContext} from './PollContext'

interface PollProps {
  as: React.ComponentType<any>
  children: React.ReactNode
  poll: Poll_poll
}

const Poll = React.forwardRef((props: PollProps, ref) => {
  const {as: Component, children} = props
  const [selectedOptionId, setSelectedOptionId] = React.useState<string>('')
  const onOptionSelected = React.useCallback((optionId: string) => {
    setSelectedOptionId(optionId)
  }, [])
  const value = React.useMemo(() => ({onOptionSelected, selectedOptionId} as const), [
    onOptionSelected,
    selectedOptionId
  ])

  return (
    <PollContext.Provider value={value}>
      <Component ref={ref}>{children}</Component>
    </PollContext.Provider>
  )
})

export default createFragmentContainer(Poll, {
  discussion: graphql`
    fragment Poll_discussion on Discussion {
      id
    }
  `,
  poll: graphql`
    fragment Poll_poll on Poll {
      id
      title
      threadSortOrder
    }
  `
})
