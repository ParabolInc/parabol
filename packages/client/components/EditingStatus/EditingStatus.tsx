import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {type ReactNode, useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import type {EditingStatus_task$key} from '~/__generated__/EditingStatus_task.graphql'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import useAtmosphere from '../../hooks/useAtmosphere'
import type {UseTaskChild} from '../../hooks/useTaskChildFocus'
import {cn} from '../../ui/cn'
import DueDateToggle from '../DueDateToggle'
import CreatedInLink from './CreatedInLink'
import EditingStatusText from './EditingStatusText'
import nextMetaField, {type TaskMetaField} from './nextMetaField'

export type {TaskMetaField}

interface Props {
  children: ReactNode
  isTaskHovered: boolean
  task: EditingStatus_task$key
  useTaskChild: UseTaskChild
  isArchived?: boolean
  defaultMetaField?: TaskMetaField
  openTopicInNewTab?: boolean
}

const EditingStatus = (props: Props) => {
  const {
    children,
    isTaskHovered,
    task: taskRef,
    useTaskChild,
    isArchived,
    defaultMetaField,
    openTopicInNewTab
  } = props
  const task = useFragment(
    graphql`
      fragment EditingStatus_task on Task {
        createdAt
        updatedAt
        meetingId
        meeting {
          id
          name
        }
        discussion {
          stage {
            ... on RetroDiscussStage {
              stageIdx
              reflectionGroup {
                id
                title
              }
            }
          }
        }
        editors {
          userId
          preferredName
        }
        ...DueDateToggle_task
      }
    `,
    taskRef
  )
  const {createdAt, updatedAt, meetingId, meeting, discussion, editors} = task
  const reflectionGroup = discussion?.stage?.reflectionGroup
  const topicTitle = reflectionGroup?.title ?? 'Untitled topic'
  const stageIdx = discussion?.stage?.stageIdx
  const hasRetro = !!(meetingId && meeting && reflectionGroup && stageIdx !== undefined)
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const otherEditors = editors.filter((editor) => editor.userId !== viewerId)
  const isEditing = editors.length > otherEditors.length

  const initialField: TaskMetaField =
    defaultMetaField === 'createdIn' && hasRetro ? 'createdIn' : 'createdAt'
  const [metaField, setMetaField] = useState<TaskMetaField>(initialField)

  useEffect(() => {
    if (!hasRetro && metaField === 'createdIn') {
      setMetaField('createdAt')
    }
  }, [hasRetro, metaField])

  const toggleMetaField = (e: React.MouseEvent) => {
    e.preventDefault()
    setMetaField(nextMetaField(metaField, hasRetro))
  }

  const effectiveField: 'createdAt' | 'updatedAt' =
    metaField === 'createdIn' ? 'createdAt' : metaField

  return (
    <div className='flex min-h-[20px] items-start justify-between px-4 pb-1 text-left font-semibold text-fg-secondary text-xs leading-5'>
      <div className='w-full'>
        {children}
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(isEditing ? 'cursor-default' : 'cursor-pointer')}
              onClick={toggleMetaField}
            >
              {metaField === 'createdIn' && hasRetro ? (
                <span>{topicTitle}</span>
              ) : (
                <EditingStatusText
                  editors={otherEditors}
                  isArchived={isArchived}
                  isEditing={isEditing}
                  timestamp={effectiveField === 'createdAt' ? createdAt : updatedAt}
                  timestampType={effectiveField}
                />
              )}
            </span>
          </TooltipTrigger>
          {!isEditing && <TooltipContent side='bottom'>Toggle View</TooltipContent>}
        </Tooltip>
        {metaField === 'createdIn' && hasRetro && (
          <CreatedInLink
            meetingId={meetingId}
            meetingName={meeting.name}
            topicTitle={topicTitle}
            stageIdx={stageIdx}
            openInNewTab={!!openTopicInNewTab}
          />
        )}
      </div>
      <DueDateToggle
        cardIsActive={isEditing || isTaskHovered}
        isArchived={isArchived}
        task={task}
        useTaskChild={useTaskChild}
      />
    </div>
  )
}

export default EditingStatus
