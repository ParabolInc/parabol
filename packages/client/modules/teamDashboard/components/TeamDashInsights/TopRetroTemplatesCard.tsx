import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TopRetroTemplatesCard_insights$key} from '~/__generated__/TopRetroTemplatesCard_insights.graphql'
import TeamInsightsCard from './TeamInsightsCard'

interface Props {
  teamInsightsRef: TopRetroTemplatesCard_insights$key
}

const TopRetroTemplatesCard = (props: Props) => {
  const {teamInsightsRef} = props
  const insights = useFragment(
    graphql`
      fragment TopRetroTemplatesCard_insights on TeamInsights {
        ...TeamInsightsCard_insights
        topRetroTemplates {
          id
          reflectTemplate {
            id
            name
            illustrationUrl
          }
        }
      }
    `,
    teamInsightsRef
  )

  const {topRetroTemplates} = insights
  if (!topRetroTemplates) {
    return null
  }

  return (
    <TeamInsightsCard
      teamInsightsRef={insights}
      title='Top Templates'
      tooltip='The most frequently used retrospective templates on your team'
    >
      <div className='flex w-full flex-col'>
        {topRetroTemplates.map((template, index) => {
          const {reflectTemplate} = template
          const {name, illustrationUrl} = reflectTemplate
          return (
            <div
              className='my-2 flex items-center rounded border-2 border-grape-500 bg-fuscia-100 text-sm font-semibold text-slate-700'
              key={index}
            >
              <img className='m-1 h-10 w-10' src={illustrationUrl} />
              {name}
            </div>
          )
        })}
        {topRetroTemplates.length === 1 && (
          <div className='text-sm'>
            You really love this template! Try mixing things up once in a while with a different
            template. Different templates will help you have different conversations.
          </div>
        )}
      </div>
    </TeamInsightsCard>
  )
}

export default TopRetroTemplatesCard
