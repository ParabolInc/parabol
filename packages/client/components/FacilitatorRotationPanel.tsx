import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
  type SensorAPI
} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {forwardRef, useCallback, useMemo, useRef, useState} from 'react'
import {flushSync} from 'react-dom'
import {useFragment} from 'react-relay'
import type {FacilitatorRotationPanel_meeting$key} from '~/__generated__/FacilitatorRotationPanel_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Autorenew, CheckCircle, Close, DragIndicator, PlayArrow} from '~/ui/icons'
import useUpdateFacilitatorRotationMutation from '../mutations/useUpdateFacilitatorRotationMutation'
import {Avatar} from '../ui/Avatar/Avatar'
import {AvatarImage} from '../ui/Avatar/AvatarImage'
import {cn} from '../ui/cn'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

const FACILITATOR_ROTATION = 'FACILITATOR_ROTATION'
// one snap per step, paced to dnd's own displacement transition but capped so a long list
// still lands in about half a second
const getStepMs = (steps: number) => Math.min(200, Math.max(80, Math.round(480 / steps)))

interface Props {
  meeting: FacilitatorRotationPanel_meeting$key
  onDone: () => void
}

const FacilitatorRotationPanel = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {meeting: meetingRef, onDone} = props
  const meeting = useFragment(
    graphql`
      fragment FacilitatorRotationPanel_meeting on NewMeeting {
        id
        endedAt
        meetingType
        facilitatorUserId
        meetingMembers {
          userId
          isConnectedAt
        }
        team {
          id
          autoAssignFacilitator
          facilitatorRotation {
            id
            userId
            user {
              id
              preferredName
              picture
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, endedAt, meetingType, facilitatorUserId, meetingMembers, team} = meeting
  const {autoAssignFacilitator, facilitatorRotation} = team
  const {viewerId} = useAtmosphere()
  const [updateFacilitatorRotation] = useUpdateFacilitatorRotationMutation()
  const [isDragging, setIsDragging] = useState(false)
  const sensorApiRef = useRef<SensorAPI | null>(null)
  const registerSensor = useCallback((api: SensorAPI) => {
    sensorApiRef.current = api
  }, [])
  const sensors = useMemo(() => [registerSensor], [registerSensor])
  const isReadOnly = !!endedAt
  // teamHealth is async, so its facilitator is a formality that sits outside the rotation
  const advancesRotation = meetingType !== 'teamHealth'
  // the order only means anything once the server acts on it
  const canReorder = !isReadOnly && autoAssignFacilitator
  const nextUpUserId = facilitatorRotation.find((tm) => tm.userId !== facilitatorUserId)?.userId
  // handing the role to someone who is not in the room stalls the meeting. isConnectedAt is
  // client-only presence fed by awareness, which can lag or miss the viewer's own entry, so
  // trust the local fact that whoever is reading this panel is here
  const connectedUserIds = new Set(
    meetingMembers.filter((mm) => mm.isConnectedAt).map((mm) => mm.userId)
  ).add(viewerId)
  const randomCandidates = facilitatorRotation.filter(
    (tm) => tm.userId !== facilitatorUserId && connectedUserIds.has(tm.userId)
  )

  const reorder = (userIds: string[]) => {
    updateFacilitatorRotation({variables: {meetingId, userIds}})
  }

  /**
   * Walk a row to the top with dnd's own snap animation so the handover is legible. Returns false
   * when dnd cannot take the lock (reordering is off, or another drag holds it) so the caller can
   * fall back to committing the move outright.
   */
  const snapToTop = (teamMemberId: string, fromIdx: number) => {
    const api = sensorApiRef.current
    if (!api || fromIdx <= 0) return false
    const preDrag = api.tryGetLock(teamMemberId)
    if (!preDrag) return false
    const drag = preDrag.snapLift()
    const stepMs = getStepMs(fromIdx)
    let remaining = fromIdx
    const step = () => {
      if (!drag.isActive()) return
      if (remaining === 0) {
        drag.drop()
        return
      }
      drag.moveUp()
      remaining--
      setTimeout(step, stepMs)
    }
    setTimeout(step, stepMs)
    return true
  }

  // the head of the queue is whoever facilitates, so moving someone there hands over the role
  const promote = (userId: string) => {
    const fromIdx = facilitatorRotation.findIndex((tm) => tm.userId === userId)
    const teamMember = facilitatorRotation[fromIdx]
    // the snap animation ends in a real drop, so onDragEnd commits the new order
    if (teamMember && snapToTop(teamMember.id, fromIdx)) return
    reorder([userId, ...facilitatorRotation.map((tm) => tm.userId).filter((id) => id !== userId)])
  }

  const promoteRandom = () => {
    const pick = randomCandidates[Math.floor(Math.random() * randomCandidates.length)]
    if (!pick) return
    promote(pick.userId)
  }

  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result
    if (
      !destination ||
      destination.droppableId !== FACILITATOR_ROTATION ||
      destination.index === source.index
    ) {
      setIsDragging(false)
      return
    }
    const userIds = facilitatorRotation.map((tm) => tm.userId)
    const [movedUserId] = userIds.splice(source.index, 1)
    userIds.splice(destination.index, 0, movedUserId!)
    // dnd releases the row into whatever slot is rendered when onDragEnd returns, so the new
    // order has to be on screen by then or the row snaps back to where it started for a frame
    flushSync(() => {
      setIsDragging(false)
      reorder(userIds)
    })
  }

  const toggleAutoAssign = () => {
    updateFacilitatorRotation({
      variables: {meetingId, autoAssignFacilitator: !autoAssignFacilitator}
    })
  }

  return (
    <div className='flex flex-col px-2 pt-1.5 pb-2' ref={ref}>
      <div className='flex items-center justify-between px-1 pb-1.5'>
        <div className='font-bold text-fg-secondary text-xs uppercase tracking-wider'>
          {'Facilitator rotation'}
        </div>
        <button
          className='cursor-pointer text-fg-secondary hover:opacity-50 [&_svg]:size-4'
          onClick={onDone}
          aria-label={'Close'}
        >
          <Close />
        </button>
      </div>
      <DragDropContext
        sensors={sensors}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={onDragEnd}
      >
        <Droppable droppableId={FACILITATOR_ROTATION} isDropDisabled={!canReorder}>
          {(dropProvided) => (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              className='max-h-[216px] overflow-y-auto'
            >
              {facilitatorRotation.map((teamMember, idx) => {
                const {id: teamMemberId, userId, user} = teamMember
                const {preferredName, picture} = user
                const isFacilitator = userId === facilitatorUserId
                const isConnected = connectedUserIds.has(userId)
                const isNextUp =
                  advancesRotation && autoAssignFacilitator && userId === nextUpUserId
                const meta = isFacilitator ? 'Facilitating now' : isNextUp ? 'Next up' : null
                return (
                  <Draggable
                    key={teamMemberId}
                    draggableId={teamMemberId}
                    index={idx}
                    isDragDisabled={!canReorder}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={cn(
                          'flex h-9 items-center rounded-md px-1',
                          !isDragging && 'hover:bg-surface-hover',
                          dragSnapshot.isDragging && 'bg-surface-nav-active'
                        )}
                      >
                        <div
                          {...dragProvided.dragHandleProps}
                          className={cn(
                            'flex shrink-0 items-center justify-center overflow-hidden text-fg-muted transition-[width,margin] duration-200 [&_svg]:size-4 [&_svg]:shrink-0',
                            canReorder ? 'mr-1.5 w-4 cursor-grab' : 'mr-0 w-0'
                          )}
                        >
                          <DragIndicator />
                        </div>
                        <Avatar
                          className={cn(
                            'mr-1.5 size-6 shrink-0',
                            isFacilitator && 'ring-2 ring-jade-400',
                            !isConnected && 'opacity-40'
                          )}
                        >
                          <AvatarImage src={picture} alt='' />
                        </Avatar>
                        <div className={cn('min-w-0 flex-1', !isConnected && 'opacity-40')}>
                          <div className='truncate font-semibold text-[13px] text-fg-primary leading-4'>
                            {preferredName}
                          </div>
                          {meta && (
                            <div
                              className={cn(
                                'font-semibold text-[11px] leading-[14px]',
                                isFacilitator ? 'text-jade-600' : 'text-grape-600'
                              )}
                            >
                              {isFacilitator && (
                                <CheckCircle className='mr-1 inline-block size-3 align-[-1px]' />
                              )}
                              {meta}
                            </div>
                          )}
                        </div>
                        {!isReadOnly && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  'ml-1.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md disabled:cursor-default disabled:opacity-40 [&_svg]:size-4',
                                  isFacilitator
                                    ? 'text-fg-secondary hover:bg-surface-hover hover:text-fg-primary'
                                    : 'bg-lilac-100 text-grape-600 hover:bg-grape-600 hover:text-white'
                                )}
                                disabled={isFacilitator && randomCandidates.length === 0}
                                onClick={isFacilitator ? promoteRandom : () => promote(userId)}
                              >
                                {isFacilitator ? <Autorenew /> : <PlayArrow />}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side='left'>
                              {isFacilitator
                                ? 'Pick a random facilitator'
                                : `Make ${preferredName} the facilitator now`}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button
        role='switch'
        aria-checked={autoAssignFacilitator}
        onClick={toggleAutoAssign}
        disabled={isReadOnly}
        className='mt-1.5 flex w-full cursor-pointer items-center gap-2 border-hairline border-t px-1 pt-2 pb-1 text-left disabled:cursor-default disabled:opacity-50'
      >
        <span
          className={cn(
            'relative h-4.5 w-8 shrink-0 rounded-full transition-colors',
            autoAssignFacilitator ? 'bg-accent' : 'bg-hairline-field'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-3.5 rounded-full bg-white shadow transition-[left]',
              autoAssignFacilitator ? 'left-4' : 'left-0.5'
            )}
          />
        </span>
        <span className='text-fg-secondary text-xs leading-[15px]'>
          {'Auto-assign the next facilitator at meeting start'}
        </span>
      </button>
    </div>
  )
})

export default FacilitatorRotationPanel
