import React, {Suspense} from 'react'
import MockTemplateList from './MockTemplateList'
import PokerTemplateListOrg from './PokerTemplateListOrg'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import pokerTemplateListOrgQuery, {
  PokerTemplateListOrgQuery
} from '../../../__generated__/PokerTemplateListOrgQuery.graphql'

interface Props {
  isActive: boolean
  teamId: string
}

const PokerTemplateListOrgRoot = (props: Props) => {
  const {isActive, teamId} = props
  const queryRef = useQueryLoaderNow<PokerTemplateListOrgQuery>(pokerTemplateListOrgQuery, {teamId})

  if (!isActive) return null

  return (
    <Suspense fallback={<MockTemplateList />}>
      {queryRef && <PokerTemplateListOrg queryRef={queryRef} />}
    </Suspense>
  )
}

export default PokerTemplateListOrgRoot
