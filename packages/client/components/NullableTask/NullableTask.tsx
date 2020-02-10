import {convertFromRaw} from 'draft-js'
import React, {useEffect, useMemo} from 'react'
import NullCard from '../NullCard/NullCard'
import OutcomeCardContainer from '../../modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from '../../hooks/useAtmosphere'
import {NullableTask_task} from '../../__generated__/NullableTask_task.graphql'
import makeEmptyStr from '../../utils/draftjs/makeEmptyStr'
import {AreaEnum, TaskStatusEnum} from '../../types/graphql'

interface Props {
  area: AreaEnum
  isAgenda?: boolean
  isDraggingOver?: TaskStatusEnum
  measure?: () => void
  task: NullableTask_task
}

const NullableTask = (props: Props) => {
  const {area, isAgenda, task, isDraggingOver} = props
  const {content, createdBy, createdByUser} = task
  const {preferredName} = createdByUser
  const contentState = useMemo(() => {
    try {
      return convertFromRaw(JSON.parse(content))
    } catch (e) {
      return convertFromRaw(JSON.parse(makeEmptyStr()))
    }
  }, [content])

  const atmosphere = useAtmosphere()
  useEffect(
    () => {
      let isMounted = true
      setTimeout(() => {
        isMounted && props.measure && props.measure()
      })
      return () => {
        isMounted = false
      }
    },
    [
      /* eslint-disable-line react-hooks/exhaustive-deps*/
    ]
  )

  const showOutcome = contentState.hasText() || createdBy === atmosphere.viewerId
  return showOutcome ? (
    <OutcomeCardContainer
      area={area}
      contentState={contentState}
      isDraggingOver={isDraggingOver}
      isAgenda={isAgenda}
      task={task}
    />
  ) : (
    <NullCard preferredName={preferredName} />
  )
}

export default createFragmentContainer(NullableTask, {
  task: graphql`
    fragment NullableTask_task on Task {
      content
      createdBy
      createdByUser {
        preferredName
      }
      status
      ...OutcomeCardContainer_task
    }
  `
})
