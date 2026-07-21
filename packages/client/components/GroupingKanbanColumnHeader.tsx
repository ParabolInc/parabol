import {Add, UnfoldLess, UnfoldMore} from '@mui/icons-material'
import type {MouseEvent} from 'react'
import useBreakpoint from '~/hooks/useBreakpoint'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
import {Breakpoint} from '~/types/constEnums'
import FlatButton from './FlatButton'
import RetroPrompt from './RetroPrompt'

const addReflectionButtonClass = 'h-6 w-6 border-0 p-0 leading-6'

interface Props {
  canAdd: boolean
  groupColor: string
  isWidthExpanded: boolean
  onClick: () => void
  phaseType: string | null | undefined
  question: string
  submitting: boolean
  toggleWidth: (e: MouseEvent<Element>) => void
}

const GroupingKanbanColumnHeader = (props: Props) => {
  const {
    canAdd,
    groupColor,
    isWidthExpanded,
    onClick,
    question,
    phaseType,
    submitting,
    toggleWidth
  } = props
  const {
    tooltipPortal: addReflectionPortal,
    openTooltip: openReflectionTooltip,
    closeTooltip: closeReflectionTooltip,
    originRef: addReflectionRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_CENTER)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
  const handleClick = () => {
    onClick()
    closeReflectionTooltip()
  }

  return (
    <div className='w-full'>
      <div className='mx-auto flex w-full justify-between px-3 pt-3 pb-0 text-fg-primary leading-6'>
        <RetroPrompt className='mr-2 flex items-center'>
          <div
            className='mr-2 h-2 min-w-2 rounded-full shadow-[0_0_0_1px_var(--color-surface-app)]'
            style={{backgroundColor: groupColor}}
          />
          {question}
        </RetroPrompt>
        <div className='flex items-start'>
          {phaseType === 'group' && (
            <FlatButton
              className={addReflectionButtonClass}
              dataCy={`add-reflection-${question}`}
              aria-label={'Add a reflection'}
              disabled={!canAdd}
              onClick={handleClick}
              onMouseEnter={openReflectionTooltip}
              onMouseLeave={closeReflectionTooltip}
              ref={addReflectionRef}
              waiting={submitting}
            >
              <Add />
            </FlatButton>
          )}
          {addReflectionPortal(<div>Add new reflection</div>)}
          {isDesktop && (
            <>
              <FlatButton
                className={`${addReflectionButtonClass} ml-1`}
                onClick={toggleWidth}
                onMouseEnter={openTooltip}
                onMouseLeave={closeTooltip}
                ref={originRef}
              >
                <div className='flex h-6 w-6 rotate-45 items-center justify-center'>
                  {isWidthExpanded ? <UnfoldLess /> : <UnfoldMore />}
                </div>
              </FlatButton>
              {tooltipPortal(<div>{`${isWidthExpanded ? 'Minimise' : 'Expand'}`}</div>)}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupingKanbanColumnHeader
