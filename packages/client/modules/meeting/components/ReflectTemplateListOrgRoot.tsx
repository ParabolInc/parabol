import React, {Suspense} from 'react'
import reflectTemplateListOrgQuery, {
  ReflectTemplateListOrgQuery
} from '../../../__generated__/ReflectTemplateListOrgQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import MockTemplateList from './MockTemplateList'
import ReflectTemplateListOrg from './ReflectTemplateListOrg'

interface Props {
  teamId: string
}

const ReflectTemplateListOrgRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<ReflectTemplateListOrgQuery>(reflectTemplateListOrgQuery, {
    teamId
  })
  return (
    <Suspense fallback={<MockTemplateList />}>
      {queryRef && <ReflectTemplateListOrg queryRef={queryRef} />}
    </Suspense>
  )
}

export default ReflectTemplateListOrgRoot
