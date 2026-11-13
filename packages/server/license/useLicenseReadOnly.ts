import {GraphQLError, getOperationAST, Kind} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import type {ServerContext} from '../yoga'
import {canTurnReadOnly, getInstanceLicense, isLicenseReadOnly} from './instanceLicense'

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
 * Refuses mutations once a license that asks for read-only at expiry has expired. Super users run on the private
 * schema, as do the server's own jobs and SAML sign-in, so they aren't affected. A license that can never turn the
 * instance read-only, as most can't, adds no hook at all.
 */
export const useLicenseReadOnly = (): Plugin<ServerContext> => {
  if (!canTurnReadOnly()) return {}
  const license = getInstanceLicense()
  const expiredOn = license.ok ? license.claims.expiresAt?.slice(0, 10) : undefined
  const message = `This Parabol instance’s license expired on ${expiredOn}, so Parabol is read-only: nothing can be changed. Contact Parabol to renew it.`
  return {
    onExecute({args, setResultAndStopExecution}) {
      if (!isLicenseReadOnly()) return
      const operation = getOperationAST(args.document, args.operationName)
      if (operation?.operation !== 'mutation') return
      const allowed = operation.selectionSet.selections.every(
        (selection) =>
          selection.kind === Kind.FIELD && READ_ONLY_ALLOWED_MUTATIONS.has(selection.name.value)
      )
      if (allowed) return
      setResultAndStopExecution({
        errors: [new GraphQLError(message, {extensions: {code: 'FORBIDDEN'}})]
      })
    }
  }
}
