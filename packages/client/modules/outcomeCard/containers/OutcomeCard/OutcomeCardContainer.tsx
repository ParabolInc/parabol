import styled from '@emotion/styled'
import {Editor} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {memo, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {OutcomeCardContainer_task$key} from '~/__generated__/OutcomeCardContainer_task.graphql'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import useClickAway from '~/hooks/useClickAway'
import useScrollIntoView from '~/hooks/useScrollIntoVIew'
import SetTaskHighlightMutation from '~/mutations/SetTaskHighlightMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useTaskChildFocus from '../../../../hooks/useTaskChildFocus'
import OutcomeCard from '../../components/OutcomeCard/OutcomeCard'

const Wrapper = styled('div')({
  outline: 'none'
})

interface Props {
  area: AreaEnum
  editor: Editor
  className?: string
  isAgenda: boolean | undefined
  task: OutcomeCardContainer_task$key
  clearIsCreatingNewTask?: () => void
  isViewerMeetingSection?: boolean
  meetingId?: string
  handleCardUpdate: () => void
}

const OutcomeCardContainer = memo((props: Props) => {
  const {
    editor,
    className,
    task: taskRef,
    area,
    isAgenda,
    isViewerMeetingSection,
    meetingId,
    handleCardUpdate
  } = props
  const task = useFragment(
    graphql`
      fragment OutcomeCardContainer_task on Task @argumentDefinitions(meetingId: {type: "ID"}) {
        editors {
          userId
        }
        id
        ...OutcomeCard_task @arguments(meetingId: $meetingId)
      }
    `,
    taskRef
  )
  const {id: taskId} = task
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLDivElement>(null)
  const [isTaskHovered, setIsTaskHovered] = useState(false)

  const {useTaskChild, isTaskFocused, addTaskChild, removeTaskChild} = useTaskChildFocus(taskId)

  const isHighlighted = isTaskHovered
  useEffect(() => {
    if (!isViewerMeetingSection || !meetingId) return

    SetTaskHighlightMutation(atmosphere, {
      taskId,
      meetingId,
      isHighlighted
    })
  }, [isHighlighted])

  useScrollIntoView(ref, editor.isEmpty)
  useClickAway(ref, () => setIsTaskHovered(false))
  return (
    <Wrapper
      tabIndex={-1}
      className={className}
      onMouseEnter={() => setIsTaskHovered(true)}
      onMouseLeave={() => setIsTaskHovered(false)}
      onMouseOver={() => setIsTaskHovered(true)}
      ref={ref}
    >
      <OutcomeCard
        area={area}
        editor={editor}
        handleCardUpdate={handleCardUpdate}
        isTaskFocused={isTaskFocused()}
        isTaskHovered={isTaskHovered}
        isAgenda={!!isAgenda}
        task={task}
        useTaskChild={useTaskChild}
        addTaskChild={addTaskChild}
        removeTaskChild={removeTaskChild}
      />
    </Wrapper>
  )
})

export default OutcomeCardContainer
