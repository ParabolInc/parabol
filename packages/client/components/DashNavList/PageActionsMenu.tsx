import {useRef, useState} from 'react'
import {useNavigate} from 'react-router'
import {
  AddToPhotos as CopyToIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon
} from '~/ui/icons'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useDuplicatePageMutation} from '../../mutations/useDuplicatePageMutation'
import type {MoveToPageAnchorRect} from '../../tiptap/blockMove/openMoveToPageMenu'
import CopyToPageMenu from '../../tiptap/extensions/moveToPage/CopyToPageMenu'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {GQLID} from '../../utils/GQLID'
import {runDuplicatePage} from '../../utils/runDuplicatePage'
import {PageActionsTrigger} from './PageActionsTrigger'
import {useArchivePageWithUndo} from './useArchivePageWithUndo'

interface Props {
  pageId: string
  title?: string | null
  parentPageId?: string | null
  isPrivate?: boolean | null
  canCopy: boolean
  isOwner: boolean
  isMenuOpen: boolean
  setIsMenuOpen: (isOpen: boolean) => void
}

export const PageActionsMenu = (props: Props) => {
  const {pageId, title, parentPageId, isPrivate, canCopy, isOwner} = props
  const {isMenuOpen, setIsMenuOpen} = props
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  const archivePage = useArchivePageWithUndo(pageId)
  const [executeDuplicate, submitting] = useDuplicatePageMutation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [copyToAnchor, setCopyToAnchor] = useState<MoveToPageAnchorRect | null>(null)
  const [pageCode] = GQLID.fromKey(pageId)

  const duplicatePage = () => {
    if (submitting) return
    runDuplicatePage({
      pageCode,
      title: title ?? '',
      destination: {kind: 'nextToSource', source: {parentPageId, isPrivate}},
      execute: executeDuplicate,
      atmosphere,
      navigate
    })
  }

  const openCopyTo = () => {
    if (submitting) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCopyToAnchor({top: rect.top, left: rect.left, width: rect.width, height: rect.height})
  }

  return (
    <div className='flex size-6 items-center justify-center rounded-sm hover:bg-surface-nav-button-hover'>
      <Menu
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        trigger={<PageActionsTrigger buttonRef={triggerRef} isMenuOpen={isMenuOpen} />}
      >
        <MenuContent align='center' side={'right'} sideOffset={8} className='max-h-80'>
          {canCopy && (
            <>
              <MenuItem isDisabled={submitting} aria-disabled={submitting} onSelect={duplicatePage}>
                <DuplicateIcon className='text-fg-secondary' />
                <span className='pl-1'>{'Duplicate'}</span>
              </MenuItem>
              <MenuItem isDisabled={submitting} aria-disabled={submitting} onSelect={openCopyTo}>
                <CopyToIcon className='text-fg-secondary' />
                <span className='pl-1'>{'Copy to…'}</span>
              </MenuItem>
            </>
          )}
          {isOwner && (
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
          )}
        </MenuContent>
      </Menu>
      {copyToAnchor && (
        <CopyToPageMenu
          pageCode={pageCode}
          title={title ?? ''}
          anchorRect={copyToAnchor}
          onClose={() => setCopyToAnchor(null)}
        />
      )}
    </div>
  )
}
