import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {InsightsQuery} from '../__generated__/InsightsQuery.graphql'
import InsightsDomainPanel from './InsightsDomainPanel'

interface Props {
  queryRef: PreloadedQuery<InsightsQuery>
}

const Insights = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<InsightsQuery>(
    graphql`
      query InsightsQuery {
        viewer {
          domains {
            id
            ...InsightsDomainPanel_domain
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  const {domains} = viewer

  return (
    <div>
      {domains.map((domain) => {
        return <InsightsDomainPanel key={domain.id} domainRef={domain} />
      })}
    </div>
  )
}

export default Insights
