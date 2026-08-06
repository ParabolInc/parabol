import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import type {JiraScopingSelectAllIssues_issues$key} from '../__generated__/JiraScopingSelectAllIssues_issues.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import Checkbox from './Checkbox'

interface Props {
  meetingId: string
  issues: JiraScopingSelectAllIssues_issues$key
  usedServiceTaskIds: Set<string>
}

const JiraScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, issues: issuesRef} = props
  const issues = useFragment(
    graphql`
      fragment JiraScopingSelectAllIssues_issues on JiraIssueEdge @relay(plural: true) {
        node {
          id
          summary
        }
      }
    `,
    issuesRef
  )
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, error} = useMutationProps()
  const serviceTaskIds = issues.map((issueEdge) => issueEdge.node.id)
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(serviceTaskIds, usedServiceTaskIds)
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    submitMutation()
    const updateArr = allSelected === true ? serviceTaskIds : unusedServiceTaskIds
    const action = allSelected === true ? 'DELETE' : 'ADD'
    const limit = action === 'ADD' ? availableCountToAdd : 1e6
    const updates = updateArr.slice(0, limit).map(
      (serviceTaskId) =>
        ({
          service: 'jira',
          serviceTaskId,
          action
        }) as const
    )

    const variables = {
      meetingId,
      updates
    }
    const contents = updates.map((update) => {
      const issue = issues.find((issueEdge) => issueEdge.node.id === update.serviceTaskId)
      return issue?.node.summary ?? 'Unknown Story'
    })
    UpdatePokerScopeMutation(atmosphere, variables, {
      onError,
      onCompleted,
      contents,
      selectedAll: true
    })
  }
  if (issues.length < 2) return null
  const title = getSelectAllTitle(issues.length, usedServiceTaskIds.size, 'issue')

  return (
    <>
      <div className='flex cursor-pointer px-4 py-2' onClick={onClick}>
        <Checkbox active={allSelected} />
        <div className='flex flex-col pb-5 pl-4 font-semibold'>
          <div>{title}</div>
          {error && <div className='font-semibold text-fg-error'>{error.message}</div>}
        </div>
      </div>
    </>
  )
}

export default JiraScopingSelectAllIssues
