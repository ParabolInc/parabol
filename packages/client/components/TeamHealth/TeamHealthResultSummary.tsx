import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthResultSummary_stage$key} from '~/__generated__/TeamHealthResultSummary_stage.graphql'
import {AutoAwesome} from '~/ui/icons'
import Ellipsis from '../Ellipsis/Ellipsis'

interface Props {
  stage: TeamHealthResultSummary_stage$key
}

const TeamHealthResultSummary = (props: Props) => {
  const {stage: stageRef} = props
  const stage = useFragment(
    graphql`
      fragment TeamHealthResultSummary_stage on TeamHealthResultStage {
        summary
        isLoadingSummary
      }
    `,
    stageRef
  )
  const {summary, isLoadingSummary} = stage
  if (!summary && !isLoadingSummary) return null
  return (
    <div className='mt-8'>
      <div className='flex items-center gap-1.5 font-semibold text-fg-muted text-xs uppercase tracking-wide'>
        <AutoAwesome className='size-4 text-accent' />
        Summary · written by AI
      </div>
      <div aria-live='polite' className='mt-2'>
        {summary ? (
          <div className='text-fg-primary'>{summary}</div>
        ) : (
          <div className='text-fg-muted'>
            Summarizing the answers and comments
            <Ellipsis />
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamHealthResultSummary
