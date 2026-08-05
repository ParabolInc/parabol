import {ArrowBack} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {lazy, type ReactNode, Suspense} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {Team_team$key} from '../../../../__generated__/Team_team.graphql'
import DashContent from '../../../../components/Dashboard/DashContent'
import FlatButton from '../../../../components/FlatButton'
import EditableTeamName from '../EditTeamName/EditableTeamName'

// import DebugButton from '../../../userDashboard/components/UserDashMain/DebugButton'

const UnpaidTeamModalRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'UnpaidTeamModalRoot' */ '../../containers/UnpaidTeamModal/UnpaidTeamModalRoot'
    )
)

interface Props {
  children: ReactNode
  dashSearch?: string
  team: Team_team$key | null
  isSettings: boolean
}

const Team = (props: Props) => {
  const navigate = useNavigate()
  const {children, isSettings, team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment Team_team on Team {
        id
        organization {
          isPaid
          lockedAt
        }
        ...EditableTeamName_team
      }
    `,
    teamRef
  )
  const teamId = team?.id
  if (!team || !teamId) return null
  const {organization} = team
  const {lockedAt, isPaid} = organization

  const goToTeamDashboard = () => {
    navigate(`/team/${teamId}/`)
  }

  const isLocked = !isPaid || !!lockedAt
  return (
    <>
      <Suspense fallback={''}>{isLocked && <UnpaidTeamModalRoot teamId={teamId} />}</Suspense>
      {isSettings && (
        <div className='flex w-full p-4'>
          <div className='mx-auto flex w-full max-w-[768px] flex-wrap items-center'>
            <>
              <FlatButton
                aria-label='Back to Team Dashboard'
                key='1'
                onClick={goToTeamDashboard}
                className='mr-4 w-8 px-0 py-[3px] text-fg-secondary hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
              >
                <ArrowBack className='text-inherit' />
              </FlatButton>
              <EditableTeamName team={team} />
            </>
          </div>
        </div>
      )}
      <DashContent hasOverlay={isLocked}>{children}</DashContent>
    </>
  )
}

export default Team
