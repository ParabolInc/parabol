import {GraphQLError, getOperationAST, Kind} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import type {ServerContext} from '../yoga'
import {getReadOnlyMessage} from './getLicenseNotice'
import {getCurrentLicenseStatus} from './licenseState'

// What a read-only instance still lets people do, so they can sign in and see their work
export const READ_ONLY_ALLOWED_MUTATIONS: ReadonlySet<string> = new Set([
  'loginWithGoogle',
  'loginWithMicrosoft',
  'loginWithPassword',
  'refreshSession',
  'verifyEmail',
  'emailPasswordReset',
  'resetPassword'
])

/**
 * Refuses mutations while the license makes the instance read-only. Super users run on the private schema, as do the
 * server's own jobs and SAML sign-in, so they aren't affected.
 */
export const useLicenseReadOnly = (): Plugin<ServerContext> => ({
  onExecute({args, setResultAndStopExecution}) {
    const status = getCurrentLicenseStatus()
    if (!status.readOnly) return
    if (args.contextValue.authToken?.rol === 'su') return
    const operation = getOperationAST(args.document, args.operationName)
    if (operation?.operation !== 'mutation') return
    const allowed = operation.selectionSet.selections.every(
      (selection) =>
        selection.kind === Kind.FIELD && READ_ONLY_ALLOWED_MUTATIONS.has(selection.name.value)
    )
    if (allowed) return
    setResultAndStopExecution({
      errors: [
        new GraphQLError(getReadOnlyMessage(status), {extensions: {code: 'LICENSE_READ_ONLY'}})
      ]
    })
  }
})
