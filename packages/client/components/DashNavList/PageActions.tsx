import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import type * as Y from 'yjs'
import type {PageActions_page$key} from '../../__generated__/PageActions_page.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useArchivePageMutation} from '../../mutations/useArchivePageMutation'
import {createPageLinkElement} from '../../shared/tiptap/createPageLinkElement'
import {providerManager} from '../../tiptap/providerManager'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {LeftNavItemButton} from './LeftNavItemButton'
import {LeftNavItemButtons} from './LeftNavItemButtons'

interface Props {
  pageRef: PageActions_page$key
  expandChildren: () => void
}
export const PageActions = (props: Props) => {
  const {pageRef, expandChildren} = props
  const page = useFragment(
    graphql`
      fragment PageActions_page on Page {
        id
        access {
          viewer
        }
      }
    `,
    pageRef
  )
  const {id: pageId, access} = page
  const {viewer: viewerAccess} = access
  const history = useHistory()
  const [executeArchive] = useArchivePageMutation()
  const atmosphere = useAtmosphere()
  const archivePage = () => {
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

  const addChildPage = (e: React.MouseEvent) => {
    e.preventDefault()
    providerManager.withDoc(pageId, (doc) => {
      const frag = doc.getXmlFragment('default')
      const pageLinkBlock = createPageLinkElement(-1, '<Untitled>')
      const gotoNewPage = (e: Y.YXmlEvent) => {
        for (const [key] of e.keys) {
          if (key === 'pageCode') {
            pageLinkBlock.unobserve(gotoNewPage)
            const pageCode = pageLinkBlock.getAttribute('pageCode')
            history.push(`/pages/${pageCode}`)
            expandChildren()
          }
        }
      }
      pageLinkBlock.observe(gotoNewPage)
      frag.insert(1, [pageLinkBlock] as any)
    })
  }

  return (
    <LeftNavItemButtons>
      {viewerAccess === 'owner' && (
        <div className='flex size-6 items-center justify-center rounded-sm hover:bg-slate-400'>
          <Menu
            trigger={
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MoreVertIcon className='hidden size-5 group-hover:block' />
                  </TooltipTrigger>
                  <TooltipContent side={'bottom'}>{'More page actions'}</TooltipContent>
                </Tooltip>
              </div>
            }
          >
            <MenuContent align='center' side={'right'} sideOffset={8} className='max-h-80'>
              <MenuItem onClick={archivePage}>
                <DeleteIcon className='text-slate-600' />
                <span className='pl-1'>{'Delete page'}</span>
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      )}
      <LeftNavItemButton Icon={AddIcon} onClick={addChildPage} tooltip='Add a page inside' />
    </LeftNavItemButtons>
  )
}
