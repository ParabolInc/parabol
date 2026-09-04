import {cn} from '../../ui/cn'
import {getTeamHealthCategoryDotColor} from '../ActivityLibrary/TeamHealth/getTeamHealthCategoryColor'
import {formatTeamHealthScore} from './formatTeamHealthScore'
import TeamHealthCategorySparkline from './TeamHealthCategorySparkline'
import TeamHealthScoreDelta from './TeamHealthScoreDelta'

export interface CategoryTrendRow {
  categoryId: string
  categoryName: string
  meanScore: number
  meanScoreDelta: number | null | undefined
  // this category's mean in each recent cycle, oldest first
  points: ReadonlyArray<{meetingId: string; name: string; score: number}>
}

interface Props {
  rows: ReadonlyArray<CategoryTrendRow>
  orderedCategoryIds: ReadonlyArray<string>
  className?: string
}

// The questions rotate, the categories don't, which is why history is reported here and not on the
// question cards: a bar for "Dependability" three cycles ago is comparable to today's, while the
// question that produced it probably isn't the same one.
const TeamHealthCategoryTrend = (props: Props) => {
  const {rows, orderedCategoryIds, className} = props

  return (
    <div className={cn('rounded-2xl bg-surface-card p-6 shadow-card', className)}>
      <h2 className='font-bold text-fg-primary text-xl'>How the team is trending</h2>
      <p className='mt-1 text-fg-muted text-sm'>
        Each category this cycle, against the cycles before it.
      </p>
      <div className='mt-5 flex flex-col gap-3'>
        {rows.map((row) => (
          <div key={row.categoryId} className='flex items-center gap-4'>
            <div className='flex w-44 shrink-0 items-center gap-2'>
              <span
                className={cn(
                  'size-2.5 shrink-0 rounded-full',
                  getTeamHealthCategoryDotColor(row.categoryId, orderedCategoryIds)
                )}
              />
              <span className='truncate font-semibold text-fg-primary' title={row.categoryName}>
                {row.categoryName}
              </span>
            </div>
            <div className='flex w-24 shrink-0 items-baseline justify-end gap-1.5'>
              <span className='font-bold text-fg-primary text-xl'>
                {formatTeamHealthScore(row.meanScore)}
              </span>
              <TeamHealthScoreDelta delta={row.meanScoreDelta} />
            </div>
            <TeamHealthCategorySparkline
              className='min-w-0 flex-1'
              points={row.points}
              barClassName={getTeamHealthCategoryDotColor(row.categoryId, orderedCategoryIds)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamHealthCategoryTrend
