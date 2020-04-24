import {DocumentNode} from 'graphql-typed'
export namespace GetProfileQueryPartialData {
  export interface Viewer {
    __typename?: 'User' | null
    id?: string | null
    login?: string | null
  }
}
export interface GetProfileQueryPartialData {
  viewer?: GetProfileQueryPartialData.Viewer | null
}
export namespace GetProfileQueryData {
  export interface Viewer {
    __typename: 'User'
    id: string
    login: string
  }
}
export interface GetProfileQueryData {
  viewer: GetProfileQueryData.Viewer
}
declare const document: DocumentNode<GetProfileQueryData, never, GetProfileQueryPartialData>
export default document
