import React, {Suspense} from 'react'
import pokerTemplateListPublicQuery, {
  PokerTemplateListPublicQuery
} from '../../../__generated__/PokerTemplateListPublicQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import MockTemplateList from './MockTemplateList'
import PokerTemplateListPublic from './PokerTemplateListPublic'

interface Props {
  teamId: string
}

const PokerTemplateListPublicRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<PokerTemplateListPublicQuery>(pokerTemplateListPublicQuery, {
    teamId
  })

  return (
    <Suspense fallback={<MockTemplateList />}>
      {queryRef && <PokerTemplateListPublic queryRef={queryRef} />}
    </Suspense>
  )
}

export default PokerTemplateListPublicRoot
