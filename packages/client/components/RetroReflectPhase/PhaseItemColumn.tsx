import graphql from 'babel-plugin-relay/macro'
import {type RefObject, useEffect, useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {PhaseItemColumn_prompt$key} from '~/__generated__/PhaseItemColumn_prompt.graphql'
import type {PhaseItemColumn_meeting$key} from '../../__generated__/PhaseItemColumn_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {MenuPosition} from '../../hooks/useCoords'
import useForceUpdate from '../../hooks/useForceUpdate'
import useTooltip from '../../hooks/useTooltip'
import SetPhaseFocusMutation from '../../mutations/SetPhaseFocusMutation'
import {cn} from '../../ui/cn'
import getNextSortOrder from '../../utils/getNextSortOrder'
import RetroPrompt from '../RetroPrompt'
import PhaseItemChits from './PhaseItemChits'
import PhaseItemEditor from './PhaseItemEditor'
import ReflectionStack from './ReflectionStack'

export interface ReflectColumnCardInFlight {
  key: string
  html: string
  transform: string
  isStart: boolean
}

interface Props {
  idx: number
  isDesktop: boolean
  meeting: PhaseItemColumn_meeting$key
  phaseRef: RefObject<HTMLDivElement>
  prompt: PhaseItemColumn_prompt$key
}

const PhaseItemColumn = (props: Props) => {
  const {idx, meeting: meetingRef, phaseRef, prompt: promptRef, isDesktop} = props
  const prompt = useFragment(
    graphql`
      fragment PhaseItemColumn_prompt on ReflectPrompt {
        id
        description
        editorIds
        groupColor
        question
      }
    `,
    promptRef
  )
  const meeting = useFragment(
    graphql`
      fragment PhaseItemColumn_meeting on RetrospectiveMeeting {
        ...ReflectionStack_meeting
        ...PhaseItemEditor_meeting
        facilitatorUserId
        id
        endedAt
        localPhase {
          id
          phaseType
          ... on ReflectPhase {
            focusedPromptId
          }
        }
        localStage {
          isComplete
        }
        phases {
          id
          phaseType
          stages {
            isComplete
          }
          ... on ReflectPhase {
            focusedPromptId
          }
        }
        reflectionGroups {
          id
          ...ReflectionGroup_reflectionGroup
          sortOrder
          reflections {
            ...ReflectionCard_reflection
            ...DraggableReflectionCard_reflection
            ...DraggableReflectionCard_staticReflections
            content
            id
            isEditing
            isViewerCreator
            promptId
            sortOrder
          }
        }
      }
    `,
    meetingRef
  )
  const {id: promptId, editorIds, question, groupColor, description} = prompt
  const {id: meetingId, facilitatorUserId, localPhase, phases, reflectionGroups, endedAt} = meeting
  const {id: phaseId, focusedPromptId} = localPhase
  const groupPhase = phases.find((phase) => phase.phaseType === 'group')!
  const {stages: groupStages} = groupPhase
  const [groupStage] = groupStages
  const {isComplete} = groupStage ?? {}

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const hasFocusedRef = useRef(false)
  const phaseEditorRef = useRef<HTMLDivElement>(null)
  const stackTopRef = useRef<HTMLDivElement>(null)
  const cardsInFlightRef = useRef<ReflectColumnCardInFlight[]>([])
  const forceUpdateColumn = useForceUpdate()
  const isFacilitator = viewerId === facilitatorUserId

  useEffect(() => {
    hasFocusedRef.current = true
  }, [focusedPromptId])

  const setColumnFocus = () => {
    if (!isFacilitator || isComplete) return
    const variables = {
      meetingId,
      focusedPromptId: focusedPromptId === promptId ? null : promptId
    }
    SetPhaseFocusMutation(atmosphere, variables, {phaseId})
  }

  const nextSortOrder = () => getNextSortOrder(reflectionGroups)

  const isFocused = focusedPromptId === promptId

  const columnStack = useMemo(() => {
    return reflectionGroups
      .slice()
      .sort((a, b) => (a.sortOrder > b.sortOrder ? -1 : 1))
      .flatMap(({reflections}) => reflections || [])
      .filter((reflection) => {
        return (
          reflection.promptId === promptId &&
          !cardsInFlightRef.current.find((card) => card.key === reflection.content)
        )
      })
  }, [reflectionGroups, promptId, cardsInFlightRef.current])

  const reflectionStack = useMemo(() => {
    return columnStack.filter(({isViewerCreator}) => isViewerCreator)
  }, [columnStack])

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER,
    {
      delay: 200,
      disabled: hasFocusedRef.current || isFocused || !isFacilitator || isComplete
    }
  )

  return (
    <div
      data-cy={`reflection-column-${question}`}
      className={cn(
        'flex flex-1 flex-col items-center justify-start',
        isDesktop ? 'mx-2 mb-4' : 'min-h-full'
      )}
    >
      <div
        className={cn(
          'relative flex w-full flex-1 shrink-0 flex-col overflow-hidden rounded-lg border border-hairline bg-surface-well p-3 transition-[background] duration-150 ease-out',
          isDesktop ? 'max-h-150' : 'h-full'
        )}
      >
        <div
          className={cn(
            'absolute top-5 mr-2 inline-block h-2 w-2 rounded-full align-middle shadow-[0_0_0_1px_var(--color-surface-app)] transition-all duration-300 ease-out',
            isFocused ? (isDesktop ? 'scale-[200]' : 'scale-[350]') : 'scale-100',
            isFocused ? 'opacity-35' : 'opacity-100'
          )}
          style={{backgroundColor: groupColor}}
        />
        {/* z-1: must be greater than the highlighted el */}
        <div
          className={cn(
            'z-1 mx-auto flex h-full w-74 flex-1 flex-col justify-between',
            isDesktop ? 'pb-1.5' : 'pb-1'
          )}
        >
          <div className='flex-1'>
            <div
              className={cn(
                'relative w-full select-none pb-3',
                isFacilitator && !isComplete && 'cursor-pointer'
              )}
              onClick={setColumnFocus}
            >
              <RetroPrompt onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={originRef}>
                <div className='relative mr-2 h-2 w-2' />
                {question}
              </RetroPrompt>
              {tooltipPortal(<div>Tap to highlight prompt for everybody</div>)}
              <div className='pl-4 font-normal text-fg-primary text-xs italic leading-4'>
                {description}
              </div>
            </div>
            <div className='mb-3' data-cy={`editor-section-${question}`}>
              <div data-cy={`editor-status-${question}`} className={cn(isComplete && 'invisible')}>
                <PhaseItemEditor
                  cardsInFlightRef={cardsInFlightRef}
                  dataCy={`phase-item-editor-${question}`}
                  phaseEditorRef={phaseEditorRef}
                  meetingId={meetingId}
                  nextSortOrder={nextSortOrder}
                  forceUpdateColumn={forceUpdateColumn}
                  promptId={promptId}
                  stackTopRef={stackTopRef}
                  readOnly={!!endedAt}
                  meetingRef={meeting}
                />
              </div>
            </div>
          </div>
          <div className='flex-1'>
            <ReflectionStack
              dataCy={`reflection-stack-${question}`}
              reflectionStack={reflectionStack}
              idx={idx}
              phaseEditorRef={phaseEditorRef}
              phaseRef={phaseRef}
              meeting={meeting}
              stackTopRef={stackTopRef}
            />
          </div>
          <PhaseItemChits
            count={columnStack.length - reflectionStack.length}
            editorCount={editorIds ? editorIds.length : 0}
          />
        </div>
      </div>
    </div>
  )
}

export default PhaseItemColumn
