import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {PageSharingQuery} from '../../__generated__/PageSharingQuery.graphql'
import {PageSharingAccessList} from './PageSharingAccessList'
import {PageSharingCopyLink} from './PageSharingCopyLink'
import {PageSharingInput} from './PageSharingInput'
import {PageSharingInviteOptions} from './PageSharingInviteOptions'
import {usePageSharingAutocomplete} from './usePageSharingAutocomplete'

interface Props {
  pageId: string
  queryRef: PreloadedQuery<PageSharingQuery>
}

export const PageSharing = (props: Props) => {
  const {queryRef} = props
  const query = usePreloadedQuery<PageSharingQuery>(
    graphql`
      query PageSharingQuery($pageId: ID!) {
        ...usePageSharingAutocomplete_query
        public {
          page(pageId: $pageId) {
            ...PageSharingAccessList_page
            id
          }
        }
      }
    `,
    queryRef
  )
  const page = query.public.page!
  const {
    getRootProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    setAnchorEl,
    error,
    value,
    setValue
  } = usePageSharingAutocomplete(query)
  return (
    <div className='flex w-96 flex-col bg-white pt-3 text-slate-700'>
      <div className='flex flex-col px-3'>
        <PageSharingInput
          pageId={page.id}
          setValue={setValue}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          getTagProps={getTagProps}
          setAnchorEl={setAnchorEl}
          value={value}
        />
        {error && <div className='mt-2 font-semibold text-sm text-tomato-500'>{error}</div>}
        {groupedOptions.length ? (
          <PageSharingInviteOptions
            getListboxProps={getListboxProps}
            getOptionProps={getOptionProps}
            groupedOptions={groupedOptions}
          />
        ) : (
          <PageSharingAccessList pageRef={page} />
        )}
      </div>
      <div className='border-slate-300 border-t p-3'>
        <PageSharingCopyLink />
      </div>
    </div>
  )
}
