import {getOperationAST, Kind} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import {logOperation} from '../logOperation'
import type {ServerContext} from '../yoga'

interface Config {
  /**
   * A record where the key is the operationName and the value is
   * an array of variables to exclude.
   * Useful for excluding private variables like passwords
   */
  excludeArgs?: Record<string, string[]>
  /**
   * A set of operations that do need to be audited
   */
  includeOps: Set<string>
}

export const useAuditLogs = (config: Config): Plugin<ServerContext> => {
  if (process.env.AUDIT_LOGS !== 'true') return {}
  return {
    onExecute({args, context}) {
      const operationAst = getOperationAST(args.document, args.operationName)!
      const {selections} = operationAst.selectionSet
      const fieldNode = selections.find((s) => s.kind === Kind.FIELD)
      if (!fieldNode) return
      const operationName = fieldNode.name.value
      const {includeOps, excludeArgs} = config
      const variableValues = args.variableValues || {}
      if (!includeOps.has(operationName)) return
      const excludedOpArgs = excludeArgs?.[operationName] || []
      const sanitizedVaribles = Object.fromEntries(
        Object.entries(variableValues).map(([key, val]) => {
          const nextVal = excludedOpArgs.includes(key) ? '******' : val
          return [key, nextVal]
        })
      )
      const {authToken, ip} = context
      const userId = authToken?.sub ?? ''
      logOperation(userId, ip, operationName, sanitizedVaribles)
    }
  }
}
