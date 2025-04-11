import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import {LinearScopingSelectAllIssues_issues$key} from '../__generated__/LinearScopingSelectAllIssues_issues.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import LinearIssueId from '../shared/gqlIds/LinearIssueId'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import Checkbox from './Checkbox'
const Item = styled('div')({
  display: 'flex',
  padding: '8px 16px',
  cursor: 'pointer'
})

const Title = styled('div')({})

const TitleAndError = styled('div')({
  display: 'flex',
  fontWeight: 600,
  flexDirection: 'column',
  paddingLeft: 16,
  paddingBottom: 20 // total height is 56
})

const ErrorMessage = styled('div')({
  color: PALETTE.TOMATO_500,
  fontWeight: 600
})
interface Props {
  meetingId: string
  issuesRef: LinearScopingSelectAllIssues_issues$key
  usedServiceTaskIds: Set<string>
}

const LinearScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, issuesRef} = props
  const issues = useFragment(
    graphql`
      fragment LinearScopingSelectAllIssues_issues on _xLinearIssueSearchResult
      @relay(plural: true) {
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
      <Item onClick={onClick}>
        <Checkbox active={allSelected} />
        <TitleAndError>
          <Title>{title}</Title>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </TitleAndError>
      </Item>
    </>
  )
}

export default LinearScopingSelectAllIssues
