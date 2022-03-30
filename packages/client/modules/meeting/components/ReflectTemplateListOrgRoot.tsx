import React, {Suspense} from 'react'
import MockTemplateList from './MockTemplateList'
import ReflectTemplateListOrg from './ReflectTemplateListOrg'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import reflectTemplateListOrgQuery, {
  ReflectTemplateListOrgQuery
} from '../../../__generated__/ReflectTemplateListOrgQuery.graphql'

interface Props {
  isActive: boolean
  teamId: string
}

const ReflectTemplateListOrgRoot = (props: Props) => {
  const {isActive, teamId} = props
  const queryRef = useQueryLoaderNow<ReflectTemplateListOrgQuery>(reflectTemplateListOrgQuery, {
    teamId
  })
  if (!isActive) return null
  return (
    <Suspense fallback={<MockTemplateList />}>
      {queryRef && <ReflectTemplateListOrg queryRef={queryRef} />}
    </Suspense>
  )
}

export default ReflectTemplateListOrgRoot
