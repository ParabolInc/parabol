import {cn} from '../../../../ui/cn'
import plural from '../../../../utils/plural'
import type {TeamStructureLevelData} from './teamStructureEdits'
import {toTeamStructureRollup} from './teamStructureRollup'

interface Props {
  orgName: string
  levels: readonly TeamStructureLevelData[]
  teamIds: readonly string[]
}

const DEPTH_PADDING = ['pl-0', 'pl-5', 'pl-10']

const OrgTeamRollup = ({orgName, levels, teamIds}: Props) => {
  const rows = toTeamStructureRollup(orgName, levels, teamIds)
  return (
    <section className='flex flex-col gap-2.5 rounded-md border border-hairline bg-surface-card px-5 py-4 shadow-xs'>
      <div>
        <h2 className='m-0 font-semibold text-base'>How reports will roll up</h2>
        <p className='m-0 text-[13px] text-fg-secondary'>
          {levels
            .slice(0, 2)
            .map(({name}) => name)
            .join(', then ')}
        </p>
      </div>
      <ul className='m-0 flex list-none flex-col p-0'>
        {rows.map(({key, depth, name, teamCount, isNotSet}) => (
          <li
            key={key}
            className={cn(
              'flex min-h-8 items-center gap-2 text-sm',
              DEPTH_PADDING[depth],
              depth === 1 && 'border-hairline border-t'
            )}
          >
            <span
              className={cn(
                'min-w-0 flex-1 truncate',
                depth < 2 && 'font-semibold',
                isNotSet && 'text-fg-muted'
              )}
            >
              {name}
            </span>
            <span className='whitespace-nowrap text-[13px] text-fg-secondary tabular-nums'>
              {teamCount} {plural(teamCount, 'team')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default OrgTeamRollup
