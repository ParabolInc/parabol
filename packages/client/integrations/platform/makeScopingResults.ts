import type {ComponentType, LazyExoticComponent} from 'react'
import type {ConcreteRequest, OperationType, VariablesOf} from 'relay-runtime'
import makeQueryRoot from './makeQueryRoot'
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

const makeScopingResults = <TQuery extends OperationType>(source: ScopingResultsSource<TQuery>) =>
  makeQueryRoot<ScopingResultsProps, TQuery>({
    query: source.query,
    getVariables: ({state, context}) => source.searchArgs(state, context),
    Component: source.ResultsAdapter
  })

export default makeScopingResults
