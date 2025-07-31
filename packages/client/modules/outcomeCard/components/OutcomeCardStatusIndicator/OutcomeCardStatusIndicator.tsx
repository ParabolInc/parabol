import {cn} from '../../../../ui/cn'

const taskStatusColors = {
  done: 'bg-grape-600',
  active: 'bg-jade-400',
  stuck: 'bg-tomato-500',
  future: 'bg-aqua-400',
  archived: 'bg-slate-500',
  private: 'bg-gold-300'
} as const

interface Props {
  status: keyof typeof taskStatusColors
  className?: string
}
const OutcomeCardStatusIndicator = (props: Props) => {
  const {className, status} = props
  return (
    <div
      className={cn('mr-1 h-1 w-8 rounded-sm bg-gold', taskStatusColors[status], className)}
    ></div>
  )
}

export default OutcomeCardStatusIndicator
