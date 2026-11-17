import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {PokerEstimateHeaderCard_stage$key} from '../__generated__/PokerEstimateHeaderCard_stage.graphql'
import useUpdatePokerScopeMutation from '../mutations/useUpdatePokerScopeMutation'
import PokerEstimateHeaderCardError from './PokerEstimateHeaderCardError'
import PokerEstimateHeaderCardIssue from './PokerEstimateHeaderCardIssue'
import PokerEstimateHeaderCardParabol from './PokerEstimateHeaderCardParabol'
import PokerEstimateHeaderCardSkeleton from './PokerEstimateHeaderCardSkeleton'

interface Props {
  stage: PokerEstimateHeaderCard_stage$key
}

const PokerEstimateHeaderCard = (props: Props) => {
  const {stage: stageRef} = props
  const [updatePokerScope] = useUpdatePokerScopeMutation()
  const stage = useFragment(
    graphql`
      fragment PokerEstimateHeaderCard_stage on EstimateStage {
        ...PokerEstimateHeaderCardIssue_stage @defer
        meetingId
        serviceTaskId
        task {
          integrationHash
          ...PokerEstimateHeaderCardParabol_task
        }
      }
    `,
    stageRef
  )
  const {meetingId, task, serviceTaskId} = stage

  const onRemove = () => {
    updatePokerScope({
      variables: {meetingId, updates: [{service: 'PARABOL', serviceTaskId, action: 'DELETE'}]},
      contents: []
    })
  }

  if (!task) {
    return <PokerEstimateHeaderCardError onRemove={onRemove} />
  }

  if (!task.integrationHash) {
    return <PokerEstimateHeaderCardParabol task={task} />
  }

  return (
    <Suspense fallback={<PokerEstimateHeaderCardSkeleton />}>
      <PokerEstimateHeaderCardIssue stage={stage} onRemove={onRemove} />
    </Suspense>
  )
}

export default PokerEstimateHeaderCard
