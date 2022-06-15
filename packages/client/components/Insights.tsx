import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useSegmentTrack from '~/hooks/useSegmentTrack'
import {PALETTE} from '../styles/paletteV3'
import {InsightsQuery} from '../__generated__/InsightsQuery.graphql'
import InsightsDomainPanel from './InsightsDomainPanel'

interface Props {
  queryRef: PreloadedQuery<InsightsQuery>
}

const DashSectionHeader = styled('h1')({
  color: PALETTE.SLATE_700,
  fontSize: 20,
  lineHeight: '28px',
  paddingLeft: 32
})

const Insights = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<InsightsQuery>(
    graphql`
      query InsightsQuery {
        viewer {
          id
          company {
            id
          }
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
  const {id: viewerId, domains, company} = viewer
  useSegmentTrack('Viewed domain stats', {viewerId, companyId: company?.id})

  return (
    <div>
      <DashSectionHeader>Usage</DashSectionHeader>
      {domains.map((domain) => {
        return <InsightsDomainPanel key={domain.id} domainRef={domain} />
      })}
    </div>
  )
}

export default Insights
