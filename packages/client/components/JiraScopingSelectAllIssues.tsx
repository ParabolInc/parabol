import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {PALETTE} from '../styles/paletteV2'
import {Threshold} from '../types/constEnums'
import {AddOrDeleteEnum, TaskServiceEnum} from '../types/graphql'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import {JiraScopingSelectAllIssues_issues} from '../__generated__/JiraScopingSelectAllIssues_issues.graphql'
import Checkbox from './Checkbox'

const Item = styled('div')({
  display: 'flex',
  padding: '8px 16px',
  cursor: 'pointer'
})

const Title = styled('div')({
})

const TitleAndError = styled('div')({
  display: 'flex',
  fontWeight: 600,
  flexDirection: 'column',
  paddingLeft: 16,
  paddingBottom: 20, // total height is 56
})

const ErrorMessage = styled('div')({
  color: PALETTE.ERROR_MAIN,
  fontWeight: 600,
})
interface Props {
  meetingId: string
  issues: JiraScopingSelectAllIssues_issues
  usedServiceTaskIds: Set<string>
}

const JiraScopingSelectAllIssues = (props: Props) => {
  const {meetingId, usedServiceTaskIds, issues} = props
  const serviceTaskIds = issues.map(issueEdge => issueEdge.node.id)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const [unusedServiceTaskIds, allSelected] = useUnusedRecords(issues, usedServiceTaskIds)
  const availableCountToAdd = Threshold.MAX_POKER_STORIES - usedServiceTaskIds.size
  const onClick = () => {
    if (submitting) return
    submitMutation()
    const updateArr = allSelected === true ? serviceTaskIds : unusedServiceTaskIds
    const action = allSelected === true ? AddOrDeleteEnum.DELETE : AddOrDeleteEnum.ADD
    const limit = action === AddOrDeleteEnum.ADD ? availableCountToAdd : 1e6
    const updates = updateArr.slice(0, limit).map((serviceTaskId) => ({
      service: TaskServiceEnum.jira,
      serviceTaskId,
      action
    }))

    const variables = {
      meetingId,
      updates
    }
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted})
  }
  if (issues.length < 2) return null
  const title = getSelectAllTitle(issues.length, usedServiceTaskIds.size, 'issue')

  return (
    <>
      <Item onClick={onClick}>
        <Checkbox active={allSelected} onClick={() => console.log('click')} />
        <TitleAndError>
          <Title>{title}</Title>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
        </TitleAndError>
      </Item>
    </>
  )
}

export default createFragmentContainer(JiraScopingSelectAllIssues, {
  issues: graphql`
    fragment JiraScopingSelectAllIssues_issues on JiraIssueEdge @relay(plural: true) {
      node {
        id
      }
    }
  `
})
