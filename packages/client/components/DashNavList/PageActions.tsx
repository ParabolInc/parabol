import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type * as Y from 'yjs'
import {Add as AddIcon} from '~/ui/icons'
import type {PageActions_page$key} from '../../__generated__/PageActions_page.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {hasMinPageRole} from '../../shared/hasMinPageRole'
import {createPageLinkElement} from '../../shared/tiptap/createPageLinkElement'
import {providerManager} from '../../tiptap/providerManager'
import {LeftNavItemButton} from './LeftNavItemButton'
import {LeftNavItemButtons} from './LeftNavItemButtons'
import {PageActionsMenu} from './PageActionsMenu'

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
        title
        parentPageId
        isPrivate
        isMeetingTOC
      }
    `,
    pageRef
  )
  const {id: pageId, access, isDatabase, title, parentPageId, isPrivate, isMeetingTOC} = page
  const {viewer: viewerAccess} = access
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  const isOwner = viewerAccess === 'owner'
  const canCopy = !isMeetingTOC && !!viewerAccess
  const showMenu = isOwner || canCopy
  const canEdit = hasMinPageRole('editor', viewerAccess)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      {showMenu && (
        <PageActionsMenu
          pageId={pageId}
          title={title}
          parentPageId={parentPageId}
          isPrivate={isPrivate}
          canCopy={canCopy}
          isOwner={isOwner}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}
      {!isDatabase && canEdit && (
        <LeftNavItemButton Icon={AddIcon} onClick={addChildPage} tooltip='Add a page inside' />
      )}
    </LeftNavItemButtons>
  )
}
