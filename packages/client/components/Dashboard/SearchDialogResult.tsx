import DescriptionIcon from '@mui/icons-material/Description'
import graphql from 'babel-plugin-relay/macro'
import DOMPurify from 'dompurify'
import {type ReactNode, useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import type {SearchDialogResult_edge$key} from '../../__generated__/SearchDialogResult_edge.graphql'
import {getPageSlug} from '../../tiptap/getPageSlug'
import {GQLID} from '../../utils/GQLID'

interface Props {
  edgeRef: SearchDialogResult_edge$key
  closeSearch: () => void
  isActive?: boolean
}
export const SearchDialogResult = ({edgeRef, closeSearch, isActive}: Props) => {
  const data = useFragment(
    graphql`
  fragment SearchDialogResult_edge on SearchResultEdge {
    snippets
    node {
      __typename
      ... on Page {
        id
        title
      }
      ... on MeetingTemplate {
        id
        name
        category
      }
    }
  }`,
    edgeRef
  )
  const {snippets, node} = data
  const {__typename, title, id} = node
  const iconLookup = {
    Page: <DescriptionIcon />
  } satisfies Record<Exclude<typeof __typename, '%other'>, ReactNode>
  const icon = iconLookup[__typename as keyof typeof iconLookup]
  const safeSnippets = snippets.map((snippet) => DOMPurify.sanitize(snippet))
  const [firstSnippet] = safeSnippets

  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive) {
      itemRef.current?.scrollIntoView({block: 'nearest'})
    }
  }, [isActive])

  if (!icon) {
    console.error('No icon provided for', __typename)
    return null
  }
  const [pageCode] = GQLID.fromKey(id!)
  const slug = getPageSlug(Number(pageCode), title)
  return (
    <div
      ref={itemRef}
      data-highlighted={isActive ? '' : undefined}
      className={`group flex cursor-pointer scroll-mt-4 items-center gap-3 rounded-md px-3 py-1 transition-colors hover:bg-slate-200 data-highlighted:bg-slate-200`}
    >
      <div className='text-slate-600 transition-colors group-hover:text-slate-700'>{icon}</div>
      <Link
        draggable={false}
        to={`/pages/${slug}`}
        className={'ml-1 flex w-full items-center'}
        onClick={closeSearch}
      >
        <div className='flex flex-col'>
          <span className='font-normal text-[14px] text-slate-800'>{title}</span>
          {firstSnippet && (
            <span
              className='text-slate-700 text-xs'
              dangerouslySetInnerHTML={{
                __html: firstSnippet
              }}
            />
          )}
        </div>
      </Link>
    </div>
  )
}
