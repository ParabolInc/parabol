import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {LeftNavSharedPagesSection_viewer$key} from '../../__generated__/LeftNavSharedPagesSection_viewer.graphql'
import {cn} from '../../ui/cn'
import {LeftNavHeader} from './LeftNavHeader'
import {LeftNavPageLink} from './LeftNavPageLink'

interface Props {
  viewerRef: LeftNavSharedPagesSection_viewer$key
}
export const LeftNavSharedPagesSection = (props: Props) => {
  const {viewerRef} = props
  const connectionKey = 'User_sharedPages'
  const viewer = useFragment(
    graphql`
      fragment LeftNavSharedPagesSection_viewer on User {
        draggingPageId
        draggingPageIsPrivate
        sharedPages: pages(parentPageId: $sharedPagesNull, first: 500, isPrivate: false)
          @connection(key: "User_sharedPages") {
          edges {
            node {
              ...LeftNavPageLink_page
              id
              title
              isPrivate
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {draggingPageId, draggingPageIsPrivate, sharedPages} = viewer
  const {edges} = sharedPages
  const firstPageId = edges[0]?.node.id
  const canDropBelow = draggingPageId && draggingPageId !== firstPageId && !draggingPageIsPrivate
  const lastPageId = edges.at(-1)?.node.id
  const canDropIn = draggingPageId && draggingPageId !== lastPageId && !draggingPageIsPrivate
  const [showChildren, setShowChildren] = useState(true)
  const toggleChildren = () => {
    setShowChildren(!showChildren)
  }
  return (
    <div className='min-h-9' data-pages-connection={'User_sharedPages'}>
      <div
        onClick={toggleChildren}
        data-drop-in={canDropIn ? '' : undefined}
        className={cn(
          'group flex flex-1 cursor-pointer items-center rounded-md py-0.5 pl-3 text-xs leading-5 font-semibold data-[drop-in]:hover:bg-sky-300/70',
          !draggingPageId && 'hover:bg-slate-300'
        )}
      >
        <LeftNavHeader>{'Shared Pages'}</LeftNavHeader>
      </div>
      <div className={cn('relative hidden', showChildren && 'block')}>
        <div
          className={cn(
            'absolute -top-0.5 left-0 z-20 hidden h-1 w-full hover:bg-sky-500/80 data-[drop-below]:flex',
            canDropBelow ? 'cursor-grabbing' : 'cursor-no-drop'
          )}
          data-drop-below={canDropBelow ? '' : undefined}
          data-drop-idx={-1}
        ></div>
        {edges.map((edge, idx) => {
          const {node} = edge
          const {id} = node
          return (
            <LeftNavPageLink
              key={id}
              pageRef={node}
              pageAncestors={[node.id]}
              draggingPageId={draggingPageId}
              dropIdx={idx}
              isLastChild={idx === edges.length - 1}
              nextPeerId={edges[idx + 1]?.node.id || null}
              connectionKey={connectionKey}
              draggingPageIsPrivate={draggingPageIsPrivate || null}
            />
          )
        })}
      </div>
    </div>
  )
}
