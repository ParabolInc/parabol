import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import pokerTemplateListOrgQuery, {
  PokerTemplateListOrgQuery
} from '../../../__generated__/PokerTemplateListOrgQuery.graphql'
import MockTemplateList from './MockTemplateList'
import PokerTemplateListOrg from './PokerTemplateListOrg'

interface Props {
  teamId: string
}

const PokerTemplateListOrgRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<PokerTemplateListOrgQuery>(pokerTemplateListOrgQuery, {teamId})

  return (
    <Suspense fallback={<MockTemplateList />}>
      {queryRef && <PokerTemplateListOrg queryRef={queryRef} />}
    </Suspense>
  )
}

export default PokerTemplateListOrgRoot
