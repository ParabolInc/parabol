import * as Popover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {PageHeader_page$key} from '../../__generated__/PageHeader_page.graphql'
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

  const {id: pageId} = page
  return (
    <>
      <div className='flex w-full items-center justify-between pt-2'>
        <PageBreadCrumbs pageRef={page} />
        <div className='px-2'>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className='cursor-pointer bg-white pt-1 font-semibold text-md'>Share</button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content asChild align='end' alignOffset={8} collisionPadding={8}>
                <div className='top-0 left-0 flex max-h-[var(--radix-popper-available-height)] max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'>
                  <PageSharingRoot pageId={pageId} />
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
      <PageDeletedHeader pageRef={page} />
    </>
  )
}
