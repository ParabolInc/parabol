import {Suspense} from 'react'
import type {SubPagesQuery} from '../../__generated__/SubPagesQuery.graphql'
import query from '../../__generated__/SubPagesQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Loader} from '../../utils/relay/renderLoader'
import {SubPages} from './SubPages'

interface Props {
  parentPageId: string
}

export const SubPagesRoot = (props: Props) => {
  const {parentPageId} = props
  const queryRef = useQueryLoaderNow<SubPagesQuery>(query, {
    parentPageId
  })

  return <Suspense fallback={<Loader />}>{queryRef && <SubPages queryRef={queryRef} />}</Suspense>
}
