import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {InsightsQuery} from '../__generated__/InsightsQuery.graphql'
import InsightsCharts from './InsightsCharts'
import InsightsDomainPanel from './InsightsDomainPanel'
import Panel from './Panel/Panel'

interface Props {
  queryRef: PreloadedQuery<InsightsQuery>
}

const DashSectionHeader = styled('h1')({
  color: PALETTE.SLATE_700,
  fontSize: 20,
  lineHeight: '28px',
  paddingLeft: 32
})

const StatsPanel = styled(Panel)({
  boxShadow: Elevation.Z3,
  maxWidth: 520,
  marginLeft: 16,
  padding: 16
})

const Insights = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<InsightsQuery>(
    graphql`
      query InsightsQuery {
        viewer {
          domains {
            id
            ...InsightsDomainPanel_domain
            ...InsightsCharts_domain
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  const {domains} = viewer
  const atmosphere = useAtmosphere()
  domains.forEach(({id: domainId}) => {
    SendClientSegmentEventMutation(atmosphere, 'Viewed domain stats', {
      domainId
    })
  })

  return (
    <div>
      <DashSectionHeader>Usage</DashSectionHeader>
      {domains.length === 0 && (
        <StatsPanel>Usage stats are only available for qualified customers</StatsPanel>
      )}
      {domains.map((domain) => {
        return (
          <React.Fragment key={domain.id}>
            <InsightsDomainPanel domainRef={domain} />
            <InsightsCharts domainRef={domain} />
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Insights
