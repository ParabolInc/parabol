import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import SendClientSegmentEventMutation from '~/mutations/SendClientSegmentEventMutation'
import {Elevation} from '../styles/elevation'
import {InsightsQuery} from '../__generated__/InsightsQuery.graphql'
import InsightsCharts from './InsightsCharts'
import InsightsDomainPanel from './InsightsDomainPanel'
import Panel from './Panel/Panel'

interface Props {
  queryRef: PreloadedQuery<InsightsQuery>
}

const StatsPanel = styled(Panel)({
  boxShadow: Elevation.Z3,
  maxWidth: 520,
  marginLeft: 16,
  padding: 16
})

const Insights = (props: Props) => {
  const {queryRef} = props

  //FIXME i18n: Viewed domain stats
  const {t} = useTranslation()

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
      {domains.length === 0 && (
        <StatsPanel>{t('Insights.UsageStatsAreOnlyAvailableForQualifiedCustomers')}</StatsPanel>
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
