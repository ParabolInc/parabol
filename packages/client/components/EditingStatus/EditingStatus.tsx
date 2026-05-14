import LoopIcon from '@mui/icons-material/Loop'
import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {type ReactNode, useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {EditingStatus_task$key} from '~/__generated__/EditingStatus_task.graphql'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
import useAtmosphere from '../../hooks/useAtmosphere'
import type {UseTaskChild} from '../../hooks/useTaskChildFocus'
import {cn} from '../../ui/cn'
import DueDateToggle from '../DueDateToggle'
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
        retroDiscussion {
          meetingName
          topicTitle
          url
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
  const {createdAt, updatedAt, retroDiscussion, editors} = task
  const hasRetro = !!retroDiscussion
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

  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER, {
    disabled: isEditing || metaField === 'createdIn'
  })

  const toggleMetaField = (e: React.MouseEvent) => {
    e.preventDefault()
    closeTooltip()
    setMetaField(nextMetaField(metaField, hasRetro))
  }

  const effectiveField: 'createdAt' | 'updatedAt' =
    metaField === 'createdIn' ? 'createdAt' : metaField

  return (
    <div className='flex min-h-[20px] items-start justify-between px-4 pb-1 text-left font-semibold text-[11px] text-slate-600 leading-5'>
      <div className='w-full'>
        {children}
        <span
          className={cn('group', isEditing ? 'cursor-default' : 'cursor-pointer')}
          onClick={metaField === 'createdIn' ? undefined : toggleMetaField}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          ref={tipRef}
        >
          {metaField === 'createdIn' && retroDiscussion ? (
            <CreatedInLink
              meetingName={retroDiscussion.meetingName}
              topicTitle={retroDiscussion.topicTitle}
              url={retroDiscussion.url}
              openInNewTab={!!openTopicInNewTab}
              onRotate={() => setMetaField(nextMetaField(metaField, hasRetro))}
            />
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
        {tooltipPortal(<div>{'Toggle View'}</div>)}
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

interface CreatedInLinkProps {
  meetingName: string
  topicTitle: string
  url: string
  openInNewTab: boolean
  onRotate: () => void
}

const CreatedInLink = ({
  meetingName,
  topicTitle,
  url,
  openInNewTab,
  onRotate
}: CreatedInLinkProps) => {
  const title = `${meetingName} — ${topicTitle}`
  const linkClassName =
    'text-slate-600 hover:text-slate-600 focus:text-slate-600 group-hover:underline'
  const onLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  const onRotateClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRotate()
  }
  const iconClassName = 'ml-1 hidden size-3 cursor-pointer align-middle group-hover:inline-block'
  const link = openInNewTab ? (
    <a
      href={url}
      title={title}
      className={linkClassName}
      target='_blank'
      rel='noopener noreferrer'
      onClick={onLinkClick}
    >
      {topicTitle}
    </a>
  ) : (
    <Link to={url} title={title} className={linkClassName} onClick={onLinkClick}>
      {topicTitle}
    </Link>
  )
  return (
    <>
      {link}
      <LoopIcon className={iconClassName} onClick={onRotateClick} titleAccess='Show date instead' />
    </>
  )
}

export default EditingStatus
