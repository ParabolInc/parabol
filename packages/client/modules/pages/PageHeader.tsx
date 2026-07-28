import * as Popover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {useLocation} from 'react-router'
import {MoreHoriz as MoreHorizIcon, PictureAsPdf as PictureAsPdfIcon} from '~/ui/icons'
import type {PageHeader_page$key} from '../../__generated__/PageHeader_page.graphql'
import {ExportToConfluenceRoot} from '../../components/ExportToConfluence/ExportToConfluenceRoot'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {PageBreadCrumbs} from './PageBreadCrumbs'
import {PageDeletedHeader} from './PageDeletedHeader'
import {PageSharingRoot} from './PageSharingRoot'

interface Props {
  pageRef: PageHeader_page$key
}

export const PageHeader = (props: Props) => {
  const {pageRef} = props
  const page = useFragment(
    graphql`
      fragment PageHeader_page on Page {
        ...PageBreadCrumbs_page
        ...PageDeletedHeader_page
        id
      }
    `,
    pageRef
  )

  const searchParams = new URLSearchParams(useLocation().search)
  const sharePageDefaultOpen = searchParams.get('share') !== null
  const exportDeepLinked = searchParams.get('export') === 'confluence'
  const exportReport = searchParams.get('report') !== null
  const [exportOpen, setExportOpen] = useState(exportDeepLinked)

  const {id: pageId} = page
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
              <button className='flex size-6 cursor-pointer items-center justify-center rounded-md bg-surface-document px-0.5 font-semibold text-md hover:bg-surface-hover focus:bg-surface-hover'>
                <MoreHorizIcon className={'p-0.5'} />
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
            </MenuContent>
          </Menu>
          {exportOpen && (
            <ExportToConfluenceRoot
              pageId={pageId}
              onClose={() => setExportOpen(false)}
              entryPoint={searchParams.get('utm_medium') === 'email' ? 'emailDeepLink' : 'deepLink'}
              initialReport={exportReport}
            />
          )}
        </div>
      </div>
      <PageDeletedHeader pageRef={page} />
    </div>
  )
}
