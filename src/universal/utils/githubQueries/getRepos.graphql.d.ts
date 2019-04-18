import {DocumentNode} from 'graphql-typed'
import {DateTime} from './types'
export namespace GetReposQueryPartialData {
  export interface ViewerOrganizationsNodesRepositoriesNodes {
    __typename?: 'Repository' | null
    nameWithOwner?: string | null
    updatedAt?: DateTime | null
    viewerCanAdminister?: boolean | null
  }
  export interface ViewerOrganizationsNodesRepositories {
    __typename?: 'RepositoryConnection' | null
    nodes?: (ViewerOrganizationsNodesRepositoriesNodes | null)[] | null
  }
  export interface ViewerOrganizationsNodes {
    __typename?: 'Organization' | null
    repositories?: ViewerOrganizationsNodesRepositories | null
  }
  export interface ViewerOrganizations {
    __typename?: 'OrganizationConnection' | null
    nodes?: (ViewerOrganizationsNodes | null)[] | null
  }
  export interface ViewerRepositoriesNodes {
    __typename?: 'Repository' | null
    nameWithOwner?: string | null
    updatedAt?: DateTime | null
    viewerCanAdminister?: boolean | null
  }
  export interface ViewerRepositories {
    __typename?: 'RepositoryConnection' | null
    nodes?: (ViewerRepositoriesNodes | null)[] | null
  }
  export interface Viewer {
    __typename?: 'User' | null
    organizations?: ViewerOrganizations | null
    repositories?: ViewerRepositories | null
  }
}
export interface GetReposQueryPartialData {
  viewer?: GetReposQueryPartialData.Viewer | null
}
export namespace GetReposQueryData {
  export interface ViewerOrganizationsNodesRepositoriesNodes {
    __typename: 'Repository'
    nameWithOwner: string
    updatedAt: DateTime
    viewerCanAdminister: boolean
  }
  export interface ViewerOrganizationsNodesRepositories {
    __typename: 'RepositoryConnection'
    nodes?: (ViewerOrganizationsNodesRepositoriesNodes | null)[] | null
  }
  export interface ViewerOrganizationsNodes {
    __typename: 'Organization'
    repositories: ViewerOrganizationsNodesRepositories
  }
  export interface ViewerOrganizations {
    __typename: 'OrganizationConnection'
    nodes?: (ViewerOrganizationsNodes | null)[] | null
  }
  export interface ViewerRepositoriesNodes {
    __typename: 'Repository'
    nameWithOwner: string
    updatedAt: DateTime
    viewerCanAdminister: boolean
  }
  export interface ViewerRepositories {
    __typename: 'RepositoryConnection'
    nodes?: (ViewerRepositoriesNodes | null)[] | null
  }
  export interface Viewer {
    __typename: 'User'
    organizations: ViewerOrganizations
    repositories: ViewerRepositories
  }
}
export interface GetReposQueryData {
  viewer: GetReposQueryData.Viewer
}
declare const document: DocumentNode<GetReposQueryData, never, GetReposQueryPartialData>
export default document
