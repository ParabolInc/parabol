import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {DashNavListTeams_organization$key} from '../../__generated__/DashNavListTeams_organization.graphql'
import {PALETTE} from '../../styles/paletteV3'
import plural from '../../utils/plural'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'
import PublicTeamsModal from './PublicTeamsModal'

const StyledLeftDashNavItem = styled(LeftDashNavItem)<{isPublicTeams?: boolean}>(
  ({isPublicTeams}) => ({
    color: isPublicTeams ? PALETTE.SLATE_600 : PALETTE.SLATE_700,
    borderRadius: 44,
    paddingLeft: 15
  })
)

type Props = {
  organizationRef: DashNavListTeams_organization$key
}

const DashNavListTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment DashNavListTeams_organization on Organization {
        id
        name
        tier
        featureFlags {
          publicTeams
        }
        viewerTeams {
          ...DashNavListTeam @relay(mask: false)
        }
        publicTeams {
          ...PublicTeamsModal_team
        }
      }
    `,
    organizationRef
  )
  const [showModal, setShowModal] = useState(false)
  const {publicTeams, viewerTeams} = organization
  const publicTeamsCount = publicTeams.length

  const handleClose = () => {
    setShowModal(false)
  }

  const handleClick = () => {
    setShowModal(true)
  }

  const getIcon = (lockedAt: string | null, isPaid: boolean | null) =>
    lockedAt || !isPaid ? 'warning' : 'group'

  return (
    <div className='py-1'>
      {viewerTeams.map((team) => {
        return (
          <StyledLeftDashNavItem
            key={team.id}
            icon={getIcon(team.organization.lockedAt, team.isPaid)}
            href={team.isViewerOnTeam ? `/team/${team.id}` : `/team/${team.id}/requestToJoin`}
            label={team.name}
          />
        )
      })}
      {publicTeamsCount > 0 && (
        <StyledLeftDashNavItem
          className='bg-slate-200 pl-11'
          onClick={handleClick}
          isPublicTeams
          label={`View ${publicTeamsCount} ${plural(publicTeamsCount, 'Public Team', 'Public Teams')}`}
        />
      )}
      <PublicTeamsModal
        orgName={organization.name}
        teamsRef={publicTeams}
        isOpen={showModal}
        onClose={handleClose}
      />
    </div>
  )
}

export default DashNavListTeams
