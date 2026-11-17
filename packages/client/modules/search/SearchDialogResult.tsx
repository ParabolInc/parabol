import graphql from 'babel-plugin-relay/macro'
import DOMPurify from 'dompurify'
import {type ReactNode, useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import {Autorenew, Description as DescriptionIcon} from '~/ui/icons'
import type {SearchDialogResult_edge$key} from '../../__generated__/SearchDialogResult_edge.graphql'
import TypeAheadLabel from '../../components/TypeAheadLabel'
import {getSearchResultHref} from './getSearchResultHref'

interface Props {
  edgeRef: SearchDialogResult_edge$key
  closeSearch: () => void
  isActive?: boolean
  setSelectedIndex: () => void
  query?: string
}
export const SearchDialogResult = ({
  edgeRef,
  closeSearch,
  isActive,
  setSelectedIndex,
  query = ''
}: Props) => {
  const data = useFragment(
    graphql`
  fragment SearchDialogResult_edge on SearchResultEdge {
    snippets
    node {
      __typename
      ... on Page {
        id
        title
        isSyncedBlock
        ...getSearchResultHref_page
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
  const {__typename, title} = node
  const iconLookup = {
    Page: node.isSyncedBlock ? <Autorenew /> : <DescriptionIcon />
  } satisfies Record<Exclude<typeof __typename, '%other'>, ReactNode>
  const icon = iconLookup[__typename as keyof typeof iconLookup]
  // snippets are page text with <b> highlights, so any other markup came from the page itself
  const safeSnippets = snippets.map((snippet) =>
    DOMPurify.sanitize(snippet, {ALLOWED_TAGS: ['b'], ALLOWED_ATTR: []})
  )
  const [firstSnippet] = safeSnippets
  const wordPattern = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
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
  return (
    <div
      ref={itemRef}
      onFocus={() => {
        setSelectedIndex()
      }}
      data-highlighted={isActive ? '' : undefined}
      className={`group flex cursor-pointer scroll-mt-4 items-center gap-3 rounded-md px-3 py-1 outline-none transition-colors hover:bg-surface-hover data-highlighted:bg-surface-hover`}
    >
      <div className='text-fg-secondary transition-colors group-hover:text-fg-primary group-data-highlighted:text-fg-primary'>
        {icon}
      </div>
      <Link
        tabIndex={-1}
        draggable={false}
        to={getSearchResultHref(node)}
        className={'ml-1 flex w-full items-center'}
        onClick={closeSearch}
      >
        <div className='flex flex-col'>
          <TypeAheadLabel
            query={wordPattern}
            label={title || '<Untitled>'}
            className='font-normal text-[14px] text-fg-primary'
          />
          {firstSnippet && (
            <span
              className='text-fg-secondary text-xs'
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
