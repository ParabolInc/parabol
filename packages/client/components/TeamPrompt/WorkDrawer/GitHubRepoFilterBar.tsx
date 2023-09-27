import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import useMenu from '../../../hooks/useMenu'
import {MenuPosition} from '../../../hooks/useCoords'
import GitHubRepoSearchFilterMenu from '../../GitHubRepoSearchFilterMenu'
import {useFragment} from 'react-relay'
import {GitHubRepoFilterBar_teamMember$key} from '../../../__generated__/GitHubRepoFilterBar_teamMember.graphql'
import {ExpandMore} from '@mui/icons-material'
import {PortalStatus} from '../../../hooks/usePortal'
import clsx from 'clsx'

interface Props {
  teamMemberRef: GitHubRepoFilterBar_teamMember$key
  selectedRepos: string[]
  setSelectedRepos: (repos: string[]) => void
}

const GitHubRepoFilterBar = (props: Props) => {
  const {teamMemberRef, selectedRepos, setSelectedRepos} = props
  const teamMember = useFragment(
    graphql`
      fragment GitHubRepoFilterBar_teamMember on TeamMember {
        ...GitHubRepoSearchFilterMenu_teamMember
      }
    `,
    teamMemberRef
  )

  const {togglePortal, originRef, menuPortal, menuProps, portalStatus} = useMenu(
    MenuPosition.UPPER_LEFT,
    {
      loadingWidth: 200,
      noClose: true,
      isDropdown: true
    }
  )

  const isMenuOpen = ![PortalStatus.Exited, PortalStatus.Exiting].includes(portalStatus)

  return (
    <>
      <button
        className={clsx(
          'mx-4 mt-4 mb-2 flex cursor-pointer items-center justify-between rounded border border-solid bg-white py-0.5 px-3 text-left transition',
          isMenuOpen
            ? 'border-sky-400 hover:border-sky-500'
            : 'border-slate-300 hover:border-slate-500'
        )}
        onClick={togglePortal}
        ref={originRef}
      >
        {selectedRepos.length === 0
          ? 'All repositories'
          : `${selectedRepos.length} repositories selected`}
        <ExpandMore
          className={clsx(
            'transition-transform',
            [PortalStatus.Exited, PortalStatus.Exiting].includes(portalStatus) ? '' : 'rotate-180'
          )}
        />
      </button>
      {menuPortal(
        <GitHubRepoSearchFilterMenu
          menuLabel='Select repositories'
          selectedRepos={selectedRepos}
          onToggleRepo={(repoName, isSelected) => {
            if (!isSelected) {
              setSelectedRepos([...selectedRepos, repoName])
            } else {
              setSelectedRepos(selectedRepos.filter((repo) => repo !== repoName))
            }
          }}
          menuProps={menuProps}
          teamMemberRef={teamMember}
        />
      )}
    </>
  )
}

export default GitHubRepoFilterBar
