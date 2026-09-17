interface Props {
  answeredCount: number
  promptCount: number
  short?: boolean
}

const TeamPromptProgressPill = ({answeredCount, promptCount, short}: Props) => {
  const label = short
    ? `${answeredCount} of ${promptCount}`
    : promptCount === 1
      ? answeredCount === 1
        ? 'Answered'
        : 'Not answered'
      : `${answeredCount} of ${promptCount} answered`
  return (
    <span className='rounded-full bg-surface-well px-2.5 py-0.5 font-semibold text-fg-secondary text-xs'>
      {label}
    </span>
  )
}

export default TeamPromptProgressPill
