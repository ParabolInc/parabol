import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {type Dispatch, type MutableRefObject, type SetStateAction, useRef} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import type {PokerDimensionValueControl_stage$key} from '../__generated__/PokerDimensionValueControl_stage.graphql'
import useResizeFontForElement from '../hooks/useResizeFontForElement'
import {Button} from '../ui/Button/Button'
import {cn} from '../ui/cn'
import MiniPokerCard from './MiniPokerCard'
import PokerDimensionFinalScorePicker from './PokerDimensionFinalScorePicker'
import StyledError from './StyledError'

const linkButtonClassName =
  'bg-transparent p-0 text-[14px] text-fg-primary leading-5 shadow-none hover:text-accent focus:text-accent active:text-accent ml-2 h-10 px-2 py-0 font-semibold text-accent hover:text-sky-600 focus:text-sky-600 active:text-sky-600'

interface Props {
  isFacilitator: boolean
  placeholder: string
  stage: PokerDimensionValueControl_stage$key
  error?: {message: string | null}
  onCompleted: () => void
  onError: (error: Error) => void
  onSubmitScore: () => void
  isStale: boolean
  isLocallyValidatedRef: MutableRefObject<boolean>
  setCardScore: Dispatch<SetStateAction<string>>
  cardScore: string
}

const PokerDimensionValueControl = (props: Props) => {
  const {
    isFacilitator,
    placeholder,
    stage: stageRef,
    onSubmitScore,
    error,
    onCompleted,
    onError,
    isStale,
    isLocallyValidatedRef,
    setCardScore,
    cardScore
  } = props
  const stage = useFragment(
    graphql`
      fragment PokerDimensionValueControl_stage on EstimateStage {
        ...PokerDimensionFinalScorePicker_stage
        id
        meetingId
        teamId
        finalScore
        serviceField {
          name
          type
        }
        taskId
        task {
          integration {
            __typename
          }
        }
        dimensionRef {
          name
          scale {
            values {
              label
              color
            }
          }
        }
      }
    `,
    stageRef
  )
  const {dimensionRef, serviceField, task} = stage
  const finalScore = stage.finalScore || ''
  const {type: serviceFieldType} = serviceField
  const {scale} = dimensionRef
  const {values: scaleValues} = scale
  const inputRef = useRef<HTMLInputElement>(null)
  const errorStr = error?.message ?? ''

  useResizeFontForElement(inputRef, cardScore, 12, 18)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    if (serviceFieldType === 'number') {
      // isNaN says "3." is a number, so we stringify the parsed number & see if it matches
      if (String(parseFloat(value)) !== value) {
        // the service wants a number but we didn't get one
        onError(new Error('The field selected only accepts numbers'))
        isLocallyValidatedRef.current = false
      } else {
        isLocallyValidatedRef.current = true
        onCompleted()
      }
    } else {
      isLocallyValidatedRef.current = true
    }
    setCardScore(value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // keydown required because escape doesn't fire onKeyPress
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault()
      onSubmitScore()
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setCardScore(finalScore)
      inputRef.current?.blur()
      isLocallyValidatedRef.current = true
    }
  }

  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const matchingScale = scaleValues.find((scaleValue) => scaleValue.label === cardScore)
  const scaleColor = matchingScale?.color
  const isFinal = !!finalScore && cardScore === finalScore
  const hasIntegration = !!task?.integration?.__typename
  const handleLabelClick = () => inputRef.current!.focus()
  const label = isDesktop && !finalScore ? 'Final Score (set by facilitator)' : 'Final Score'
  return (
    <div className='px-2'>
      <div className='flex items-center rounded bg-surface-card p-2'>
        <MiniPokerCard canEdit={isFacilitator} color={scaleColor} isFinal={isFinal}>
          <input
            className={cn(
              'block w-full border-0 bg-transparent p-0 text-center font-semibold text-[18px] leading-6 outline-0 placeholder:text-fg-muted',
              scaleColor ? 'text-white' : 'text-fg-primary'
            )}
            disabled={!isFacilitator}
            onKeyDown={onKeyDown}
            autoFocus={!finalScore}
            ref={inputRef}
            onChange={onChange}
            placeholder={placeholder}
            value={cardScore}
            maxLength={3}
          />
        </MiniPokerCard>
        {!isFacilitator && <div className='ml-4 shrink-0 font-semibold text-[14px]'>{label}</div>}

        {hasIntegration && (
          <PokerDimensionFinalScorePicker
            canUpdate={isStale}
            stageRef={stage}
            error={errorStr}
            submitScore={onSubmitScore}
            clearError={onCompleted}
            inputRef={inputRef}
            isFacilitator={isFacilitator}
          />
        )}

        {!hasIntegration && isFacilitator && (
          <>
            {isStale ? (
              <>
                <Button size='default' className={linkButtonClassName} onClick={onSubmitScore}>
                  {'Update'}
                </Button>
                {errorStr && <StyledError className='pl-2 text-left'>{errorStr}</StyledError>}
              </>
            ) : (
              <Button size='default' className={linkButtonClassName} onClick={handleLabelClick}>
                {'Edit Score'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PokerDimensionValueControl
