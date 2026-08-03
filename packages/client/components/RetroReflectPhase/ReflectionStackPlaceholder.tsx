import {forwardRef, type Ref} from 'react'

interface Props {
  idx: number
}

const placeholders = [
  'Your anonymous reflections end up here',
  'Have fun with it, press : to add an emoji',
  'Your team activity is shown in the mini card grid below',
  'Collapse the sidebar if you need more room to work',
  'A highlighted column means your facilitator wants you to focus on that area',
  'Click the ? in the bottom bar for more tips'
]

const seed = Math.floor(Math.random() * placeholders.length)
const ReflectionStackPlaceholder = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {idx} = props
  const tip = placeholders[(seed + idx) % placeholders.length]
  return (
    // min-[704px] = Breakpoint.SINGLE_REFLECTION_COLUMN; mb-6 there matches Reflection Stack
    <div
      ref={ref}
      className='mb-3 flex w-74 items-center justify-center rounded border border-hairline-strong border-dashed min-[704px]:mb-6 min-[704px]:min-h-26'
    >
      <div className='select-none p-4 text-center text-[13px] text-fg-secondary'>{tip}</div>
    </div>
  )
})

export default ReflectionStackPlaceholder
