import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {PageSharingQuery} from '../../__generated__/PageSharingQuery.graphql'
import {PageSharingAccessList} from './PageSharingAccessList'
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
        viewer {
          ...usePageSharingAutocomplete_viewer
          page(pageId: $pageId) {
            ...PageSharingAccessList_page
            id
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = query
  const {page} = viewer
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
  } = usePageSharingAutocomplete(viewer)
  return (
    <div className='flex max-h-96 w-96 flex-col bg-white p-4 pb-0 text-slate-700'>
      <PageSharingInput
        pageId={page.id}
        setValue={setValue}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        getTagProps={getTagProps}
        setAnchorEl={setAnchorEl}
        value={value}
      />
      {error && <div className='mt-2 text-sm font-semibold text-tomato-500'>{error}</div>}
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
  )
}
