import React from 'react'
import styled from '@emotion/styled'
import {usePollContext} from './PollContext'
import PollOption from './PollOption'

const PollOptionsRoot = styled('div')({
  fontSize: '14px',
  padding: `12px`,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
})

const PollOptions = () => {
  const {poll} = usePollContext()

  return (
    <PollOptionsRoot>
      {poll.options.map((option) => (
        <PollOption
          key={option.id}
          id={option.id}
          title={option.title}
          placeholder={option.placeholder ?? ''}
        />
      ))}
    </PollOptionsRoot>
  )
}

export default PollOptions
