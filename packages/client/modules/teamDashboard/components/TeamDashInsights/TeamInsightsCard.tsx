import {Info as InfoIcon, ThumbDown, ThumbUp} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {ReactNode, useState} from 'react'
import {useFragment} from 'react-relay'
import {TeamInsightsCard_insights$key} from '../../../../__generated__/TeamInsightsCard_insights.graphql'
import FlatButton from '../../../../components/FlatButton'
import SimpleTooltip from '../../../../components/SimpleTooltip'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import TeamInsightsId from '../../../../shared/gqlIds/TeamInsightsId'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'

interface Props {
  title: string
  tooltip: string
  children: ReactNode
  teamInsightsRef: TeamInsightsCard_insights$key
}

const TeamInsightsCard = (props: Props) => {
  const {children, teamInsightsRef, title, tooltip} = props
  const [isHelpful, setIsHelpful] = useState<boolean>()

  const insights = useFragment(
    graphql`
      fragment TeamInsightsCard_insights on TeamInsights {
        id
      }
    `,
    teamInsightsRef
  )

  const {id} = insights
  const teamId = TeamInsightsId.split(id)

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const trackClick = (isHelpfulInsight: boolean) => {
    SendClientSideEvent(atmosphere, 'Insight Card Feedback Clicked', {
      viewerId,
      teamId,
      insightTitle: title,
      isHelpfulInsight
    })
    setIsHelpful(isHelpfulInsight)
  }

  return (
    <div className='relative m-2 flex w-[320px] flex-col overflow-hidden rounded bg-white drop-shadow'>
      <div className='flex items-center justify-between'>
        <div className='p-4 text-sm font-semibold text-slate-600'>{title}</div>
        <SimpleTooltip text={tooltip} className='pr-3 text-slate-600'>
          <InfoIcon />
        </SimpleTooltip>
      </div>
      <div className='flex flex-grow flex-col justify-center p-4 pt-0'>{children}</div>
      <div className='flex items-center justify-center bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600'>
        <div className='grow'>Is this helpful?</div>
        <FlatButton
          className={clsx('mx-4 p-0', isHelpful === false ? 'text-slate-800' : 'text-slate-500')}
          onClick={() => trackClick(false)}
        >
          <ThumbDown />
        </FlatButton>
        <FlatButton
          className={clsx('p-0', isHelpful ? 'text-slate-800' : 'text-slate-500')}
          onClick={() => trackClick(true)}
        >
          <ThumbUp />
        </FlatButton>
      </div>
    </div>
  )
}

export default TeamInsightsCard
