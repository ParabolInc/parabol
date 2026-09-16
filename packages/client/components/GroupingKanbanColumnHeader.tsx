import type {MouseEvent} from 'react'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {Button} from '~/ui/Button/Button'
import {Add, UnfoldLess, UnfoldMore} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
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
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)

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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='flat'
                  size='sm'
                  className={addReflectionButtonClass}
                  data-cy={`add-reflection-${question}`}
                  aria-label={'Add a reflection'}
                  disabled={!canAdd || submitting}
                  onClick={onClick}
                >
                  <Add />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom'>Add new reflection</TooltipContent>
            </Tooltip>
          )}
          {isDesktop && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='flat'
                  size='sm'
                  className={`${addReflectionButtonClass} ml-1`}
                  onClick={toggleWidth}
                >
                  <div className='flex h-6 w-6 rotate-45 items-center justify-center'>
                    {isWidthExpanded ? <UnfoldLess /> : <UnfoldMore />}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                {isWidthExpanded ? 'Minimise' : 'Expand'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupingKanbanColumnHeader
