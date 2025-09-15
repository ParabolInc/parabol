import {getOperationAST, Kind} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import type {ServerContext} from '../yoga'

interface Config {
  /**
   * A record where the key is the operationName and the value is
   * an array of variables to exclude.
   * Useful for excluding private variables like passwords
   */
  excludeArgs?: Record<string, string[]>
  /**
   * A set of operations that do not need to be audited
   */
  includeOps: Set<string>
}

export const useSOC2AuditLogs = (config: Config): Plugin<ServerContext> => {
  if (process.env.SOC2_LOGS !== 'true') return {}
  return {
    onExecute({args, context}) {
      const operationAst = getOperationAST(args.document, args.operationName)!
      const {selections} = operationAst.selectionSet
      const fieldNode = selections.find((s) => s.kind === Kind.FIELD)
      if (!fieldNode) return
      const operationName = fieldNode.name.value
      const {includeOps, excludeArgs} = config
      const {variableValues} = args
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
      const auditLog = {
        time: new Date().toISOString(),
        level: 'info',
        type: 'audit',
        userId,
        ipAddress: ip,
        operation: operationName,
        variables: sanitizedVaribles
      }
      console.log(auditLog)
    }
  }
}
