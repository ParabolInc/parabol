import {DocumentNode} from 'graphql-typed'
import {URI} from './types'
export namespace GetRepoInfoQueryPartialData {
  export interface User {
    __typename?: 'User' | null
    id?: string | null
    avatarUrl?: URI | null
  }
  export interface Repository {
    __typename?: 'Repository' | null
    id?: string | null
  }
}
export interface GetRepoInfoQueryPartialData {
  user?: GetRepoInfoQueryPartialData.User | null
  repository?: GetRepoInfoQueryPartialData.Repository | null
}
export namespace GetRepoInfoQueryData {
  export interface Variables {
    assigneeLogin: string
    repoOwner: string
    repoName: string
  }
  export interface User {
    __typename: 'User'
    id: string
    avatarUrl: URI
  }
  export interface Repository {
    __typename: 'Repository'
    id: string
  }
}
export interface GetRepoInfoQueryData {
  user?: GetRepoInfoQueryData.User | null
  repository?: GetRepoInfoQueryData.Repository | null
}
declare const document: DocumentNode<
  GetRepoInfoQueryData,
  GetRepoInfoQueryData.Variables,
  GetRepoInfoQueryPartialData
>
export default document
