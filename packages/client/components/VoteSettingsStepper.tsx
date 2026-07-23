import {Add, Remove} from '@mui/icons-material'
import {MeetingSettingsThreshold} from '~/types/constEnums'
import {cn} from '../ui/cn'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  increase(): void
  decrease(): void
  value: number
  'aria-label'?: string
}

const getStepperClass = (isDisabled: boolean) =>
  cn(
    'h-6 w-6 rounded-md p-0.75 shadow-[0px_1px_1px_1px_rgba(0,0,0,0.3)]',
    isDisabled && 'opacity-35'
  )

const VoteStepper = (props: Props) => {
  const {increase, decrease, value} = props
  const canDecrease = value > 1
  const canIncrease = value < MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_MAX

  return (
    <div className='flex items-center pl-4'>
      <PlainButton
        className={getStepperClass(!canDecrease)}
        aria-label={'Decrease'}
        onClick={decrease}
      >
        <Remove className='h-4.5 w-4.5' />
      </PlainButton>
      <span className='flex w-8.5 justify-center text-fg-primary' aria-label={props['aria-label']}>
        {value}
      </span>
      <PlainButton
        className={getStepperClass(!canIncrease)}
        aria-label={'Increase'}
        onClick={increase}
      >
        <Add className='h-4.5 w-4.5' />
      </PlainButton>
    </div>
  )
}

export default VoteStepper
