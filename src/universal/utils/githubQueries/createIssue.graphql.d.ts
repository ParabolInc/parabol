import {DocumentNode} from 'graphql-typed'
import {CreateIssueInput} from './types'
export namespace CreateIssueMutationMutationPartialData {
  export interface CreateIssueIssueAssigneesNodes {
    __typename?: 'User' | null
    id?: string | null
    login?: string | null
  }
  export interface CreateIssueIssueAssignees {
    __typename?: 'UserConnection' | null
    nodes?: (CreateIssueIssueAssigneesNodes | null)[] | null
  }
  export interface CreateIssueIssue {
    __typename?: 'Issue' | null
    assignees?: CreateIssueIssueAssignees | null
    id?: string | null
    number?: number | null
  }
  export interface CreateIssue {
    __typename?: 'CreateIssuePayload' | null
    issue?: CreateIssueIssue | null
  }
}
export interface CreateIssueMutationMutationPartialData {
  createIssue?: CreateIssueMutationMutationPartialData.CreateIssue | null
}
export namespace CreateIssueMutationMutationData {
  export interface Variables {
    input: CreateIssueInput
  }
  export interface CreateIssueIssueAssigneesNodes {
    __typename: 'User'
    id: string
    login: string
  }
  export interface CreateIssueIssueAssignees {
    __typename: 'UserConnection'
    nodes?: (CreateIssueIssueAssigneesNodes | null)[] | null
  }
  export interface CreateIssueIssue {
    __typename: 'Issue'
    assignees: CreateIssueIssueAssignees
    id: string
    number: number
  }
  export interface CreateIssue {
    __typename: 'CreateIssuePayload'
    issue?: CreateIssueIssue | null
  }
}
export interface CreateIssueMutationMutationData {
  createIssue?: CreateIssueMutationMutationData.CreateIssue | null
}
declare const document: DocumentNode<
  CreateIssueMutationMutationData,
  CreateIssueMutationMutationData.Variables,
  CreateIssueMutationMutationPartialData
>
export default document
