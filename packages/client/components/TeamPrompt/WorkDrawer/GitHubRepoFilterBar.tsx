import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExpandMore, FilterList} from '~/ui/icons'
import type {GitHubRepoFilterBar_teamMember$key} from '../../../__generated__/GitHubRepoFilterBar_teamMember.graphql'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import plural from '../../../utils/plural'
import GitHubRepoSearchFilterMenu from '../../GitHubRepoSearchFilterMenu'

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

  return (
    <Menu
      trigger={
        <button className='group mx-4 mt-4 mb-2 flex cursor-pointer items-center gap-2 rounded-sm border border-hairline border-solid bg-surface-card px-3 py-0.5 text-left transition hover:border-hairline-strong data-[state=open]:border-accent'>
          <FilterList className='h-5 w-5 text-fg-secondary' />
          {selectedRepos.length === 0
            ? 'All repositories'
            : `${selectedRepos.length} ${plural(
                selectedRepos.length,
                'repository',
                'repositories'
              )} selected`}
          <ExpandMore
            className={cn(
              'ml-auto rounded-full transition duration-300 group-data-[state=open]:rotate-180',
              selectedRepos.length > 0 &&
                'group-data-[state=closed]:bg-accent group-data-[state=closed]:text-white'
            )}
          />
        </button>
      }
    >
      <MenuContent align='start' className='max-h-full min-w-[300px] max-w-full p-2'>
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
          teamMemberRef={teamMember}
        />
      </MenuContent>
    </Menu>
  )
}

export default GitHubRepoFilterBar
