import LinkIcon from '@mui/icons-material/Link'
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
    disabled: isEditing
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
          className={cn(isEditing ? 'cursor-default' : 'cursor-pointer')}
          onClick={toggleMetaField}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          ref={tipRef}
        >
          {metaField === 'createdIn' && retroDiscussion ? (
            <span>{retroDiscussion.topicTitle}</span>
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
        {metaField === 'createdIn' && retroDiscussion && (
          <CreatedInLink
            meetingName={retroDiscussion.meetingName}
            topicTitle={retroDiscussion.topicTitle}
            url={retroDiscussion.url}
            openInNewTab={!!openTopicInNewTab}
          />
        )}
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
}

const CreatedInLink = ({meetingName, topicTitle, url, openInNewTab}: CreatedInLinkProps) => {
  const title = `${meetingName} — ${topicTitle}`
  const anchorClassName =
    'ml-1 inline-flex align-middle text-slate-600 hover:text-slate-600 focus:text-slate-600'
  const iconClassName = 'size-3 cursor-pointer'
  if (openInNewTab) {
    return (
      <a
        href={url}
        title={title}
        className={anchorClassName}
        target='_blank'
        rel='noopener noreferrer'
      >
        <LinkIcon className={iconClassName} />
      </a>
    )
  }
  return (
    <Link to={url} title={title} className={anchorClassName}>
      <LinkIcon className={iconClassName} />
    </Link>
  )
}

export default EditingStatus
