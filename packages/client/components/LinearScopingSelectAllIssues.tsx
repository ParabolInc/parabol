import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import type {LinearScopingSelectAllIssues_issues$key} from '../__generated__/LinearScopingSelectAllIssues_issues.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import LinearIssueId from '../shared/gqlIds/LinearIssueId'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import Checkbox from './Checkbox'

interface Props {
  meetingId: string
  issuesRef: LinearScopingSelectAllIssues_issues$key
  usedServiceTaskIds: ReadonlyMap<string, string>
}

const LinearScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, issuesRef} = props
  const issues = useFragment(
    graphql`
      fragment LinearScopingSelectAllIssues_issues on _xLinearIssue @relay(plural: true) {
        id
        title
        number
        project {
          id
          name
        }
        team {
          id
          displayName
        }
        url
      }
    `,
    issuesRef
  )
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const getServiceTaskId = (issue: (typeof issues)[number]) =>
    LinearIssueId.join(LinearProjectId.join(issue.team?.id ?? '', issue.project?.id), issue.id)
  const serviceTaskIds = issues.map(getServiceTaskId)
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(serviceTaskIds, usedServiceTaskIds)
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const updateArr =
      allSelected === true
        ? serviceTaskIds.flatMap((id) => usedServiceTaskIds.get(id) ?? [])
        : unusedServiceTaskIds
    const action = allSelected === true ? 'DELETE' : 'ADD'
    const limit = action === 'ADD' ? availableCountToAdd : 1e6
    const updates = updateArr.slice(0, limit).map(
      (serviceTaskId) =>
        ({
          service: 'linear',
          serviceTaskId,
          action
        }) as const
    )

    const variables = {
      meetingId,
      updates
    }
    const contents = updates.map((update) => {
      const issue = issues.find((issue) => getServiceTaskId(issue) === update.serviceTaskId)
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
    <>
      <div className='flex cursor-pointer p-2 px-4' onClick={onClick}>
        <Checkbox active={allSelected} />
        <div className='flex flex-col pb-5 pl-4 font-semibold'>
          <div>{title}</div>
          {error && <div className='font-semibold text-fg-error'>{error.message}</div>}
        </div>
      </div>
    </>
  )
}

export default LinearScopingSelectAllIssues
