import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import pokerTemplateListPublicQuery, {
  PokerTemplateListPublicQuery
} from '../../../__generated__/PokerTemplateListPublicQuery.graphql'
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
