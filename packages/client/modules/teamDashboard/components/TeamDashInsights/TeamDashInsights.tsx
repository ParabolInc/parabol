import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {unifiedToNative} from 'emoji-mart/dist-modern/utils/index.js'
import {TeamDashInsights_insights$key} from '~/__generated__/TeamDashInsights_insights.graphql'
import emojis from '../../../../utils/emojis'

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
      <h3 className='mb-0 text-base font-semibold'>Team Insights</h3>
      <div className='flex w-full flex-wrap'>
        {mostUsedEmojis && mostUsedEmojis.length > 0 && (
          <div className='relative flex w-[320px] flex-col rounded bg-white'>
            <div className='p-4 text-sm font-semibold text-slate-600'>Favorite Emojis</div>
            <div className='flex flex-row justify-center'>
              {mostUsedEmojis.map((emoji) => (
                <div
                  key={emoji.id}
                  className='flex h-24 w-1/4 flex-col items-center justify-center'
                >
                  <div className='text-2xl'>
                    {unifiedToNative([emoji.id as keyof typeof emojis])}
                  </div>
                  <div className='p-2 font-semibold'>{emoji.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default TeamDashInsights
