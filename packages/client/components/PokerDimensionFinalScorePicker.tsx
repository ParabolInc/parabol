import graphql from 'babel-plugin-relay/macro'
import type {RefObject} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {Button} from '~/ui/Button/Button'
import type {PokerDimensionFinalScorePicker_stage$key} from '../__generated__/PokerDimensionFinalScorePicker_stage.graphql'
import {getClientIntegration} from '../integrations/platform/registry'
import EstimateFieldDropdown from './EstimateFieldDropdown'

interface Props {
  canUpdate: boolean
  clearError: () => void
  isFacilitator: boolean
  stageRef: PokerDimensionFinalScorePicker_stage$key
  error?: string | null
  submitScore: () => void
  inputRef: RefObject<HTMLInputElement>
}

const PokerDimensionFinalScorePicker = (props: Props) => {
  const {inputRef, isFacilitator, canUpdate, error, stageRef, clearError, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment PokerDimensionFinalScorePicker_stage on EstimateStage {
        ...EstimateFieldDropdown_stage
        task {
          integration {
            service
          }
        }
      }
    `,
    stageRef
  )

  const service = stage.task?.integration?.service
  const title = service ? getClientIntegration(service)?.title : undefined
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
          <div className='flex items-center'>
            {isDesktop ? (
              <div className='flex px-2 font-semibold text-sm'>{`${title} Label: `}</div>
            ) : (
              <div className='flex pr-1 font-semibold text-sm'>Label:</div>
            )}

            <EstimateFieldDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PokerDimensionFinalScorePicker
