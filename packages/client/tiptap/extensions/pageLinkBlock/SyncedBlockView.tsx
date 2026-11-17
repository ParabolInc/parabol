import {isNodeSelection, type NodeViewProps, NodeViewWrapper, useEditorState} from '@tiptap/react'
import {type FocusEvent, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {fetchQuery} from 'relay-runtime'
import syncedBlockPlacesQuery, {
  type SyncedBlockPlacesQuery
} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {cn} from '../../../ui/cn'
import {GQLID} from '../../../utils/GQLID'
import {copySyncedBlock} from './copySyncedBlock'
import {getSyncedBlockEventTarget} from './getSyncedBlockEventTarget'
import {markSyncedBlockPlacesStale} from './getSyncedBlockPlacesFetchPolicy'
import {isValidPageCode} from './isValidPageCode'
import {SyncedBlockBar} from './SyncedBlockBar'
import {SyncedBlockCaption} from './SyncedBlockCaption'
import {SyncedBlockContent} from './SyncedBlockContent'
import {SyncedBlockDialogs} from './SyncedBlockDialogs'
import type {SyncedBlockChrome} from './SyncedBlockEditor'
import {SyncedBlockMoreMenu} from './SyncedBlockMoreMenu'
import {SyncedBlockNameInput} from './SyncedBlockNameInput'
import {SyncedBlockPlacesRoot} from './SyncedBlockPlacesRoot'
import {SyncedBlockState} from './SyncedBlockState'
import {SYNCED_BLOCK_RENAME_EVENT} from './startSyncedBlockRename'
import {
  clearSyncedBlockFocusRequest,
  hasSyncedBlockFocusRequest,
  isCaretBesideLink,
  placeInNested
} from './syncedBlockFocus'
import {canNestSyncedBlock, getEnclosingChain, SyncedBlockChainContext} from './syncedBlockNesting'
import {useMountNearViewport} from './useMountNearViewport'
import {useSyncedBlockDialog} from './useSyncedBlockDialog'
import {useSyncedBlockName} from './useSyncedBlockName'
import type {SyncedBlockStatus} from './useSyncedBlockProvider'

const noop = () => {}

export const SyncedBlockView = (props: NodeViewProps) => {
  const {node, editor, getPos} = props
  const atmosphere = useAtmosphere()
  const pageCode = Number(node.attrs.pageCode)
  const sizeRef = useRef(node.nodeSize)
  sizeRef.current = node.nodeSize
  const providedChain = useContext(SyncedBlockChainContext)
  const chain = getEnclosingChain(providedChain, editor.storage.pageLinkBlock.pageId)
  const nestedChain = useMemo(() => [...chain, pageCode], [chain.join(','), pageCode])
  const canNest = canNestSyncedBlock(chain, pageCode)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isNearViewport = useMountNearViewport(wrapperRef)
  const [chrome, setChrome] = useState<SyncedBlockChrome | null>(null)
  const [focusRequest, setFocusRequest] = useState(() =>
    hasSyncedBlockFocusRequest(node) ? node : null
  )
  const [status, setStatus] = useState<SyncedBlockStatus>('loading')
  const isPanel = status === 'locked' || status === 'error'
  const [hasFocusWithin, setHasFocusWithin] = useState(false)
  const [openMenus, setOpenMenus] = useState(0)
  const [isRenaming, setIsRenaming] = useState(false)
  const [placesLabel, setPlacesLabel] = useState<string | null>(null)
  const canRenameRef = useRef(false)
  const isNodeSelected = useEditorState({
    editor,
    selector: ({editor: hostEditor}) => {
      const {selection} = hostEditor.state
      return isNodeSelection(selection) && selection.from === getPos()
    }
  })
  const name = useSyncedBlockName(chrome?.editor ?? null)
  const isViewOnly = chrome?.isViewOnly ?? false
  canRenameRef.current = !!chrome && !isViewOnly
  const {dialog, isCheckingUnsync, closeDialog} = useSyncedBlockDialog({
    wrapperRef,
    editor,
    getPos,
    pageCode
  })
  const isHeldOpen = openMenus > 0 || isRenaming || isCheckingUnsync || dialog !== null
  const isFocused = hasFocusWithin || isNodeSelected
  const showBar = !!chrome && (isFocused || isHeldOpen)
  const showBarRef = useRef(showBar)
  showBarRef.current = showBar
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (isHeldOpen) return
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setHasFocusWithin(false)
    }
  }
  const handleMenuOpenChange = useCallback((open: boolean) => {
    setOpenMenus((count) => Math.max(0, count + (open ? 1 : -1)))
  }, [])
  const handlePlacementsChange = useCallback(() => {
    markSyncedBlockPlacesStale(pageCode)
    if (!showBarRef.current) return
    fetchQuery<SyncedBlockPlacesQuery>(
      atmosphere,
      syncedBlockPlacesQuery,
      {pageId: GQLID.toKey(pageCode, 'page')},
      {fetchPolicy: 'network-only'}
    ).subscribe({error: () => {}})
  }, [atmosphere, pageCode])
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const target = getSyncedBlockEventTarget(wrapper)
    const handleRename = () => {
      if (canRenameRef.current) setIsRenaming(true)
    }
    target.addEventListener(SYNCED_BLOCK_RENAME_EVENT, handleRename)
    return () => target.removeEventListener(SYNCED_BLOCK_RENAME_EVENT, handleRename)
  }, [])
  useEffect(() => {
    if (!focusRequest || !chrome || chrome.isViewOnly) return
    setFocusRequest(null)
    clearSyncedBlockFocusRequest(focusRequest)
    const pos = getPos()
    if (pos !== undefined && isCaretBesideLink(editor, pos, sizeRef.current)) {
      placeInNested(chrome.editor, 'end', null)
    }
  }, [focusRequest, chrome])
  useEffect(() => {
    if (isHeldOpen) return
    const timer = setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) setHasFocusWithin(false)
    })
    return () => clearTimeout(timer)
  }, [isHeldOpen])
  const isInvalid = !isValidPageCode(pageCode)
  const dataStatus = isInvalid || !canNest ? 'ready' : !isNearViewport ? 'loading' : status
  return (
    <NodeViewWrapper
      ref={wrapperRef}
      data-synced-block
      data-status={dataStatus}
      tabIndex={-1}
      onFocus={() => setHasFocusWithin(true)}
      onBlur={handleBlur}
      className={cn(
        '@min-[852px]/page:-mr-3 @min-[852px]/page:-ml-9 relative mb-3 rounded-md px-3 py-1 @min-[852px]/page:pl-9 outline outline-1 outline-transparent print:mx-0! print:px-0! print:outline-none',
        isPanel ? 'mt-3!' : 'mt-9! print:mt-3!',
        'before:-top-9 before:-left-[26px] before:absolute before:bottom-0 before:w-[38px] before:content-[""]',
        !showBar && 'hover:outline-hairline-strong',
        showBar &&
          (isViewOnly
            ? 'outline-hairline-strong'
            : 'rounded-t-none outline-2 outline-accent-active')
      )}
    >
      {showBar ? (
        <SyncedBlockBar
          name={name}
          isOriginal={node.attrs.canonical === true}
          isViewOnly={isViewOnly}
          places={
            <SyncedBlockPlacesRoot
              pageCode={pageCode}
              currentPageId={editor.storage.pageLinkBlock.pageId}
              isViewOnly={isViewOnly}
              lastLabel={placesLabel}
              onLabel={setPlacesLabel}
              onOpenChange={handleMenuOpenChange}
            />
          }
          more={
            isViewOnly ? null : (
              <SyncedBlockMoreMenu
                hostEditor={editor}
                getPos={getPos}
                pageCode={pageCode}
                isOriginal={node.attrs.canonical === true}
                currentPageId={editor.storage.pageLinkBlock.pageId}
                onOpenChange={handleMenuOpenChange}
              />
            )
          }
          renameInput={
            isRenaming && chrome && !isViewOnly ? (
              <SyncedBlockNameInput
                chrome={chrome}
                name={name}
                hostEditor={editor}
                getPos={getPos}
                onClose={() => setIsRenaming(false)}
              />
            ) : null
          }
          onStartRename={() => setIsRenaming(true)}
          onCopy={() =>
            copySyncedBlock({pageCode, title: node.attrs.title}, chrome?.editor ?? null, atmosphere)
          }
        />
      ) : (
        !isPanel && <SyncedBlockCaption name={name} />
      )}
      {isInvalid ? (
        <div className='h-6 rounded-sm bg-surface-hover' />
      ) : !isNearViewport ? (
        <SyncedBlockState status='loading' pageCode={pageCode} onRetry={noop} />
      ) : canNest ? (
        <SyncedBlockChainContext.Provider value={nestedChain}>
          <SyncedBlockContent
            key={pageCode}
            pageCode={pageCode}
            hostEditor={editor}
            getPos={getPos}
            getSize={() => sizeRef.current}
            onChromeChange={setChrome}
            onStatusChange={setStatus}
            onPlacementsChange={handlePlacementsChange}
          />
        </SyncedBlockChainContext.Provider>
      ) : (
        <div
          contentEditable={false}
          className='flex min-h-6 items-center rounded-sm bg-surface-hover px-2 text-fg-muted text-sm'
        >
          This synced block can't be shown inside itself.
        </div>
      )}
      <SyncedBlockDialogs
        dialog={dialog}
        hostEditor={editor}
        getPos={getPos}
        pageCode={pageCode}
        name={name}
        onClose={closeDialog}
      />
    </NodeViewWrapper>
  )
}
