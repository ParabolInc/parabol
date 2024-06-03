import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {Fragment, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {
  DashNavList_organization$data,
  DashNavList_organization$key
} from '../../__generated__/DashNavList_organization.graphql'
import {TierEnum} from '../../__generated__/DowngradeToStarterMutation.graphql'
import {upperFirst} from '../../utils/upperFirst'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'
import BaseTag from '../Tag/BaseTag'

const EmptyTeams = styled('div')({
  fontSize: 16,
  fontStyle: 'italic',
  padding: 16,
  textAlign: 'center'
})

const StyledLeftDashNavItem = styled(LeftDashNavItem)<{isViewerOnTeam: boolean}>(
  ({isViewerOnTeam}) => ({
    color: isViewerOnTeam ? PALETTE.SLATE_700 : PALETTE.SLATE_600
  })
)

const Tag = styled(BaseTag)<{tier: TierEnum | null}>(({tier}) => ({
  backgroundColor:
    tier === 'enterprise'
      ? PALETTE.SKY_500
      : tier === 'team'
        ? PALETTE.TERRA_300
        : PALETTE.JADE_400,
  color: PALETTE.WHITE
}))

const SettingsNavItem = styled(LeftDashNavItem)({
  color: PALETTE.SKY_500
})

interface Props {
  className?: string
  organizationsRef: DashNavList_organization$key | null
  onClick?: () => void
}

type Team = DashNavList_organization$data[0]['allTeams'][0]

const DashNavList = (props: Props) => {
  const {className, onClick, organizationsRef} = props
  const organizations = useFragment(
    graphql`
      fragment DashNavList_organization on Organization @relay(plural: true) {
        allTeams {
          ...DashNavListTeam @relay(mask: false)
        }
        viewerTeams {
          ...DashNavListTeam @relay(mask: false)
        }
        featureFlags {
          publicTeams
        }
      }
    `,
    organizationsRef
  )
  const teams = organizations?.flatMap((org) => {
    // if the user is a billing leader, allTeams will return all teams even if they don't have the publicTeams flag
    const hasPublicTeamsFlag = org.featureFlags.publicTeams
    return hasPublicTeamsFlag ? org.allTeams : org.viewerTeams
  })

  const teamsByOrgKey = useMemo(() => {
    if (!teams) return null
    const teamsByOrgId = {} as {[key: string]: Team[]}
    teams.forEach((team) => {
      const {organization} = team
      const {id: orgId, name: orgName} = organization
      const key = `${orgName}:${orgId}`
      teamsByOrgId[key] = teamsByOrgId[key] || []
      teamsByOrgId[key]!.push(team)
    })
    return Object.entries(teamsByOrgId).sort((a, b) =>
      a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1
    )
  }, [teams])
  if (!teams || !teamsByOrgKey) return null

  if (teams.length === 0) {
    return <EmptyTeams>It appears you are not a member of any team!</EmptyTeams>
  }

  const isSingleOrg = teamsByOrgKey.length === 1

  const getIcon = (team: Team) => (team.organization.lockedAt || !team.isPaid ? 'warning' : 'group')

  return (
    <div className='w-full p-2'>
      {teamsByOrgKey.map((entry) => {
        const [key, teams] = entry
        const org = teams[0]!.organization
        const orgTier = org.tier
        const name = key.slice(0, key.lastIndexOf(':'))
        return (
          <div className='mb-3 h-full w-full rounded-lg border-2 border-solid border-slate-300 pt-2'>
            <Fragment key={key}>
              <div className='flex flex-wrap items-center'>
                <div className='flex min-w-0 flex-1 flex-wrap items-center justify-between'>
                  <span className='text-md pl-2 font-medium leading-6 text-slate-700 sm:pl-4'>
                    {name}
                  </span>
                  <div className='mt-2 flex w-full justify-end px-2 sm:mt-0 sm:w-auto sm:text-right'>
                    <Tag tier={orgTier}>{upperFirst(orgTier)}</Tag>
                  </div>
                </div>
              </div>
              <SettingsNavItem
                className={className}
                onClick={onClick}
                key={'settings'}
                icon={'manageAccounts'}
                iconClassName='text-sky-500'
                href={`/me/organizations/${org.id}/billing`}
                label={'Settings & Members'}
              />
              <div className='border-t border-solid border-slate-300' />
              <div className='py-1'>
                {teams.map((team) => (
                  <StyledLeftDashNavItem
                    className={clsx(className, `${isSingleOrg ? 'bg-slate-200' : ''}`)}
                    isViewerOnTeam={team.isViewerOnTeam}
                    onClick={onClick}
                    key={team.id}
                    icon={getIcon(team)}
                    href={
                      team.isViewerOnTeam ? `/team/${team.id}` : `/team/${team.id}/requestToJoin`
                    }
                    label={team.name}
                  />
                ))}
              </div>
            </Fragment>
          </div>
        )
      })}
    </div>
  )
}

graphql`
  fragment DashNavListTeam on Team {
    id
    isPaid
    name
    isViewerOnTeam
    organization {
      id
      name
      lockedAt
      tier
    }
  }
`
export default DashNavList
