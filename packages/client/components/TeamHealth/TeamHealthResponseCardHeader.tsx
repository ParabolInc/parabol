import {MonitorHeart} from '~/ui/icons'
import {cn} from '../../ui/cn'
import {getTeamHealthCategoryColor} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'

interface Props {
  categoryId: string
  categoryName: string
  // globally-ordered category ids that drive each category's color (see getTeamHealthCategoryColor)
  orderedCategoryIds: ReadonlyArray<string>
  // zero-based index of this stage within the response phase
  stageIndex: number
  // total number of response stages
  stageCount: number
}

const TeamHealthResponseCardHeader = (props: Props) => {
  const {categoryId, categoryName, orderedCategoryIds, stageIndex, stageCount} = props
  return (
    <div className='flex items-center justify-between'>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold',
          getTeamHealthCategoryColor(categoryId, orderedCategoryIds)
        )}
      >
        <MonitorHeart className='size-5' />
        <span>{categoryName}</span>
      </div>
      <div className='flex items-center gap-3'>
        <div className='flex gap-1'>
          {Array.from({length: stageCount}).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                // grape-700 disappears into the dark card (grape-750), so dark lightens the fill
                'h-1.5 w-4 rounded-full',
                idx <= stageIndex ? 'bg-grape-700 dark:bg-grape-200' : 'bg-surface-well'
              )}
            />
          ))}
        </div>
        <span className='font-semibold text-fg-muted text-sm'>
          {stageIndex + 1} of {stageCount}
        </span>
      </div>
    </div>
  )
}

export default TeamHealthResponseCardHeader
