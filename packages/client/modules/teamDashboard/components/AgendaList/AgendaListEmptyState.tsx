interface Props {
  isComplete: boolean
  isMeeting: boolean
}

const AgendaListEmptyState = (props: Props) => {
  const {isComplete, isMeeting} = props
  const meetingContext = isMeeting ? 'meeting' : 'next meeting'

  if (isComplete) return null
  return (
    <div className='flex items-start pt-2 pr-2 pb-0 pl-14'>
      <div className='flex-1 pt-1 font-normal text-[13px] text-fg-secondary leading-[20px]'>
        {`Pssst. Add topics for your ${meetingContext}! Use a phrase like “`}
        <b>
          <i>{'upcoming vacation'}</i>
        </b>
        {'.”'}
      </div>
    </div>
  )
}

export default AgendaListEmptyState
