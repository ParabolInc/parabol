import AddIcon from '@mui/icons-material/Add'
import GroupIcon from '@mui/icons-material/Group'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {useHistory, useRouteMatch} from 'react-router'
import {Link} from 'react-router-dom'
import type {LeftNavTeamLink_team$key} from '../../__generated__/LeftNavTeamLink_team.graphql'
import type {PageRoleEnum} from '../../__generated__/NotificationSubscription.graphql'
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
      }
    `,
    teamRef
  )
  const isViewerOwnerOfDraggingPage = draggingPageViewerAccess === 'owner'
  const {name: teamName, id: teamId, isDraggingFirstChild, isDraggingLastChild, orgId} = team
  const isDraggingPageFromTheTeam = draggingPageParentSection === teamId
  const isViewerOwnerOrIsReorder = isViewerOwnerOfDraggingPage || isDraggingPageFromTheTeam
  const match = useRouteMatch(`/team/${teamId}`)
  const isActive = match ?? false
  const [showChildren, setShowChildren] = useState(false)
  const expandChildPages = () => {
    setShowChildren(!showChildren)
  }
  const history = useHistory()
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
        history.push(`/pages/${pageCode}`)
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
      <div
        data-highlighted={isActive ? '' : undefined}
        data-drop-in={canDropIn ? teamId : undefined}
        className={cn(
          'peer group relative my-0.5 flex w-full cursor-pointer items-center space-x-2 rounded-md px-1 py-1 text-slate-700 text-sm leading-8 outline-hidden data-[drop-in]:hover:bg-sky-300/70',
          // when in dragging mode, hide hover/focus/active slate background so you only see blue
          !draggingPageId &&
            'hover:bg-slate-300 focus:bg-slate-300 data-highlighted:bg-slate-300 data-highlighted:text-slate-900',
          draggingPageId && 'cursor-pointer'
        )}
      >
        <div
          className={cn(
            '-bottom-0.5 absolute left-0 z-20 hidden h-1 w-full hover:bg-sky-500/80 data-[drop-below]:flex',
            canDropBelow && 'cursor-pointer'
          )}
          data-drop-below={canDropBelow ? teamId || '' : undefined}
          data-drop-idx={-1}
          aria-expanded={showChildren}
        ></div>
        <Link
          draggable={false}
          to={`/team/${teamId}`}
          className={'flex w-full items-center'}
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
                history.push(`/me/organizations/${orgId}/teams/${teamId}`)
              }}
              tooltip='Manage team'
            />
            <LeftNavItemButton Icon={AddIcon} onClick={addChildPage} tooltip='Add a page inside' />
          </LeftNavItemButtons>
        </Link>
      </div>
      {showChildren && (
        <div className={cn('rounded-md', canDropIn && 'peer-hover:bg-sky-200/70')}>
          <SubPagesRoot teamId={teamId} pageAncestors={['', teamId]} />
        </div>
      )}
    </div>
  )
}
