import * as Popover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import {
  CloudUpload as CloudUploadIcon,
  MoreHoriz as MoreHorizIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '~/ui/icons'
import type {PageHeader_page$key} from '../../__generated__/PageHeader_page.graphql'
import {
  ConfluenceNewBadge,
  dismissConfluenceBadge,
  showConfluenceBadge
} from '../../components/ExportToConfluence/ConfluenceNewBadge'
import {ExportToConfluenceRoot} from '../../components/ExportToConfluence/ExportToConfluenceRoot'
import useAtmosphere from '../../hooks/useAtmosphere'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import {PageBreadCrumbs} from './PageBreadCrumbs'
import {PageDeletedHeader} from './PageDeletedHeader'
import {PageSharingRoot} from './PageSharingRoot'

interface Props {
  pageRef: PageHeader_page$key
  showConfluenceExport: boolean
  isPageGenerating: boolean
}

export const PageHeader = (props: Props) => {
  const {pageRef, showConfluenceExport, isPageGenerating} = props
  const page = useFragment(
    graphql`
      fragment PageHeader_page on Page {
        ...PageBreadCrumbs_page
        ...PageDeletedHeader_page
        id
        deletedBy
      }
    `,
    pageRef
  )

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const sharePageDefaultOpen = searchParams.get('share') !== null
  const exportDeepLinked = searchParams.get('export') === 'confluence'
  const exportReport = searchParams.get('report') !== null
  const [exportOpen, setExportOpen] = useState(false)

  const {id: pageId, deletedBy} = page
  const atmosphere = useAtmosphere()
  const pageInTrash = !!deletedBy
  const isExportDisabled = isPageGenerating || pageInTrash
  const showBadge = showConfluenceExport && showConfluenceBadge()
  const openExportDialog = () => {
    SendClientSideEvent(atmosphere, 'Confluence Export CTA Clicked', {entryPoint: 'pageKebab'})
    setExportOpen(true)
  }
  // keyed on location.key so a same-route navigation (e.g. the completion toast's
  // "View report" while already on the page) still opens the dialog
  useEffect(() => {
    if (exportDeepLinked && showConfluenceExport) {
      setExportOpen(true)
      SendClientSideEvent(atmosphere, 'Confluence Export CTA Clicked', {entryPoint: 'deepLink'})
    }
  }, [location.key])
  return (
    <div className='sticky top-0 z-10 w-full bg-surface-document print:hidden'>
      <div className='flex items-center justify-between px-4 py-2'>
        <PageBreadCrumbs pageRef={page} />
        <div className='flex items-center justify-center space-x-3 pt-1 font-semibold text-md'>
          <Popover.Root
            key={`${page.id}-${sharePageDefaultOpen}`}
            defaultOpen={sharePageDefaultOpen}
          >
            <Popover.Trigger asChild>
              <button className='cursor-pointer'>Share</button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                asChild
                align='end'
                collisionPadding={8}
                className='z-10'
                onFocusOutside={(e) => {
                  // Prevent closing directly on first editor load
                  e.preventDefault()
                }}
              >
                <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg border border-hairline shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
                  <PageSharingRoot pageId={pageId} />
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <Menu
            trigger={
              <button className='relative flex size-6 cursor-pointer items-center justify-center rounded-md bg-surface-document px-0.5 font-semibold text-md hover:bg-surface-hover focus:bg-surface-hover'>
                <MoreHorizIcon className={'p-0.5'} />
                {showBadge && (
                  <span className='-top-0.5 -right-0.5 absolute size-2 rounded-full bg-rose-500' />
                )}
              </button>
            }
          >
            <MenuContent align='end' side={'bottom'} sideOffset={8} className='max-h-80'>
              <MenuItem
                onSelect={() => {
                  window.print()
                }}
              >
                <PictureAsPdfIcon className='text-fg-secondary' />
                <span className='pl-1'>{'Export to PDF'}</span>
              </MenuItem>
              {showConfluenceExport && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MenuItem
                      isDisabled={isExportDisabled}
                      onSelect={() => {
                        if (isExportDisabled) return
                        dismissConfluenceBadge()
                        openExportDialog()
                      }}
                    >
                      <CloudUploadIcon className='text-fg-secondary' />
                      <span className='pl-1'>{'Export to Confluence'}</span>
                      <ConfluenceNewBadge />
                    </MenuItem>
                  </TooltipTrigger>
                  {isExportDisabled && (
                    <TooltipContent side='left'>
                      {isPageGenerating
                        ? 'Available when the summary finishes generating'
                        : 'Restore the page to export it'}
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </MenuContent>
          </Menu>
          {exportOpen && showConfluenceExport && (
            <ExportToConfluenceRoot
              pageId={pageId}
              onClose={() => setExportOpen(false)}
              initialReport={exportReport}
            />
          )}
        </div>
      </div>
      <PageDeletedHeader pageRef={page} />
    </div>
  )
}
