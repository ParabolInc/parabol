import React, {Suspense} from 'react'
import MockTemplateList from './MockTemplateList'
import ReflectTemplateListPublic from './ReflectTemplateListPublic'
import reflectTemplateListPublicQuery, {
  ReflectTemplateListPublicQuery
} from '../../../__generated__/ReflectTemplateListPublicQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'

interface Props {
  isActive: boolean
  teamId: string
}

const ReflectTemplateListPublicRoot = (props: Props) => {
  const {isActive, teamId} = props
  const queryRef = useQueryLoaderNow<ReflectTemplateListPublicQuery>(
    reflectTemplateListPublicQuery,
    {
      teamId
    }
  )
  if (!isActive) return null
  return (
    <Suspense fallback={<MockTemplateList />}>
      {queryRef && <ReflectTemplateListPublic queryRef={queryRef} />}
    </Suspense>
  )
}

export default ReflectTemplateListPublicRoot
