interface Props {
  question: string
  groupColor: string
}

const InspirationDestinationChip = (props: Props) => {
  const {question, groupColor} = props
  return (
    <div className='flex w-max max-w-full items-center gap-1.5 rounded-full bg-surface-well px-2.5 py-0.5 font-semibold text-[11px] text-fg-secondary'>
      <span className='h-[7px] w-[7px] shrink-0 rounded-full' style={{background: groupColor}} />
      <span className='truncate'>{question}</span>
    </div>
  )
}

export default InspirationDestinationChip
