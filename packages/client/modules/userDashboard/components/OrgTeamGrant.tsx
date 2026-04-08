import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import graphql from 'babel-plugin-relay/macro'
import type {Dispatch, SetStateAction} from 'react'
import {useFragment} from 'react-relay'
import type {OrgTeamGrant_viewer$key} from '../../../__generated__/OrgTeamGrant_viewer.graphql'
import {Checkbox} from '../../../ui/Checkbox/Checkbox'
import {cn} from '../../../ui/cn'
import {RadioGroup, RadioGroupItem} from '../../../ui/RadioGroup/RadioGroup'
import type {GrantModeOption} from './PersonalAccessTokenUpsertDialog'

interface Props {
  viewerRef: OrgTeamGrant_viewer$key
  orgGrantMode: GrantModeOption
  setOrgGrantMode: (mode: GrantModeOption) => void
  selectedOrgIds: Set<string>
  setSelectedOrgIds: Dispatch<SetStateAction<Set<string>>>
  selectedTeamIds: Set<string>
  setSelectedTeamIds: Dispatch<SetStateAction<Set<string>>>
  expandedOrgIds: Set<string>
  toggleExpandOrg: (orgId: string) => void
}

export const OrgTeamGrant = ({
  viewerRef,
  orgGrantMode,
  setOrgGrantMode,
  selectedOrgIds,
  setSelectedOrgIds,
  selectedTeamIds,
  setSelectedTeamIds,
  expandedOrgIds,
  toggleExpandOrg
}: Props) => {
  const toggleOrg = (org: {id: string; teams: ReadonlyArray<{id: string}>}) => {
    const orgTeamIds = org.teams.map((t) => t.id)
    setSelectedOrgIds((prevOrgs) => {
      const nextOrgs = new Set(prevOrgs)
      setSelectedTeamIds((prevTeams) => {
        const nextTeams = new Set(prevTeams)
        if (nextOrgs.has(org.id)) {
          nextOrgs.delete(org.id)
          orgTeamIds.forEach((id) => nextTeams.delete(id))
        } else {
          nextOrgs.add(org.id)
          orgTeamIds.forEach((id) => nextTeams.add(id))
        }
        return nextTeams
      })
      return nextOrgs
    })
  }

  const toggleTeam = (teamId: string, org: {id: string; teams: ReadonlyArray<{id: string}>}) => {
    setSelectedTeamIds((prevTeams) => {
      const nextTeams = new Set(prevTeams)
      if (nextTeams.has(teamId)) {
        nextTeams.delete(teamId)
        setSelectedOrgIds((prev) => {
          const next = new Set(prev)
          next.delete(org.id)
          return next
        })
      } else {
        nextTeams.add(teamId)
        const allSelected = org.teams.every((t) => t.id === teamId || nextTeams.has(t.id))
        if (allSelected) setSelectedOrgIds((prev) => new Set([...prev, org.id]))
      }
      return nextTeams
    })
  }

  const {organizations} = useFragment(
    graphql`
      fragment OrgTeamGrant_viewer on User {
        organizations {
          id
          name
          teams {
            id
            name
          }
        }
      }
    `,
    viewerRef
  )

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <span className='font-medium text-slate-700 text-sm'>Organizations & Teams</span>
        <RadioGroup
          value={orgGrantMode}
          onValueChange={(v: GrantModeOption) => setOrgGrantMode(v)}
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
          {organizations.length === 0 ? (
            <p className='p-3 text-slate-500 text-sm'>No organizations found</p>
          ) : (
            organizations.map((org) => {
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
  )
}
