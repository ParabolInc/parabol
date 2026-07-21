import {ClassNames} from '@emotion/react'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {NavLink, useLocation, useNavigate} from 'react-router'
import DashSectionHeader from '~/components/Dashboard/DashSectionHeader'
import DashboardAvatars from '~/components/DashboardAvatars/DashboardAvatars'
import InviteTeamMemberAvatar from '~/components/InviteTeamMemberAvatar'
import Tab from '~/components/Tab/Tab'
import Tabs from '~/components/Tabs/Tabs'
import AgendaToggle from '~/modules/teamDashboard/components/AgendaToggle/AgendaToggle'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import type {TeamDashHeader_team$key} from '../../../../__generated__/TeamDashHeader_team.graphql'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const TeamMeta = styled('div')({
  // Add your styles here
})

const TeamLinks = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  fontSize: 12,
  justifyContent: 'flex-start',
  lineHeight: '16px',
  maxWidth: '100%',
  width: '100%',
  [desktopBreakpoint]: {
    justifyContent: 'flex-start',
    width: 'auto'
  }
})

const DashHeading = styled('div')({
  alignItems: 'center',
  color: 'var(--color-fg-primary)',
  display: 'flex',
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  height: 28
})

const linkStyles = {
  color: 'var(--color-accent)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '12px',
  marginRight: 8,
  outline: 0,
  ':hover, :focus, :active': {
    color: 'var(--color-fg-primary)'
  }
}

const secondLink = {
  ...linkStyles,
  marginRight: 0,
  marginLeft: 8
}

const TeamHeaderAndAvatars = styled('div')({
  flexShrink: 0,
  width: '100%',
  [desktopBreakpoint]: {
    display: 'flex',
    justifyContent: 'space-between'
  }
})

const Avatars = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  paddingTop: 12,
  [desktopBreakpoint]: {
    paddingTop: 0
  }
})

interface Props {
  team: TeamDashHeader_team$key
}

const TeamDashHeader = (props: Props) => {
  const {team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment TeamDashHeader_team on Team {
        ...DashboardAvatars_team
        id
        name
        organization {
          id
          name
        }
        teamMembers(sortBy: "preferredName") {
          ...InviteTeamMemberAvatar_teamMembers
          ...DashboardAvatar_teamMember
          id
        }
        ...TeamDashTeamMemberMenu_team
      }
    `,
    teamRef
  )

  const {organization, id: teamId, name: teamName, teamMembers} = team
  const {name: orgName, id: orgId} = organization
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    {label: 'Activity', path: 'activity'},
    {label: 'Tasks', path: 'tasks'},
    {label: 'Integrations', path: 'integrations'}
  ]

  const activePath = location.pathname.split('/').pop()
  const activeTab = tabs.find((tab) => tab.path === activePath) ? activePath : 'activity'
  const activeIdx = tabs.findIndex((tab) => tab.path === activeTab)

  const handleTabClick = (path: string) => {
    navigate(`/team/${teamId}/${path}`)
  }

  return (
    <DashSectionHeader>
      <TeamHeaderAndAvatars>
        <TeamMeta>
          <DashHeading>{teamName}</DashHeading>
          <TeamLinks>
            <ClassNames>
              {({css}) => (
                <NavLink
                  className={css(linkStyles)}
                  title={orgName}
                  to={`/me/organizations/${orgId}/billing`}
                >
                  {orgName}
                </NavLink>
              )}
            </ClassNames>
            {'•'}
            <ClassNames>
              {({css}) => (
                <NavLink
                  className={css(secondLink)}
                  title={'Team Settings'}
                  to={`/team/${teamId}/settings/`}
                >
                  {'Settings'}
                </NavLink>
              )}
            </ClassNames>
          </TeamLinks>
        </TeamMeta>
        <Avatars>
          <DashboardAvatars team={team} />
          <InviteTeamMemberAvatar teamId={teamId} teamMembers={teamMembers} />
          <AgendaToggle teamId={teamId} />
        </Avatars>
      </TeamHeaderAndAvatars>
      <Tabs
        activeIdx={activeIdx}
        className='full-w max-w-none border-hairline border-b border-solid'
      >
        {tabs.map((tab) => (
          <Tab key={tab.path} label={tab.label} onClick={() => handleTabClick(tab.path)} />
        ))}
      </Tabs>
    </DashSectionHeader>
  )
}

export default TeamDashHeader
