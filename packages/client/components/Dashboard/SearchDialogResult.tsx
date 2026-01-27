import DescriptionIcon from '@mui/icons-material/Description'
import graphql from 'babel-plugin-relay/macro'
import DOMPurify from 'dompurify'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {SearchDialogResult_edge$key} from '../../__generated__/SearchDialogResult_edge.graphql'

interface Props {
  edgeRef: SearchDialogResult_edge$key
}
export const SearchDialogResult = ({edgeRef}: Props) => {
  const data = useFragment(
    graphql`
  fragment SearchDialogResult_edge on SearchResultEdge {
    snippets
    node {
      __typename
      ... on Page {
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
  const {__typename, title} = node
  const iconLookup = {
    Page: <DescriptionIcon />
  } satisfies Record<Exclude<typeof __typename, '%other'>, ReactNode>
  const icon = iconLookup[__typename as keyof typeof iconLookup]
  const safeSnippets = snippets.map((snippet) => DOMPurify.sanitize(snippet))
  const [firstSnippet] = safeSnippets
  if (!icon) {
    console.error('No icon provided for', __typename)
    return null
  }
  return (
    <div className='group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-100'>
      <div className='text-gray-400 transition-colors group-hover:text-blue-500'>{icon}</div>
      <div className='flex flex-col'>
        <span className='font-normal text-[14px] text-gray-700'>{title}</span>
        {firstSnippet && (
          <span
            className='text-gray-400 text-xs'
            dangerouslySetInnerHTML={{
              __html: firstSnippet
            }}
          />
        )}
      </div>
    </div>
  )
}
