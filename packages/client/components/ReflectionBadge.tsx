import * as React from 'react'
import {IUser} from '../types/graphql'

interface ReflectionBadgeProps {
  toggleAnonymity: () => void
  isAnonymous: boolean
  isViewerCreator: boolean
  createdBy?: Pick<IUser, 'preferredName' | 'picture' | 'id'>
  /* */
}

const ReflectionBadge = ({
  isViewerCreator,
  isAnonymous,
  createdBy,
  toggleAnonymity
}: ReflectionBadgeProps) => {
  console.log(isAnonymous)
  // If the reflection is anonymous and does not belong to the viewer, show nothing
  if (isAnonymous && !isViewerCreator) return null

  if (!isAnonymous && !createdBy) return null

  if (!isViewerCreator && createdBy) {
    return <p>{createdBy.preferredName}</p>
  }

  if (isViewerCreator && createdBy) {
    return (
      <button onClick={toggleAnonymity}>
        {isAnonymous ? 'Anonymous' : createdBy.preferredName}
      </button>
    )
  }
  return null
}

export default ReflectionBadge
