import {Edit} from '../../../ui/icons'

interface Props {
  largestCategorySize: number
  // absent when the viewer can't edit this template
  onEdit?: () => void
}

const TeamHealthMeetingPreviewFooter = (props: Props) => {
  const {largestCategorySize, onEdit} = props
  return (
    <div className='mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs'>
      <p className='text-fg-muted'>
        {largestCategorySize > 1
          ? `Questions rotate every ${largestCategorySize} meetings`
          : 'Every meeting asks these same questions.'}
      </p>
      {onEdit && (
        <button
          type='button'
          onClick={onEdit}
          className='flex cursor-pointer items-center gap-1 font-semibold text-accent hover:underline'
        >
          <Edit className='size-3.5' />
          Edit question bank
        </button>
      )}
    </div>
  )
}

export default TeamHealthMeetingPreviewFooter
