import React from 'react'
import Ellipsis from '../Ellipsis/Ellipsis'

interface Props {
  offsetkey: string
}

const EllipsisDecorator = (props: Props) => {
  const {offsetkey} = props
  return (
    <span data-offset-key={offsetkey}>
      <Ellipsis />
    </span>
  )
}

export default EllipsisDecorator
