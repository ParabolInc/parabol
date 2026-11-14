import {VisuallyHidden} from '@radix-ui/react-visually-hidden'
import {Suspense} from 'react'
import confluenceExportFormQuery, {
  type ConfluenceExportFormQuery
} from '../../__generated__/ConfluenceExportFormQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {Loader} from '../../utils/relay/renderLoader'
import {ConfluenceExportForm, type ConfluenceExportFormProps} from './ConfluenceExportForm'
import {readConfluenceExportDest} from './confluenceExportConstants'

type Props = Omit<ConfluenceExportFormProps, 'queryRef'>

export const ConfluenceExportFormRoot = (props: Props) => {
  const dest = readConfluenceExportDest(props.teamId)
  const queryRef = useQueryLoaderNow<ConfluenceExportFormQuery>(
    confluenceExportFormQuery,
    {teamId: props.teamId, preferredCloudId: dest?.cloudId ?? '', hasPreferred: !!dest},
    'network-only'
  )
  const loadingTitle = (
    <VisuallyHidden asChild>
      <DialogTitle>Export to Confluence</DialogTitle>
    </VisuallyHidden>
  )
  return (
    <Suspense
      fallback={
        <>
          {loadingTitle}
          <Loader />
        </>
      }
    >
      {queryRef ? <ConfluenceExportForm {...props} queryRef={queryRef} /> : loadingTitle}
    </Suspense>
  )
}
