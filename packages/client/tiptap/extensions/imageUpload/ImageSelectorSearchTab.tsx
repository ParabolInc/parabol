import type {Editor} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {usePaginationFragment, usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {ImageSelectorSearchTabPaginationQuery} from '../../../__generated__/ImageSelectorSearchTabPaginationQuery.graphql'
import type {ImageSelectorSearchTabQuery} from '../../../__generated__/ImageSelectorSearchTabQuery.graphql'
import type {ImageSelectorSearchTabQuery_query$key} from '../../../__generated__/ImageSelectorSearchTabQuery_query.graphql'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import {cn} from '../../../ui/cn'

interface Props {
  editor: Editor
  queryRef: PreloadedQuery<ImageSelectorSearchTabQuery>
  searchQuery: string
  setSearchQuery: (query: string) => void
  setImageURL: (url: string) => void
}

export const ImageSelectorSearchTab = (props: Props) => {
  const {queryRef, setImageURL, searchQuery, setSearchQuery} = props
  const ref = useRef<HTMLInputElement>(null)

  const query = usePreloadedQuery<ImageSelectorSearchTabQuery>(
    graphql`
      query ImageSelectorSearchTabQuery($query: String!, $fetchOriginal: Boolean!) {
        ...ImageSelectorSearchTabQuery_query
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<
    ImageSelectorSearchTabPaginationQuery,
    ImageSelectorSearchTabQuery_query$key
  >(
    graphql`
      fragment ImageSelectorSearchTabQuery_query on Query
      @argumentDefinitions(after: {type: "String"}, first: {type: "Int", defaultValue: 20})
      @refetchable(queryName: "ImageSelectorSearchTabPaginationQuery") {
        searchGifs(query: $query, first: $first, after: $after)
          @connection(key: "ImageSelectorSearchTabQuery_searchGifs") {
          edges {
            node {
              previewUrl: url(size: tiny)
              originalUrl: url(size: original) @include(if: $fetchOriginal)
            }
          }
        }
      }
    `,
    query
  )
  const {data} = paginationRes
  const {searchGifs} = data
  const {edges} = searchGifs!
  const service = window.__ACTION__.GIF_PROVIDER
  // Per attribution spec, the exact wording is required
  // https://developers.google.com/tenor/guides/attribution
  const placeholder = service === 'tenor' ? 'Search Tenor' : 'Search Gifs'
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setSearchQuery(nextValue)
  }
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 20)
  return (
    <div className='flex flex-col overflow-hidden'>
      <form className='flex w-full min-w-44 flex-col items-center justify-center space-y-3 rounded-md bg-slate-100 p-2'>
        <input
          autoFocus
          placeholder={placeholder}
          value={searchQuery}
          className='w-full outline-hidden focus:ring-2'
          ref={ref}
          onChange={onChange}
        />
      </form>
      <div className='grid w-96 auto-rows-[1px] grid-cols-[repeat(auto-fit,minmax(112px,1fr))] gap-x-1 overflow-auto'>
        {edges.map((edge) => {
          const {node} = edge
          const {previewUrl, originalUrl} = node
          return (
            <button
              key={previewUrl}
              style={{gridRow: 'span 200'}} // initially too tall to prevent the lastItem from intersecting viewport
              className={cn('row-span w-full cursor-pointer rounded-sm')}
              onClick={() => {
                setImageURL(originalUrl || previewUrl)
              }}
            >
              <img
                src={previewUrl}
                className='rounded-sm'
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement
                  const button = img.parentElement!
                  button.style.setProperty('grid-row', `span ${img.height + 2}`)
                }}
              />
            </button>
          )
        })}
        {lastItem}
      </div>
    </div>
  )
}
