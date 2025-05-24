import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {LeftNavPagesSection_page$key} from '../../__generated__/LeftNavPagesSection_page.graphql'
import {cn} from '../../ui/cn'
import {LeftNavPageLink} from './LeftNavPageLink'
interface Props {
  title: string
  pageRef: LeftNavPagesSection_page$key
  draggingPageId: string | null | undefined
}
export const LeftNavPagesSection = (props: Props) => {
  const {title, pageRef, draggingPageId} = props
  const pageArray = useFragment(
    graphql`
      fragment LeftNavPagesSection_page on Page @relay(plural: true) {
        ...LeftNavPageLink_page
        id
        title
      }
    `,
    pageRef
  )
  const firstPageId = pageArray[0]?.id
  const canDropBelow = draggingPageId && draggingPageId !== firstPageId
  return (
    <div>
      <div className='flex-1 py-1.5 pl-3 text-xs leading-5 font-semibold text-slate-700'>
        {title}
      </div>
      <div className='relative'>
        <div
          className={cn(
            'absolute -top-0.5 left-0 z-20 hidden h-1 w-full hover:bg-sky-500/80 data-[drop-below]:flex',
            canDropBelow ? 'cursor-grabbing' : 'cursor-no-drop'
          )}
          data-drop-below={canDropBelow ? '' : undefined}
        ></div>
        {pageArray.map((page, idx) => {
          const {id} = page
          return (
            <LeftNavPageLink
              key={id}
              pageRef={page}
              pageAncestors={[page.id]}
              draggingPageId={draggingPageId}
              isFirstChild={idx === 0}
              isLastChild={idx === pageArray.length - 1}
              nextPeerId={pageArray[idx + 1]?.id || null}
            />
          )
        })}
      </div>
    </div>
  )
}
