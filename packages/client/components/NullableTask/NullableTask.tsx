import {convertFromRaw} from 'draft-js'
import React, {useEffect, useMemo} from 'react'
import NullCard from '../NullCard/NullCard'
import OutcomeCardContainer from '../../modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from '../../hooks/useAtmosphere'
import {NullableTask_task} from '../../__generated__/NullableTask_task.graphql'
import makeEmptyStr from '../../utils/draftjs/makeEmptyStr'
import {AreaEnum} from '../../types/graphql'

interface Props {
  area: AreaEnum
  hasDragStyles?: boolean
  isAgenda?: boolean
  isDragging?: boolean
  isPreview?: boolean
  measure?: () => void
  task: NullableTask_task
}

const propsAreEqual = (prevProps: Props, nextProps: Props) => {
  const {isPreview, task} = nextProps
  return isPreview
    ? task.status === prevProps.task.status && task.content === prevProps.task.content
    : false
}

const NullableTask = React.memo((props: Props) => {
  const {area, hasDragStyles, isAgenda, task, isDragging} = props
  const {content, createdBy, assignee} = task
  const {preferredName} = assignee
  const contentState = useMemo(() => {
    try {
      return convertFromRaw(JSON.parse(content))
    } catch(e) {
      return convertFromRaw(JSON.parse(makeEmptyStr()))
    }
  }, [content])

  const atmosphere = useAtmosphere()
  useEffect(() => {
    let isMounted = true
    setTimeout(() => {
      isMounted && props.measure && props.measure()
    })
    return () => {
      isMounted = false
    }
  }, [/* eslint-disable-line react-hooks/exhaustive-deps*/])

  const showOutcome = contentState.hasText() || createdBy === atmosphere.viewerId
  return showOutcome ? (
    <OutcomeCardContainer
      area={area}
      contentState={contentState}
      hasDragStyles={hasDragStyles}
      isDragging={isDragging}
      isAgenda={isAgenda}
      task={task}
    />
  ) : (
    <NullCard preferredName={preferredName} />
  )
}, propsAreEqual)

export default createFragmentContainer(NullableTask, {
  task: graphql`
    fragment NullableTask_task on Task {
      content
      createdBy
      status
      assignee {
        ... on TeamMember {
          preferredName
        }
      }
      ...OutcomeCardContainer_task
    }
  `
})
