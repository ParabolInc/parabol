import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MostUsedEmojisCard_insights$key} from '~/__generated__/MostUsedEmojisCard_insights.graphql'
import SimpleTooltip from '../../../../components/SimpleTooltip'
import getReactji from '../../../../utils/getReactji'
import TeamInsightsCard from './TeamInsightsCard'

interface Props {
  teamInsightsRef: MostUsedEmojisCard_insights$key
}

const MostUsedEmojisCard = (props: Props) => {
  const {teamInsightsRef} = props
  const insights = useFragment(
    graphql`
      fragment MostUsedEmojisCard_insights on TeamInsights {
        ...TeamInsightsCard_insights
        mostUsedEmojis {
          id
          count
        }
      }
    `,
    teamInsightsRef
  )

  const {mostUsedEmojis} = insights
  if (!mostUsedEmojis || mostUsedEmojis.length === 0) {
    return null
  }

  return (
    <TeamInsightsCard
      teamInsightsRef={insights}
      title='Favorite Reactions'
      tooltip='Your team’s most used emoji reactions'
    >
      <div className='flex flex-row justify-center'>
        {mostUsedEmojis.map((emoji) => {
          const {unicode, shortName} = getReactji(emoji.id)
          return (
            <div key={emoji.id} className='flex h-24 w-1/4 flex-col items-center justify-center'>
              <SimpleTooltip text={`:${shortName}:`}>
                <div className='text-2xl'>{unicode}</div>
              </SimpleTooltip>
              <div className='p-2 font-semibold'>{emoji.count}</div>
            </div>
          )
        })}
      </div>
    </TeamInsightsCard>
  )
}

export default MostUsedEmojisCard
