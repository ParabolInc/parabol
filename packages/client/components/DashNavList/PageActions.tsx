import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type * as Y from 'yjs'
import {Add as AddIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon} from '~/ui/icons'
import type {PageActions_page$key} from '../../__generated__/PageActions_page.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useArchivePageMutation} from '../../mutations/useArchivePageMutation'
import {hasMinPageRole} from '../../shared/hasMinPageRole'
import {createPageLinkElement} from '../../shared/tiptap/createPageLinkElement'
import {providerManager} from '../../tiptap/providerManager'
import {cn} from '../../ui/cn'
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
        isDatabase
      }
    `,
    pageRef
  )
  const {id: pageId, access, isDatabase} = page
  const {viewer: viewerAccess} = access
  const navigate = useNavigate()
  const [executeArchive] = useArchivePageMutation()
  const atmosphere = useAtmosphere()
  const canEdit = hasMinPageRole('editor', viewerAccess)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
    providerManager.withDoc(pageId, ({document, authorizedScope}) => {
      if (authorizedScope === 'readonly') {
        atmosphere.eventEmitter.emit('addSnackbar', {
          autoDismiss: 5,
          key: `PageActions:readonly`,
          message: `You must be an editor to add a sub page`
        })
        return
      }
      const frag = document.getXmlFragment('default')
      const pageLinkBlock = createPageLinkElement(-1, '<Untitled>', false)
      const gotoNewPage = (e: Y.YXmlEvent) => {
        for (const [key] of e.keys) {
          if (key === 'pageCode') {
            pageLinkBlock.unobserve(gotoNewPage)
            const pageCode = pageLinkBlock.getAttribute('pageCode')
            navigate(`/pages/${pageCode}`)
            expandChildren()
          }
        }
      }
      pageLinkBlock.observe(gotoNewPage)
      frag.insert(1, [pageLinkBlock] as any)
    })
  }

  return (
    <LeftNavItemButtons isMenuOpen={isMenuOpen}>
      {viewerAccess === 'owner' && (
        <div className='flex size-6 items-center justify-center rounded-sm hover:bg-surface-nav-button-hover'>
          <Menu
            open={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            trigger={
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      aria-label={'More page actions'}
                      className={cn(
                        'hidden size-5 cursor-pointer items-center justify-center group-hover:flex',
                        isMenuOpen && 'flex'
                      )}
                    >
                      <MoreVertIcon className='size-5' />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side={'bottom'}>{'More page actions'}</TooltipContent>
                </Tooltip>
              </div>
            }
          >
            <MenuContent align='center' side={'right'} sideOffset={8} className='max-h-80'>
              <MenuItem
                onSelect={archivePage}
                onClick={(e) => {
                  //  default is required in order to trigger onSelect
                  e.stopPropagation()
                }}
              >
                <DeleteIcon className='text-fg-secondary' />
                <span className='pl-1'>{'Delete page'}</span>
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      )}
      {!isDatabase && canEdit && (
        <LeftNavItemButton Icon={AddIcon} onClick={addChildPage} tooltip='Add a page inside' />
      )}
    </LeftNavItemButtons>
  )
}
