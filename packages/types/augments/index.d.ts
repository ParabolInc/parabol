// globally declare this so other declaration files can reference this
// if a declaration files calls import, then it is regarded as an ESModule and the scope
// of the declaration is limited to that module, instead of being hoisted globally
type ParabolGraphQLErrorCodes =
  | 'MAX_PAGE_DEPTH_REACHED'
  | 'NOT_FOUND'
  | 'SESSION_INVALIDATED'
  | 'TOO_MANY_REQUESTS'
  | 'UNAPPROVED_UNLINK'
  | 'UNAUTHORIZED'
  | 'UPGRADE_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_IMPLEMENTED'
  | 'INVALID_REDIRECT_URI'

declare module 'graphql' {
  interface GraphQLErrorExtensions {
    code?: ParabolGraphQLErrorCodes
  }
}

declare module 'relay-runtime' {
  interface PayloadError extends Error {
    message: string
    locations?:
      | Array<{
          line: number
          column: number
        }>
      | undefined
    path?: Array<string | number>
    extensions?: {
      code?: ParabolGraphQLErrorCodes
    }
  }
}

declare module 'react' {
  interface TdHTMLAttributes<_T> {
    height?: string | number
    width?: string | number
    bgcolor?: string
  }
  interface TableHTMLAttributes<_T> {
    align?: 'center' | 'left' | 'right'
    bgcolor?: string
    height?: string | number
    width?: string | number
  }
}

// Adding this tells typescript this is an ESModule which means the declarations in this file will get merged
// with the modules, instead of overwrite them
export {}
