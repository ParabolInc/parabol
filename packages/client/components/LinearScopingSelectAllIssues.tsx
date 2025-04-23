import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import {LinearScopingSelectAllIssues_issues$key} from '../__generated__/LinearScopingSelectAllIssues_issues.graphql'
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
  usedServiceTaskIds: Set<string>
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
  const serviceTaskIds = issues.map((issue) => {
    const repoId = LinearProjectId.join(issue.team.id, issue.project?.id)
    return LinearIssueId.join(repoId, issue.id)
  })
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
      const issue = issues.find((issue) => {
        const repoId = LinearProjectId.join(issue.team.id, issue.project?.id)
        return LinearIssueId.join(repoId, issue.id) === update.serviceTaskId
      })
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
          {error && <div className='font-semibold text-tomato-500'>{error.message}</div>}
        </div>
      </div>
    </>
  )
}

export default LinearScopingSelectAllIssues
