import type {ComponentType} from 'react'
import type {PreloadedQuery} from 'react-relay'
import type {ConcreteRequest, OperationType, VariablesOf} from 'relay-runtime'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'

interface QueryRootSource<TProps extends object, TQuery extends OperationType> {
  query: ConcreteRequest
  getVariables(props: TProps): VariablesOf<TQuery>
  Component: ComponentType<TProps & {queryRef: PreloadedQuery<TQuery>}>
}

const makeQueryRoot = <TProps extends object, TQuery extends OperationType>(
  source: QueryRootSource<TProps, TQuery>
) => {
  const {query, getVariables, Component} = source
  const QueryRoot = (props: TProps) => {
    const queryRef = useQueryLoaderNow<TQuery>(query, getVariables(props))
    if (!queryRef) return null
    return <Component {...props} queryRef={queryRef} />
  }
  return QueryRoot
}

export default makeQueryRoot
