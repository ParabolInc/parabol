import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TeamDashInsights_insights$key} from '~/__generated__/TeamDashInsights_insights.graphql'
import Tooltip from '../../../../components/Tooltip'
import {Info as InfoIcon} from '@mui/icons-material'
import getReactji from '../../../../utils/getReactji'

interface Props {
  teamInsightsRef: TeamDashInsights_insights$key
}

const TeamDashInsights = (props: Props) => {
  const {teamInsightsRef} = props
  const insights = useFragment(
    graphql`
      fragment TeamDashInsights_insights on TeamInsights {
        id
        mostUsedEmojis {
          id
          count
        }
      }
    `,
    teamInsightsRef
  )

  const {mostUsedEmojis} = insights

  return (
    <div>
      <h3 className='mb-0 pl-2 text-base font-semibold'>Team Insights</h3>
      <div className='flex w-full flex-wrap'>
        {mostUsedEmojis && mostUsedEmojis.length > 0 && (
          <div className='relative m-2 flex w-[320px] flex-col rounded bg-white drop-shadow'>
            <div className='flex items-center justify-between'>
              <div className='p-4 text-sm font-semibold text-slate-600'>Favorite Reactions</div>
              <Tooltip text='Your team’s most used emoji reactions' className='pr-3 text-slate-600'>
                <InfoIcon />
              </Tooltip>
            </div>
            <div className='flex flex-row justify-center'>
              {mostUsedEmojis.map((emoji) => {
                const {unicode, shortName} = getReactji(emoji.id)
                return (
                  <div
                    key={emoji.id}
                    className='flex h-24 w-1/4 flex-col items-center justify-center'
                  >
                    <Tooltip text={`:${shortName}:`}>
                      <div className='text-2xl'>{unicode}</div>
                    </Tooltip>
                    <div className='p-2 font-semibold'>{emoji.count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default TeamDashInsights
