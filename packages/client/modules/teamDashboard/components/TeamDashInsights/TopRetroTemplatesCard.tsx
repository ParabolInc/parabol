import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import {TopRetroTemplatesCard_insights$key} from '~/__generated__/TopRetroTemplatesCard_insights.graphql'
import SimpleTooltip from '../../../../components/SimpleTooltip'
import plural from '../../../../utils/plural'
import TeamInsightsCard from './TeamInsightsCard'

interface Props {
  teamInsightsRef: TopRetroTemplatesCard_insights$key
}

const TopRetroTemplatesCard = (props: Props) => {
  const {teamInsightsRef} = props
  const history = useHistory()
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
          count
        }
      }
    `,
    teamInsightsRef
  )

  const {topRetroTemplates} = insights
  if (!topRetroTemplates) {
    return null
  }

  const onClick = (templateId: string) => {
    history.push(`/activity-library/details/${templateId}`)
  }

  return (
    <TeamInsightsCard
      teamInsightsRef={insights}
      title='Top Templates'
      tooltip='The most used retro templates on your team in the last 12 months'
    >
      <div className='flex w-full flex-col'>
        {topRetroTemplates.map((template) => {
          const {reflectTemplate, count} = template
          const {id, name, illustrationUrl} = reflectTemplate
          return (
            <div key={id} onClick={() => onClick(id)}>
              <SimpleTooltip
                text={`Used ${plural(count, 'once', `${count} times`)} in the last 12 months`}
                className='my-2 flex items-center rounded border-2 border-grape-500 bg-fuscia-100 text-sm font-semibold text-slate-700'
              >
                <img className='m-1 h-10 w-10' src={illustrationUrl} />
                {name}
              </SimpleTooltip>
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
