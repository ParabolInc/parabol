import type {ComponentType, LazyExoticComponent} from 'react'
import type {ConcreteRequest, OperationType, VariablesOf} from 'relay-runtime'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import type {
  ResultsAdapterProps,
  ScopingResultsProps,
  ScopingSearchContext,
  ScopingSearchState
} from './ScopingSearchState'

interface ScopingResultsSource<TQuery extends OperationType> {
  query: ConcreteRequest
  /** Maps the normalized search state onto this service's vendor argument names */
  searchArgs(state: ScopingSearchState, context: ScopingSearchContext): VariablesOf<TQuery>
  /** Owns this service's fragments and hands normalized items to its children */
  ResultsAdapter: LazyExoticComponent<ComponentType<ResultsAdapterProps<TQuery>>>
}

const makeScopingResults = <TQuery extends OperationType>(source: ScopingResultsSource<TQuery>) => {
  const {query, searchArgs, ResultsAdapter} = source
  const ScopingResults = (props: ScopingResultsProps) => {
    const {state, context, children} = props
    const queryRef = useQueryLoaderNow<TQuery>(query, searchArgs(state, context))
    if (!queryRef) return null
    return (
      <ResultsAdapter queryRef={queryRef} context={context}>
        {children}
      </ResultsAdapter>
    )
  }
  return ScopingResults
}

export default makeScopingResults
