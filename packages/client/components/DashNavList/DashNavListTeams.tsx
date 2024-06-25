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
  onClick?: () => void
}

const DashNavListTeams = (props: Props) => {
  const {organizationRef, onClick} = props
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
  const {publicTeams, viewerTeams, featureFlags} = organization
  const publicTeamsEnabled = featureFlags?.publicTeams
  const publicTeamsCount = publicTeamsEnabled ? publicTeams.length : 0

  const handleClose = () => {
    setShowModal(false)
  }

  const handleClick = () => {
    setShowModal(true)
    onClick && onClick()
  }

  const getIcon = (lockedAt: string | null, isPaid: boolean | null) =>
    lockedAt || !isPaid ? 'warning' : 'group'

  if (!viewerTeams.length) return null
  return (
    <div className='p-2'>
      {viewerTeams.map((team) => {
        return (
          <StyledLeftDashNavItem
            key={team.id}
            icon={getIcon(team.organization.lockedAt, team.isPaid)}
            href={team.isViewerOnTeam ? `/team/${team.id}` : `/team/${team.id}/requestToJoin`}
            label={team.name}
            onClick={onClick}
          />
        )
      })}
      {publicTeamsCount > 0 && (
        <StyledLeftDashNavItem
          className='bg-white pl-11 lg:bg-slate-200'
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
