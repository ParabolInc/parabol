import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Link, useMatch, useNavigate} from 'react-router'
import {Add as AddIcon, Group as GroupIcon, ManageAccounts as ManageAccountsIcon} from '~/ui/icons'
import type {LeftNavTeamLink_team$key} from '../../__generated__/LeftNavTeamLink_team.graphql'
import type {PageRoleEnum} from '../../__generated__/NotificationSubscription.graphql'
import {PageDropTarget} from '../../modules/pages/PageDropTarget'
import {useCreatePageMutation} from '../../mutations/useCreatePageMutation'
import {cn} from '../../ui/cn'
import {ExpandPageChildrenButton} from './ExpandPageChildrenButton'
import {LeftNavItem} from './LeftNavItem'
import {LeftNavItemButton} from './LeftNavItemButton'
import {LeftNavItemButtons} from './LeftNavItemButtons'
import type {PageParentSection} from './LeftNavPageLink'
import {SubPagesRoot} from './SubPagesRoot'

interface Props {
  teamRef: LeftNavTeamLink_team$key
  draggingPageId: string | null
  draggingPageViewerAccess: PageRoleEnum | null
  draggingPageParentSection: PageParentSection | null
  closeMobileSidebar?: () => void
}
export const LeftNavTeamLink = (props: Props) => {
  const {
    closeMobileSidebar,
    teamRef,
    draggingPageId,
    draggingPageViewerAccess,
    draggingPageParentSection
  } = props
  const team = useFragment(
    graphql`
      fragment LeftNavTeamLink_team on Team {
        id
        name
        isDraggingFirstChild
        isDraggingLastChild
        orgId
        organization {
          hasConfluenceExport: featureFlag(featureName: "ConfluenceExport")
        }
      }
    `,
    teamRef
  )
  const isViewerOwnerOfDraggingPage = draggingPageViewerAccess === 'owner'
  const {name: teamName, id: teamId, isDraggingFirstChild, isDraggingLastChild, orgId} = team
  const isDraggingPageFromTheTeam = draggingPageParentSection === teamId
  const isViewerOwnerOrIsReorder = isViewerOwnerOfDraggingPage || isDraggingPageFromTheTeam
  const match = useMatch({path: `/team/${teamId}`, end: false})
  const isActive = !!match
  const [showChildren, setShowChildren] = useState(false)
  const expandChildPages = () => {
    setShowChildren(!showChildren)
  }
  const navigate = useNavigate()
  const [execute, submitting] = useCreatePageMutation()
  const addChildPage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (submitting) return
    execute({
      variables: {teamId},
      onCompleted: (response) => {
        const {createPage} = response
        const {page} = createPage
        const {id} = page
        const [_, pageCode] = id.split(':')
        navigate(`/pages/${pageCode}`)
        setShowChildren(true)
      }
    })
  }
  const canDropIn =
    draggingPageId && (showChildren ? !isDraggingLastChild : true) && isViewerOwnerOrIsReorder
  const canDropBelow =
    draggingPageId && showChildren && !isDraggingFirstChild && isViewerOwnerOrIsReorder
  return (
    <div className='relative rounded-md'>
      <PageDropTarget
        data-highlighted={isActive ? '' : undefined}
        data-drop-in={canDropIn ? teamId : undefined}
        className={cn(
          'peer group relative my-0.5 flex w-full cursor-pointer items-center space-x-2 rounded-md border-l-[3px] border-l-transparent px-1 py-1 text-fg-nav text-sm leading-8 outline-hidden before:absolute before:inset-y-1 before:left-px before:w-[3px] before:rounded-full before:bg-transparent',
          // when in dragging mode, hide hover/focus/active slate background so you only see blue
          !draggingPageId &&
            'hover:bg-surface-nav-hover focus:bg-surface-nav-hover data-highlighted:bg-surface-nav-active data-highlighted:text-fg-primary data-highlighted:before:bg-(--color-accent-active)',
          draggingPageId && 'cursor-pointer'
        )}
      >
        <div
          className={cn(
            '-bottom-0.5 absolute left-0 z-20 hidden h-1 w-full hover:bg-sky-500/80 data-drop-below:flex',
            canDropBelow && 'cursor-pointer'
          )}
          data-drop-below={canDropBelow ? teamId || '' : undefined}
          data-drop-idx={-1}
          aria-expanded={showChildren}
        ></div>
        <Link
          draggable={false}
          to={`/team/${teamId}`}
          className={'flex w-full items-center text-inherit hover:text-inherit'}
          onClick={(e) => {
            if (draggingPageId) {
              e.preventDefault()
            }
            closeMobileSidebar?.()
          }}
        >
          <ExpandPageChildrenButton
            showChildren={showChildren}
            expandChildPages={expandChildPages}
            draggingPageId={draggingPageId}
            icon={GroupIcon}
          />
          <LeftNavItem>
            <span className='pl-1'>{teamName}</span>
          </LeftNavItem>
          <LeftNavItemButtons>
            <LeftNavItemButton
              Icon={ManageAccountsIcon}
              onClick={(e) => {
                e.preventDefault()
                navigate(`/me/organizations/${orgId}/teams/${teamId}`)
              }}
              tooltip='Manage team'
            />
            <LeftNavItemButton Icon={AddIcon} onClick={addChildPage} tooltip='Add a page inside' />
          </LeftNavItemButtons>
        </Link>
      </PageDropTarget>
      {showChildren && (
        <div className={cn('rounded-md', canDropIn && 'peer-hover:bg-sky-200/70')}>
          <SubPagesRoot
            teamId={teamId}
            pageAncestors={['', teamId]}
            showConfluenceExport={team.organization.hasConfluenceExport}
          />
        </div>
      )}
    </div>
  )
}
