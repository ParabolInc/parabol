import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/Description'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import StorageIcon from '@mui/icons-material/Storage'
import {NodeSelection} from '@tiptap/pm/state'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useClientQuery} from 'react-relay'
import {Link} from 'react-router-dom'
import pageDropTargetQuery, {
  type PageDropTargetQuery
} from '../../../__generated__/PageDropTargetQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {PageDropTarget} from '../../../modules/pages/PageDropTarget'
import {useArchivePageMutation} from '../../../mutations/useArchivePageMutation'
import {hasMinPageRole} from '../../../shared/hasMinPageRole'
import type {PageLinkBlockAttrs} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import {GQLID} from '../../../utils/GQLID'
import {getPageSlug} from '../../getPageSlug'

export const PageLinkBlockView = (props: NodeViewProps) => {
  const {node, getPos, view} = props
  const attrs = node.attrs as PageLinkBlockAttrs
  const {pageCode, title, canonical, database} = attrs
  const pageSlug = getPageSlug(pageCode, title)
  const Icon = canonical ? (database ? StorageIcon : DescriptionIcon) : FileOpenIcon
  const [executeArchive] = useArchivePageMutation()
  const atmosphere = useAtmosphere()
  const data = useClientQuery<PageDropTargetQuery>(pageDropTargetQuery, {})
  const {viewer} = data
  const {draggingPageId, draggingPageViewerAccess} = viewer ?? {}
  const hasDragAccess = hasMinPageRole('editor', draggingPageViewerAccess)
  const isOptimistic = pageCode === -1
  const focusLink = () => {
    const pos = getPos()
    if (!pos) return
    const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos))
    view.dispatch(tr)
    view.focus()
  }
  const archivePage = () => {
    if (isOptimistic) return
    const pageId = `page:${pageCode}`
    executeArchive({
      variables: {pageId, action: 'archive'},
      onCompleted(_res, errors) {
        const firstError = errors?.[0]?.message
        if (firstError) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'PageActionsArchive',
            message: firstError,
            autoDismiss: 5
          })
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'PageActionsArchiveUndo',
            message: 'Moved to trash',
            action: {
              label: 'Undo',
              callback: () => {
                executeArchive({
                  variables: {pageId, action: 'restore'}
                })
              }
            },
            autoDismiss: 5
          })
        }
      }
    })
  }
  const pageKey = GQLID.toKey(pageCode, 'page')
  const isSelf = pageKey === draggingPageId
  // doesn't fetch access for drop targets, but pops an error snack on drop
  // tbh, that UI is probably better because then the user knows why they can't drop on it
  const canDropIn = draggingPageId && !isSelf && hasDragAccess
  return (
    // ProseMirror-selectednode goes away if the cursor is in between nodes, which is what we want
    <NodeViewWrapper
      className={
        'group rounded-sm p-1 transition-colors hover:bg-slate-200 group-[.ProseMirror-selectednode]:bg-slate-200'
      }
    >
      <PageDropTarget data-drop-in={canDropIn ? pageKey : undefined}>
        <Link
          draggable={false}
          to={`/pages/${pageSlug}`}
          className={cn(
            'no-underline! flex w-full items-center',
            isOptimistic && 'pointer-events-none'
          )}
        >
          <Icon />
          <div className='flex-1 pl-1'>{title || '<Untitled>'}</div>
          <Menu
            onOpenChange={(open) => {
              if (open) {
                focusLink()
              }
            }}
            trigger={
              <div className='flex items-center pr-1'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MoreVertIcon
                      className='size-5 opacity-0 transition-opacity delay-200 group-hover:opacity-100 group-[&:not(:hover)]:delay-0'
                      onMouseDown={focusLink}
                    />
                  </TooltipTrigger>
                  <TooltipContent side={'bottom'}>{'More page actions'}</TooltipContent>
                </Tooltip>
              </div>
            }
          >
            <MenuContent align='end' side={'bottom'} sideOffset={8} className='max-h-80'>
              <MenuItem
                onSelect={archivePage}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <DeleteIcon className='text-slate-600' />
                <span className='pl-1'>{'Delete page'}</span>
              </MenuItem>
            </MenuContent>
          </Menu>
        </Link>
      </PageDropTarget>
    </NodeViewWrapper>
  )
}
