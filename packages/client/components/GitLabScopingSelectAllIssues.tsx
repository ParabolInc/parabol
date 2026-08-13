import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import type {GitLabScopingSelectAllIssues_issues$key} from '../__generated__/GitLabScopingSelectAllIssues_issues.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import GitLabIssueId from '../shared/gqlIds/GitLabIssueId'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import Checkbox from './Checkbox'

interface Props {
  meetingId: string
  issuesRef: GitLabScopingSelectAllIssues_issues$key
  usedServiceTaskIds: Set<string>
  providerId: string
}

const GitLabScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, issuesRef, providerId} = props
  const issues = useFragment(
    graphql`
      fragment GitLabScopingSelectAllIssues_issues on _xGitLabIssue @relay(plural: true) {
        id
        iid
        title
        webPath
      }
    `,
    issuesRef
  )
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const serviceTaskIds = issues.map((issue) => GitLabIssueId.join(providerId, issue.id))
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(serviceTaskIds, usedServiceTaskIds)
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const updateArr = allSelected === true ? serviceTaskIds : unusedServiceTaskIds
    const action = allSelected === true ? 'DELETE' : 'ADD'
    const limit = action === 'ADD' ? availableCountToAdd : 1e6
    const updates = updateArr.slice(0, limit).map(
      (serviceTaskId) =>
        ({
          service: 'gitlab',
          serviceTaskId,
          action
        }) as const
    )

    const variables = {
      meetingId,
      updates
    }
    const contents = updates.map((update) => {
      const issue = issues.find(
        (issue) => GitLabIssueId.join(providerId, issue.id) === update.serviceTaskId
      )
      return issue?.title ?? 'Unknown Story'
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
    <div className='flex cursor-pointer px-4 py-2' onClick={onClick}>
      <Checkbox active={allSelected} />
      <div className='flex flex-col pb-5 pl-4 font-semibold'>
        <div>{title}</div>
        {error && <div className='font-semibold text-fg-error'>{error.message}</div>}
      </div>
    </div>
  )
}

export default GitLabScopingSelectAllIssues
