import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Fragment, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'
import {
  DashNavList_organization$key,
  DashNavList_organization$data
} from '../../__generated__/DashNavList_organization.graphql'

const DashNavListStyles = styled('div')({
  paddingRight: 8,
  width: '100%'
})

const OrgName = styled('div')({
  paddingTop: 8,
  paddingLeft: 8,
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '24px',
  color: PALETTE.SLATE_500,
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    paddingLeft: 16
  }
})

const EmptyTeams = styled('div')({
  fontSize: 16,
  fontStyle: 'italic',
  padding: 16,
  textAlign: 'center'
})

const DashHR = styled('div')({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  width: 'calc(100% + 8px)'
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
        viewerOrganizationUser {
          user {
            featureFlags {
              publicTeams
            }
          }
        }
      }
    `,
    organizationsRef
  )
  const hasPublicTeamsFlag =
    organizations?.[0]?.viewerOrganizationUser?.user?.featureFlags?.publicTeams
  const teams = organizations?.flatMap((org) =>
    hasPublicTeamsFlag ? org.allTeams : org.viewerTeams
  )

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

  const getIcon = (team: Team) => {
    if (team.organization.lockedAt || !team.isPaid) {
      return 'warning'
    }
    if (!team.isViewerOnTeam) {
      return 'groupAdd'
    }
    return 'group'
  }

  return (
    <DashNavListStyles>
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
        : teamsByOrgKey.map((entry, idx) => {
            const [key, teams] = entry
            const name = key.slice(0, key.lastIndexOf(':'))
            return (
              <Fragment key={key}>
                <OrgName>{name}</OrgName>
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
                {idx !== teamsByOrgKey.length - 1 && <DashHR />}
              </Fragment>
            )
          })}
    </DashNavListStyles>
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
