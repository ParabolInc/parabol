import {handleStreamOrSingleExecutionResult, type ExecutionArgs} from '@envelop/core'
import {useOnResolve, type Resolver} from '@envelop/on-resolve'
import tracer, {type opentelemetry, type Span} from 'dd-trace'
import {defaultFieldResolver, getNamedType, getOperationAST, type GraphQLResolveInfo} from 'graphql'
import type {ExecutionResult} from 'graphql-ws'
import type {Plugin} from 'graphql-yoga'
import {Path} from 'graphql/jsutils/Path'
import type {ServerContext} from '../yoga'
import {extractErrorIntoSpanEvent} from './extractErrorIntoSpanEvent'

const ddSymbol = Symbol('_dd')

interface Field {
  span: Span
}

type ComputedPathString = string
type Fields = Record<ComputedPathString, Field>
interface DDContext {
  [ddSymbol]: {fields: Fields; rootSpan: Span}
}

interface Config {
  /**
   * A record where the key is the operationName and the value is
   * an array of variables to exclude.
   * Useful for excluding private variables like passwords
   */
  excludeArgs?: Record<string, string[]>
  /**
   * Whether to collapse list items into a single element. (i.e. single
   * `users.*.name` span instead of `users.0.name`, `users.1.name`, etc)
   *
   */
  collapse: boolean
  /**
   * An object of optional callbacks to be executed during the respective
   * phase of a GraphQL operation. Undefined callbacks default to a noop
   * function.
   *
   * @default {}
   */
  hooks?: {
    execute?: (span: Span, args: ExecutionArgs, res?: any) => void
  }
}

type PluginContext = DDContext & ServerContext
type WrappableResolver = Resolver<any> & {[ddSymbol]?: true}
export const useDatadogTracing = (config: Config): Plugin<PluginContext> => {
  if (process.env.DD_TRACE_ENABLED !== 'true') return {}
  return {
    // Removing resolve-level tracing to see if we can measure executions without OOMs
    onPluginInit({addPlugin}) {
      addPlugin(
        useOnResolve(({info, context, args, replaceResolver, resolver}) => {
          // Ignore anything without a custom resolver since it's basically an identity function
          if (resolver === defaultFieldResolver || (resolver as WrappableResolver)[ddSymbol]) return
          const path = getPath(info, config)
          const computedPathString = path.join('.')
          const ddContext = context[ddSymbol]
          // context is set in onExecute or onSubscribe, depending on the parent operation
          // if the parent operation did not set context, then the resolver has no parent & we cannot continue
          if (!ddContext) return
          const {rootSpan, fields} = ddContext
          // if collapsed, we just measure the first item in a list
          if (config.collapse && fields[computedPathString]) return

          const parentSpan = getParentSpan(path, fields) ?? rootSpan
          const {fieldName, returnType, parentType} = info
          const returnTypeName = getNamedType(info.returnType).name
          const parentTypeName = getNamedType(parentType).name
          const fieldSpan = tracer.startSpan('graphql.resolve', {
            childOf: parentSpan,
            tags: {
              'service.name': 'web-graphql',
              'resource.name': `${info.fieldName}:${returnType}`,
              'span.type': 'graphql',
              'graphql.resolver.fieldName': fieldName,
              'graphql.resolver.typeName': parentTypeName,
              'graphql.resolver.returnType': returnTypeName,
              'graphql.resolver.fieldPath': computedPathString,
              ...makeVariables(config.excludeArgs, args, fieldName)
            }
          })
          fields[computedPathString] = {span: fieldSpan}
          const wrapped: WrappableResolver = (...args) =>
            tracer.scope().activate(fieldSpan, () => resolver(...args))
          wrapped[ddSymbol] = true
          replaceResolver(wrapped)
          return ({result}) => {
            markSpanError(fieldSpan, result)
            fieldSpan.finish()
          }
        })
      )
    },
    onExecute({args, extendContext, executeFn, setExecuteFn}) {
      const operationAst = getOperationAST(args.document, args.operationName)!
      const operationType = operationAst.operation
      const operationName = operationAst.name?.value || 'anonymous'
      const resourceName = `${operationType} ${operationName}`
      const rootSpan = tracer.startSpan('graphql', {
        tags: {
          'service.name': 'web-graphql',
          'resource.name': resourceName,
          'span.type': 'graphql',
          'graphql.execute.operationName': operationName,
          'graphql.execute.operationType': operationType
        }
      })
      extendContext({[ddSymbol]: {rootSpan, fields: {}}})
      setExecuteFn((args) => tracer.scope().activate(rootSpan, () => executeFn(args)))
      return {
        onExecuteDone(options) {
          return handleStreamOrSingleExecutionResult(options, ({result}) => {
            config.hooks?.execute?.(rootSpan, options.args, result)
            markTopLevelError(rootSpan, result)
            rootSpan.finish()
          })
        }
      }
    }
    // Ignoring subscriptions to see if that reduces OOM errors caused by dd-trace
    // onSubscribe({args, extendContext, setSubscribeFn, subscribeFn}) {
    //   const operationAst = getOperationAST(args.document, args.operationName)!
    //   const operationType = operationAst.operation
    //   const operationName = operationAst.name?.value || 'anonymous'
    //   const resourceName = `${operationType} ${operationName}`

    //   const rootSpan = tracer.startSpan('graphql', {
    //     tags: {
    //       'service.name': 'web-graphql',
    //       'resource.name': resourceName,
    //       'span.type': 'graphql',
    //       'graphql.subscribe.operationName': operationName,
    //       'graphql.subscribe.operationType': operationType
    //     }
    //   })
    //   extendContext({[ddSymbol]: {rootSpan, fields: {}}})
    //   setSubscribeFn((args) => tracer.scope().activate(rootSpan, () => subscribeFn(args)))
    //   return {
    //     onSubscribeError: ({error}) => {
    //       markSpanError(rootSpan, error)
    //       rootSpan.finish()
    //     },
    //     onSubscribeResult() {
    //       return {
    //         onNext: ({result}) => {
    //           markTopLevelError(rootSpan, result)
    //         },
    //         onEnd: () => {
    //           rootSpan.finish()
    //         }
    //       }
    //     }
    //   }
    // }
  }
}

export const makeVariables = (
  excludeArgs: Config['excludeArgs'],
  variableValues: Record<string, any> | undefined | null,
  fieldName: string
) => {
  if (!variableValues) return {}
  const excludedOpArgs = excludeArgs?.[fieldName] || []
  return Object.fromEntries(
    Object.entries(variableValues).map(([key, val]) => {
      const nextVal = excludedOpArgs.includes(key) ? '******' : val
      return [`graphql.resolver.variables.${key}`, nextVal]
    })
  )
}

export const getParentSpan = (path: (string | number)[], fields: Fields) => {
  const maybeParentPath = path.slice(0, -1)
  const lastField = maybeParentPath.at(-1)
  const parentPath =
    lastField === '*' || typeof lastField === 'number'
      ? maybeParentPath.slice(0, -1)
      : maybeParentPath
  const parentPathStr = parentPath.join('.')
  return fields[parentPathStr]?.span
}

function markTopLevelError(span: tracer.Span | opentelemetry.Span, result: ExecutionResult) {
  if (result?.errors && result.errors.length > 0) {
    for (const err of result.errors) {
      extractErrorIntoSpanEvent(span as opentelemetry.Span, err)
    }
  }
}

export function markSpanError(span: tracer.Span, error: unknown) {
  if (error instanceof Error) {
    span.setTag('error.stack', error.stack)
    span.setTag('error.message', error.message)
    span.setTag('error.type', error.name)
  }
}

export function getPath(info: GraphQLResolveInfo, config: {collapse?: boolean}) {
  const responsePathAsArray = config.collapse ? withCollapse(pathToArray) : pathToArray
  return responsePathAsArray(info && info.path)
}

function pathToArray(path: Path) {
  const flattened = []
  let curr: Path | undefined = path
  while (curr) {
    flattened.push(curr.key)
    curr = curr.prev
  }
  return flattened.reverse()
}

function withCollapse(responsePathAsArray: typeof pathToArray) {
  return function (path: Path) {
    return responsePathAsArray(path).map((segment) => (typeof segment === 'number' ? '*' : segment))
  }
}
