import graphql from 'babel-plugin-relay/macro'
import {type RefObject, Suspense} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {Button} from '~/ui/Button/Button'
import type {PokerDimensionFinalScorePicker_stage$key} from '../__generated__/PokerDimensionFinalScorePicker_stage.graphql'
import {
  getClientIntegration,
  isRegisteredClientIntegration
} from '../integrations/platform/registry'
import EstimateFieldDropdown, {type ServiceFieldSummary} from './EstimateFieldDropdown'

interface Props {
  canUpdate: boolean
  clearError: () => void
  isFacilitator: boolean
  stageRef: PokerDimensionFinalScorePicker_stage$key
  error?: string | null
  submitScore: () => void
  inputRef: RefObject<HTMLInputElement | null>
  onServiceFieldChange: (serviceField: ServiceFieldSummary) => void
}

const PokerDimensionFinalScorePicker = (props: Props) => {
  const {
    inputRef,
    isFacilitator,
    canUpdate,
    error,
    stageRef,
    clearError,
    submitScore,
    onServiceFieldChange
  } = props
  const stage = useFragment(
    graphql`
      fragment PokerDimensionFinalScorePicker_stage on EstimateStage {
        ...EstimateFieldDropdown_stage @defer
        task {
          taskService
        }
      }
    `,
    stageRef
  )

  const service = stage.task?.taskService ?? null
  const title =
    service && isRegisteredClientIntegration(service)
      ? getClientIntegration(service).title
      : undefined
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const focusInput = () => inputRef.current!.focus()
  return (
    <div className='flex w-full select-none flex-wrap items-center'>
      {isFacilitator ? (
        canUpdate ? (
          <Button
            size='default'
            className='ml-2 bg-transparent p-0 text-[14px] text-sky-500 leading-5 shadow-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
            onClick={submitScore}
            style={{fontSize: 12, fontWeight: 600}}
          >
            Update
          </Button>
        ) : (
          <Button
            size='default'
            className='ml-2 bg-transparent p-0 text-[14px] text-sky-500 leading-5 shadow-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
            onClick={focusInput}
            style={{fontSize: 12, fontWeight: 600}}
          >
            Edit Score
          </Button>
        )
      ) : null}
      <div className={`flex flex-1 justify-end ${isDesktop ? '' : 'flex-col-reverse items-end'}`}>
        {error && (
          <div
            className={`text-fg-error ${isDesktop ? 'pl-2 text-left font-semibold text-sm' : 'pt-2 text-right font-normal text-xs'}`}
          >
            {error}
          </div>
        )}
        {title && (
          <Suspense
            fallback={<div className='h-3 w-32 animate-pulse rounded-sm bg-surface-well' />}
          >
            <EstimateFieldDropdown
              title={title}
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
              onServiceFieldChange={onServiceFieldChange}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default PokerDimensionFinalScorePicker
