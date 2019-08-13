import React, {useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import EditingStatus from '../../components/EditingStatus/EditingStatus'
import getRefreshPeriod from '../../utils/getRefreshPeriod'
import graphql from 'babel-plugin-relay/macro'
import {EditingStatusContainer_task} from '__generated__/EditingStatusContainer_task.graphql'
import useForceUpdate from '../../hooks/useForceUpdate'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'

interface Props {
  isTaskHovered: boolean
  task: EditingStatusContainer_task,
  useTaskChild: UseTaskChild
}

export type TimestampType = 'createdAt' | 'updatedAt'

const EditingStatusContainer = (props: Props) => {
  const {isTaskHovered, task, useTaskChild} = props
  const {createdAt, updatedAt} = task
  const refreshTimerRef = useRef<number | undefined>()
  const forceUpdate = useForceUpdate()
  const [timestampType, setTimestampType] = useState<TimestampType>('createdAt')
  const toggleTimestamp = () => {
    setTimestampType(timestampType === 'createdAt' ? 'updatedAt' : 'createdAt')
  }
  const timestamp = timestampType === 'createdAt' ? createdAt : updatedAt
  useEffect(() => {
    window.clearTimeout(refreshTimerRef.current)
    const timeTilRefresh = getRefreshPeriod(timestamp)
    refreshTimerRef.current = window.setTimeout(() => {
      forceUpdate()
    }, timeTilRefresh)
  })
  return (
    <EditingStatus
      isTaskHovered={isTaskHovered}
      handleClick={toggleTimestamp}
      task={task}
      timestamp={timestamp}
      timestampType={timestampType}
      useTaskChild={useTaskChild}
    />
  )
}

export default createFragmentContainer(EditingStatusContainer, {
  task: graphql`
    fragment EditingStatusContainer_task on Task {
      createdAt
      updatedAt
      ...EditingStatus_task
    }
  `
})
