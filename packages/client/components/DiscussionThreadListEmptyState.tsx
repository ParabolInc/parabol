import EmptyDiscussionIllustration from '../../../static/images/illustrations/discussions.png'

interface Props {
  isReadOnly?: boolean
  allowTasks: boolean
}

const getMessage = (allowTasks: boolean, isReadOnly: boolean) => {
  if (isReadOnly) {
    return allowTasks ? 'No comments or tasks were added here' : 'No comments were added here'
  }
  return allowTasks
    ? 'Start the conversation or add takeaway task cards to capture next steps.'
    : 'Start the conversation to capture next steps.'
}

const DiscussionThreadListEmptyState = (props: Props) => {
  const {isReadOnly, allowTasks} = props
  const message = getMessage(allowTasks, !!isReadOnly)

  return (
    <div className='m-auto flex min-h-0 flex-col px-6 py-3'>
      <div className='mx-auto my-[14px] w-40 text-center min-[380px]:w-[260px]'>
        <img
          className='h-auto w-4/5 dark:brightness-[.94]'
          alt=''
          src={EmptyDiscussionIllustration}
        />
      </div>
      <div className='text-center text-fg-secondary text-sm leading-5'>{message}</div>
    </div>
  )
}

export default DiscussionThreadListEmptyState
