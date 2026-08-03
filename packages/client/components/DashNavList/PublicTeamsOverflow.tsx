import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PublicTeamsOverflow_viewer$key} from '../../__generated__/PublicTeamsOverflow_viewer.graphql'
import plural from '../../utils/plural'
import PublicTeamsModal from './PublicTeamsModal'

type Props = {
  viewerRef: PublicTeamsOverflow_viewer$key
  closeMobileSidebar?: () => void
}

export const PublicTeamsOverflow = (props: Props) => {
  const {closeMobileSidebar, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment PublicTeamsOverflow_viewer on User {
        organizations {
          teams {
            ...PublicTeamsModal_team
            isViewerOnTeam
            isPublic
          }
        }
      }
    `,
    viewerRef
  )
  const {organizations} = viewer
  const publicTeams = organizations
    .flatMap(({teams}) => teams)
    .filter((team) => !team.isViewerOnTeam && team.isPublic)
  const [showModal, setShowModal] = useState(false)
  const publicTeamsCount = publicTeams.length

  const handleClose = () => {
    setShowModal(false)
  }

  const handleClick = () => {
    closeMobileSidebar?.()
    setShowModal(true)
  }
  return (
    <>
      {publicTeamsCount > 0 && (
        <div
          onClick={handleClick}
          className='cursor-pointer rounded-md py-1 text-fg-nav-muted text-sm leading-5 hover:bg-surface-nav-hover hover:text-fg-primary'
        >
          <button className='w-full cursor-pointer select-none items-center justify-center rounded-md bg-inherit font-semibold'>
            {`View ${publicTeamsCount} ${plural(publicTeamsCount, 'Public Team', 'Public Teams')}`}
          </button>
        </div>
      )}
      <PublicTeamsModal
        orgName={'any organization'}
        teamsRef={publicTeams}
        isOpen={showModal}
        onClose={handleClose}
      />
    </>
  )
}

export default PublicTeamsOverflow
