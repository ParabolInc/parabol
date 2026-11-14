interface Props {
  isComplete: boolean
}

const PhaseCompleteTag = (props: Props) => {
  const {isComplete} = props
  if (!isComplete) return null
  return (
    <div className='mb-2 flex max-h-7 items-center rounded bg-slate-600 px-4 py-1 font-semibold text-sm text-white'>
      Phase Completed
    </div>
  )
}

export default PhaseCompleteTag
