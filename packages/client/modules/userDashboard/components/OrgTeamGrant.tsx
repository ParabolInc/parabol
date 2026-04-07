import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import {cn} from '../../../ui/cn'
import {RadioGroup, RadioGroupItem} from '../../../ui/RadioGroup/RadioGroup'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'

export interface Org {
  readonly id: string
  readonly name: string
  readonly teams: ReadonlyArray<{readonly id: string; readonly name: string}>
}

interface Props {
  orgs: ReadonlyArray<Org>
  enabled: boolean
  orgGrantMode: 'all' | 'custom'
  setOrgGrantMode: (mode: 'all' | 'custom') => void
  selectedOrgIds: Set<string>
  selectedTeamIds: Set<string>
  expandedOrgIds: Set<string>
  toggleOrg: (org: Org) => void
  toggleTeam: (teamId: string, org: Org) => void
  toggleExpandOrg: (orgId: string) => void
}

export const OrgTeamGrant = ({
  orgs,
  enabled,
  orgGrantMode,
  setOrgGrantMode,
  selectedOrgIds,
  selectedTeamIds,
  expandedOrgIds,
  toggleOrg,
  toggleTeam,
  toggleExpandOrg
}: Props) => {
  return (
    <Tooltip>
      <div className={cn('flex flex-col gap-2', !enabled && 'pointer-events-none opacity-40')}>
        <div className='flex items-center gap-2'>
          {!enabled && (
            <TooltipTrigger asChild>
              <InfoOutlinedIcon className='cursor-default text-slate-400' style={{fontSize: 16}} />
            </TooltipTrigger>
          )}
          <span className='font-medium text-slate-700 text-sm'>Organizations & Teams</span>
          <RadioGroup
            value={orgGrantMode}
            onValueChange={(v) => setOrgGrantMode(v as 'all' | 'custom')}
            className='flex flex-row gap-3'
          >
            <label className='flex cursor-pointer select-none items-center gap-1 text-slate-600 text-xs'>
              <RadioGroupItem value='all' />
              All
            </label>
            <label className='flex cursor-pointer select-none items-center gap-1 text-slate-600 text-xs'>
              <RadioGroupItem value='custom' />
              Custom
            </label>
          </RadioGroup>
        </div>
        {orgGrantMode === 'custom' && (
          <div className='rounded-md border border-slate-200'>
            {orgs.length === 0 ? (
              <p className='p-3 text-slate-500 text-sm'>No organizations found</p>
            ) : (
              orgs.map((org) => {
                const isExpanded = expandedOrgIds.has(org.id)
                const isOrgChecked = selectedOrgIds.has(org.id)
                const someTeamsSelected = org.teams.some((t) => selectedTeamIds.has(t.id))
                const isIndeterminate = !isOrgChecked && someTeamsSelected
                return (
                  <div key={org.id} className='border-slate-100 border-b last:border-0'>
                    <div className='flex items-center gap-2 px-3 py-2'>
                      <label className='flex flex-1 cursor-pointer select-none items-center gap-2'>
                        <Checkbox
                          checked={isIndeterminate ? 'indeterminate' : isOrgChecked}
                          onCheckedChange={() => toggleOrg(org)}
                        />
                        <span className='font-medium text-slate-700 text-sm'>{org.name}</span>
                      </label>
                      {org.teams.length > 0 && (
                        <button
                          onClick={() => toggleExpandOrg(org.id)}
                          className='cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100'
                        >
                          <ExpandMoreIcon
                            fontSize='small'
                            className={cn('transition-transform', isExpanded && 'rotate-180')}
                          />
                        </button>
                      )}
                    </div>
                    {isExpanded && org.teams.length > 0 && (
                      <div className='border-slate-100 border-t bg-slate-50'>
                        {org.teams.map((team) => (
                          <label
                            key={team.id}
                            className='flex cursor-pointer select-none items-center gap-2 py-1.5 pr-3 pl-8'
                          >
                            <Checkbox
                              checked={selectedTeamIds.has(team.id)}
                              onCheckedChange={() => toggleTeam(team.id, org)}
                            />
                            <span className='text-slate-600 text-sm'>{team.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
      {!enabled && (
        <TooltipContent>
          Select a Teams or Organizations scope to restrict by org/team
        </TooltipContent>
      )}
    </Tooltip>
  )
}
