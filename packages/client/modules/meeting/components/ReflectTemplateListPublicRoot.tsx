import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import reflectTemplateListPublicQuery, {
  ReflectTemplateListPublicQuery
} from '../../../__generated__/ReflectTemplateListPublicQuery.graphql'
import MockTemplateList from './MockTemplateList'
import ReflectTemplateListPublic from './ReflectTemplateListPublic'

interface Props {
  teamId: string
}

const ReflectTemplateListPublicRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<ReflectTemplateListPublicQuery>(
    reflectTemplateListPublicQuery,
    {
      teamId
    }
  )
  return (
    <Suspense fallback={<MockTemplateList />}>
      {queryRef && <ReflectTemplateListPublic queryRef={queryRef} />}
    </Suspense>
  )
}

export default ReflectTemplateListPublicRoot
