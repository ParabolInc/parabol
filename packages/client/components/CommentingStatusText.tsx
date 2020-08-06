import React from 'react'
import Ellipsis from './Ellipsis/Ellipsis'

interface Props {
  preferredNames: string[]
}

const CommentingStatusText = (props: Props) => {
  const {preferredNames} = props
  if (!preferredNames || !preferredNames.length) return null

  if (preferredNames.length === 1) {
    const commenter = preferredNames[0]
    return (
      <span>
        {commenter}
        {' is commenting'}
        <Ellipsis />
      </span>
    )
  }
  if (preferredNames.length === 2) {
    return (
      <span>
        {`${preferredNames[0]} and ${preferredNames[1]} are commenting`}
        <Ellipsis />
      </span>
    )
  }
  return (
    <span>
      {'Several people are commenting'}
      <Ellipsis />
    </span>
  )
}

export default CommentingStatusText
