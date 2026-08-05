import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {NavLink, useLocation, useNavigate} from 'react-router'
import DashSectionHeader from '~/components/Dashboard/DashSectionHeader'
import DashboardAvatars from '~/components/DashboardAvatars/DashboardAvatars'
import InviteTeamMemberAvatar from '~/components/InviteTeamMemberAvatar'
import Tab from '~/components/Tab/Tab'
import Tabs from '~/components/Tabs/Tabs'
import AgendaToggle from '~/modules/teamDashboard/components/AgendaToggle/AgendaToggle'
import type {TeamDashHeader_team$key} from '../../../../__generated__/TeamDashHeader_team.graphql'

const linkClassName =
  'mr-2 cursor-pointer font-semibold text-[12px] text-accent leading-3 outline-none hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'

const secondLinkClassName =
  'mr-0 ml-2 cursor-pointer font-semibold text-[12px] text-accent leading-3 outline-none hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'

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
      <div className='sidebar-left:flex w-full shrink-0 sidebar-left:justify-between'>
        <div>
          <div className='flex h-7 items-center font-semibold text-[20px] text-fg-primary leading-6'>
            {teamName}
          </div>
          <div className='flex sidebar-left:w-auto w-full max-w-full flex-wrap items-center justify-start text-[12px] leading-4'>
            <NavLink
              className={linkClassName}
              title={orgName}
              to={`/me/organizations/${orgId}/billing`}
            >
              {orgName}
            </NavLink>
            {'•'}
            <NavLink
              className={secondLinkClassName}
              title={'Team Settings'}
              to={`/team/${teamId}/settings/`}
            >
              {'Settings'}
            </NavLink>
          </div>
        </div>
        <div className='flex items-start pt-3 sidebar-left:pt-0'>
          <DashboardAvatars team={team} />
          <InviteTeamMemberAvatar teamId={teamId} teamMembers={teamMembers} />
          <AgendaToggle teamId={teamId} />
        </div>
      </div>
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
