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
import plural from '../../../utils/plural'
import ReposSVG from '../../../../../static/images/icons/repos.svg'

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
          'mx-4 mt-4 mb-2 flex cursor-pointer items-center gap-2 rounded border border-solid bg-white py-0.5 px-3 text-left transition',
          isMenuOpen
            ? 'border-sky-400 hover:border-sky-500'
            : 'border-slate-300 hover:border-slate-500'
        )}
        onClick={togglePortal}
        ref={originRef}
      >
        <img src={ReposSVG} />
        {selectedRepos.length === 0
          ? 'All repositories'
          : `${selectedRepos.length} ${plural(
              selectedRepos.length,
              'repository',
              'repositories'
            )} selected`}
        <ExpandMore
          className={clsx(
            'ml-auto rounded-full transition duration-300',
            isMenuOpen ? 'rotate-180' : '',
            selectedRepos.length > 0 && !isMenuOpen ? 'bg-sky-500 text-white' : ''
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
