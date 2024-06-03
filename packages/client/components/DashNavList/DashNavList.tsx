import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Fragment, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {
  DashNavList_organization$data,
  DashNavList_organization$key
} from '../../__generated__/DashNavList_organization.graphql'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'

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
      {isSingleOrg
        ? teams.map((team) => (
            <StyledLeftDashNavItem
              className={className}
              onClick={onClick}
              isViewerOnTeam={team.isViewerOnTeam}
              key={team.id}
              icon={getIcon(team)}
              href={team.isViewerOnTeam ? `/team/${team.id}` : `/team/${team.id}/requestToJoin`}
              label={team.name}
            />
          ))
        : teamsByOrgKey.map((entry) => {
            const [key, teams] = entry
            const name = key.slice(0, key.lastIndexOf(':'))
            return (
              <div className='mb-3 h-full w-full rounded-lg border-2 border-solid border-slate-300'>
                <Fragment key={key}>
                  <div className='text-md pt-2 pl-2 font-medium leading-6 text-slate-700 sm:pl-4'>
                    {name}
                  </div>
                  {teams.map((team) => (
                    <StyledLeftDashNavItem
                      className={className}
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
    }
  }
`
export default DashNavList
