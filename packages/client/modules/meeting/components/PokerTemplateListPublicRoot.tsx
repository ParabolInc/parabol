import React, {Suspense} from 'react'
import MockTemplateList from './MockTemplateList'
import PokerTemplateListPublic from './PokerTemplateListPublic'
import pokerTemplateListPublicQuery, {
  PokerTemplateListPublicQuery
} from '../../../__generated__/PokerTemplateListPublicQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'

interface Props {
  isActive: boolean
  teamId: string
}

const PokerTemplateListPublicRoot = (props: Props) => {
  const {isActive, teamId} = props
  const queryRef = useQueryLoaderNow<PokerTemplateListPublicQuery>(pokerTemplateListPublicQuery, {
    teamId
  })
  if (!isActive) return null

  return (
    <Suspense fallback={<MockTemplateList />}>
      {queryRef && <PokerTemplateListPublic queryRef={queryRef} />}
    </Suspense>
  )
}

export default PokerTemplateListPublicRoot
