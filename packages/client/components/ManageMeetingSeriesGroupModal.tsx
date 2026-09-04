/**
 * Manage group modal for a Meeting Series Group (design 2a).
 *
 * Drop-in location: packages/client/components/ManageMeetingSeriesGroupModal.tsx
 *
 * Presentational + local state only; ManageMeetingSeriesGroupModalRoot supplies the data and
 * runs the mutations. Rendered from MeetingSeriesGroupCard's menu ("Manage group…").
 */
import {useMemo, useState} from 'react'
import {Link as LinkIcon, PlayArrow as PlayArrowIcon, Search as SearchIcon} from '~/ui/icons'
import {initials} from '../shared/initials'
import {Button} from '../ui/Button/Button'
import {Checkbox} from '../ui/Checkbox/Checkbox'
import {cn} from '../ui/cn'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogActions} from '../ui/Dialog/DialogActions'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import getSafeRegex from '../utils/getSafeRegex'

export interface ManageGroupTeam {
  id: string
  name: string
  /** the viewer is a member of this team, so they may enter the meeting */
  isViewerOnTeam: boolean
  /** this team currently has an active series in the group */
  inSeries: boolean
  /** set when a meeting for this team is joinable */
  meetingId?: string | null
  /** the team's MeetingSeries in this group, when it has one */
  seriesId?: string | null
  /** used to build the meeting-series permalink */
  urlSlug?: string | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  seriesTitle: string
  /** e.g. "every 2 weeks on Monday at 9:00 AM" */
  scheduleLabel: string
  orgName: string
  teams: readonly ManageGroupTeam[]
  onSave: (teamIdsInSeries: string[]) => void
  onEnterMeeting: (team: ManageGroupTeam) => void
  onCopyPermalink: (team: ManageGroupTeam) => void | Promise<void>
}

export const ManageMeetingSeriesGroupModal = (props: Props) => {
  const {
    isOpen,
    onClose,
    seriesTitle,
    scheduleLabel,
    orgName,
    teams,
    onSave,
    onEnterMeeting,
    onCopyPermalink
  } = props
  const [search, setSearch] = useState('')
  const [nextInSeries, setNextInSeries] = useState<Record<string, boolean> | null>(null)

  const isInSeries = (team: ManageGroupTeam) => nextInSeries?.[team.id] ?? team.inSeries
  const inSeriesCount = teams.filter(isInSeries).length
  const allChecked = inSeriesCount === teams.length
  const headerChecked = allChecked ? true : inSeriesCount > 0 ? 'indeterminate' : false

  const filteredTeams = useMemo(() => {
    if (!search) return teams
    const regex = getSafeRegex(search, 'i')
    return teams.filter(({name}) => name.match(regex))
  }, [teams, search])

  const toggleTeam = (team: ManageGroupTeam) => {
    const current = isInSeries(team)
    setNextInSeries((prev) => {
      const base = prev ?? Object.fromEntries(teams.map((t) => [t.id, t.inSeries]))
      return {...base, [team.id]: !current}
    })
  }

  const toggleAll = () => {
    setNextInSeries(Object.fromEntries(teams.map((t) => [t.id, !allChecked])))
  }

  const onConfirm = () => {
    onSave(teams.filter(isInSeries).map((t) => t.id))
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='md:max-w-2xl'>
        <DialogTitle className='mb-1'>Manage Meeting Series Group</DialogTitle>
        <p className='mb-4 text-fg-secondary text-sm'>
          {seriesTitle} • {scheduleLabel}
        </p>

        <div className='mb-3 flex h-9 items-center gap-2 rounded-md border border-hairline-field border-solid px-2.5 text-fg-secondary'>
          <SearchIcon className='text-[18px]' />
          <input
            className='w-full border-0 bg-transparent font-sans text-fg-primary text-sm outline-none'
            placeholder={`Filter teams in ${orgName}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className='grid grid-cols-[36px_1fr_220px] items-center gap-3 border-hairline border-y border-solid bg-surface-raised px-2 py-2 font-semibold text-[11px] text-fg-muted uppercase tracking-[0.08em]'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Checkbox
                className='size-5'
                checked={headerChecked}
                onCheckedChange={toggleAll}
                aria-label={
                  allChecked ? 'Remove every team from the series' : 'Add every team to the series'
                }
              />
            </TooltipTrigger>
            <TooltipContent>
              {allChecked ? 'Remove every team from the series' : 'Add every team to the series'}
            </TooltipContent>
          </Tooltip>
          <div>Team</div>
          <div className='text-right'>Meeting</div>
        </div>

        <div className='max-h-[420px] overflow-auto'>
          {filteredTeams.map((team) => {
            const checked = isInSeries(team)
            const canEnter = checked && team.isViewerOnTeam
            return (
              <div
                key={team.id}
                className='grid h-12 grid-cols-[36px_1fr_220px] items-center gap-3 border-hairline border-b border-solid px-2 hover:bg-surface-hover'
              >
                <Checkbox
                  className='size-5'
                  checked={checked}
                  onCheckedChange={() => toggleTeam(team)}
                  aria-label={`${team.name} in ${seriesTitle}`}
                />
                <div className='flex min-w-0 items-center gap-2.5'>
                  <div
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full font-semibold text-[10px]',
                      team.isViewerOnTeam
                        ? 'bg-grape-600 text-white'
                        : 'bg-surface-well text-fg-primary'
                    )}
                  >
                    {initials(team.name)}
                  </div>
                  <span className='truncate text-fg-primary text-sm'>{team.name}</span>
                </div>
                <div className='flex items-center justify-end gap-1.5'>
                  {canEnter ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onEnterMeeting(team)}
                      disabled={!team.meetingId}
                    >
                      <PlayArrowIcon className='mr-1 text-[16px]' />
                      Enter meeting
                    </Button>
                  ) : checked ? (
                    <span className='text-fg-muted text-xs'>Not a member</span>
                  ) : null}
                  {checked && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className='flex size-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-fg-secondary outline-hidden hover:bg-surface-hover hover:text-fg-primary'
                          onClick={() => onCopyPermalink(team)}
                          aria-label={`Copy meeting permalink for ${team.name}`}
                        >
                          <LinkIcon className='text-[20px]' />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Copy meeting permalink</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <DialogActions className='items-center'>
          <span className='mr-auto text-fg-secondary text-sm'>
            {inSeriesCount} of {teams.length} teams in this series
          </span>
          <Button variant='outline' size='md' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='dialogPrimary' size='md' onClick={onConfirm}>
            Save changes
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default ManageMeetingSeriesGroupModal
