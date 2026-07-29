import {Suspense} from 'react'
import confluenceExportFormQuery, {
  type ConfluenceExportFormQuery
} from '../../__generated__/ConfluenceExportFormQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Loader} from '../../utils/relay/renderLoader'
import {ConfluenceExportForm, type ConfluenceExportFormProps} from './ConfluenceExportForm'

type Props = Omit<ConfluenceExportFormProps, 'queryRef'>

export const ConfluenceExportFormRoot = (props: Props) => {
  const queryRef = useQueryLoaderNow<ConfluenceExportFormQuery>(
    confluenceExportFormQuery,
    {teamId: props.teamId},
    'network-only'
  )
  return (
    <Suspense fallback={<Loader />}>
      {queryRef && <ConfluenceExportForm {...props} queryRef={queryRef} />}
    </Suspense>
  )
}
