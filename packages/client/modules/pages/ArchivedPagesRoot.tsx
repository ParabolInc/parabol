import {Suspense} from 'react'
import type {ArchivedPagesQuery} from '../../__generated__/ArchivedPagesQuery.graphql'
import archivedPagesQuery from '../../__generated__/ArchivedPagesQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {ArchivedPages} from './ArchivedPages'

interface Props {}

export const ArchivedPagesRoot = (_props: Props) => {
  const queryRef = useQueryLoaderNow<ArchivedPagesQuery>(archivedPagesQuery, {}, undefined, true)
  return <Suspense fallback={''}>{queryRef && <ArchivedPages queryRef={queryRef} />}</Suspense>
}
