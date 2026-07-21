import {Edit} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {forwardRef, type Ref, type RefObject} from 'react'
import {useFragment} from 'react-relay'
import type {ReflectionGroupHeader_meeting$key} from '../__generated__/ReflectionGroupHeader_meeting.graphql'
import type {ReflectionGroupHeader_reflectionGroup$key} from '../__generated__/ReflectionGroupHeader_reflectionGroup.graphql'
import {PortalStatus} from '../hooks/usePortal'
import {cn} from '../ui/cn'
import {GROUP, VOTE} from '../utils/constants'
import plural from '../utils/plural'
import ReflectionGroupTitleEditor from './ReflectionGroup/ReflectionGroupTitleEditor'
import ReflectionGroupVoting from './ReflectionGroupVoting'
import BaseTag from './Tag/BaseTag'

interface Props {
  meeting: ReflectionGroupHeader_meeting$key
  reflectionGroup: ReflectionGroupHeader_reflectionGroup$key
  isExpanded?: boolean
  portalStatus: PortalStatus
  titleInputRef: RefObject<HTMLInputElement>
  dataCy?: string
}

const ReflectionGroupHeader = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {
    meeting: meetingRef,
    reflectionGroup: reflectionGroupRef,
    titleInputRef,
    portalStatus,
    dataCy
  } = props
  const meeting = useFragment(
    graphql`
      fragment ReflectionGroupHeader_meeting on RetrospectiveMeeting {
        localStage {
          isComplete
        }
        localPhase {
          phaseType
        }
        ...ReflectionGroupTitleEditor_meeting
        ...ReflectionGroupVoting_meeting
      }
    `,
    meetingRef
  )
  const reflectionGroup = useFragment(
    graphql`
      fragment ReflectionGroupHeader_reflectionGroup on RetroReflectionGroup {
        ...ReflectionGroupTitleEditor_reflectionGroup
        ...ReflectionGroupVoting_reflectionGroup
        reflections {
          id
        }
      }
    `,
    reflectionGroupRef
  )
  const isExpanded = !!props.isExpanded
  const {
    localStage,
    localPhase: {phaseType}
  } = meeting
  const {reflections} = reflectionGroup
  const canEdit = (phaseType === GROUP || phaseType === VOTE) && !localStage.isComplete
  const onClick = () => {
    titleInputRef.current && titleInputRef.current.select()
  }
  const dialogClosed = portalStatus === PortalStatus.Exited || portalStatus === PortalStatus.Exiting

  return (
    <div
      data-cy={dataCy}
      className={cn(
        'relative flex min-h-8 w-full max-w-74 shrink items-center justify-between pr-2 pl-4 text-[14px]',
        isExpanded && 'mx-3',
        !isExpanded && portalStatus !== PortalStatus.Exited && 'opacity-0'
      )}
      ref={ref}
    >
      <ReflectionGroupTitleEditor
        isExpanded={isExpanded && portalStatus !== PortalStatus.Exiting}
        reflectionGroup={reflectionGroup}
        meeting={meeting}
        readOnly={!canEdit}
        titleInputRef={titleInputRef}
      />
      {phaseType === GROUP && (
        <div className='flex items-center'>
          {canEdit && (
            <Edit
              className={cn(
                'top-px mr-1 block h-4.5 w-4.5 opacity-50 hover:cursor-pointer',
                isExpanded ? 'text-white' : 'text-fg-secondary'
              )}
              onClick={onClick}
            />
          )}
          <BaseTag
            className={cn(
              'mr-1',
              dialogClosed ? 'bg-slate-600 text-white' : 'bg-surface-card text-fg-primary'
            )}
          >{`${reflections.length} ${plural(reflections.length, 'Card')}`}</BaseTag>
        </div>
      )}
      {phaseType === VOTE && (
        <ReflectionGroupVoting
          isExpanded={isExpanded && portalStatus !== PortalStatus.Exiting}
          reflectionGroup={reflectionGroup}
          meeting={meeting}
        />
      )}
    </div>
  )
})

export default ReflectionGroupHeader
