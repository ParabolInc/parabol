import Ellipsis from './Ellipsis/Ellipsis'

interface Props {
  commentorNames: string[] | null
}

const getStatusText = (preferredNames: string[]) => {
  if (preferredNames && preferredNames.length === 1) {
    return `${preferredNames[0]} is typing`
  } else if (preferredNames && preferredNames.length === 2) {
    return `${preferredNames[0]} and ${preferredNames[1]} are typing`
  } else return `Several people are typing`
}

const CommentingStatusText = (props: Props) => {
  const {commentorNames} = props

  if (!commentorNames?.length) return null

  return (
    <div className='flex h-9 w-full items-center pt-2 pl-12 text-fg-secondary text-xs leading-5'>
      {getStatusText(commentorNames)}
      <Ellipsis />
    </div>
  )
}

export default CommentingStatusText
