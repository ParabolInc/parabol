import useAtmosphere from './useAtmosphere'
import useRefState from './useRefState'
import {Disposable, SelectorData} from 'relay-runtime'
import {useEffect, useRef} from 'react'
import useDeepEqual from './useDeepEqual'

const useLocalQuery = <TQuery extends {response: any; variables: any}>(
  query: any,
  inVariables: TQuery['variables'] = {}
): TQuery['response'] | null => {
  const variables = useDeepEqual(inVariables)
  const atmosphere = useAtmosphere()
  const [dataRef, setData] = useRefState<SelectorData | null>(null)
  const disposablesRef = useRef<Disposable[]>([])
  useEffect(() => {
    const {getRequest, createOperationDescriptor} = atmosphere.unstable_internal
    const request = getRequest(query)
    const operation = createOperationDescriptor(request, variables)
    const res = atmosphere.lookup(operation.fragment, operation)
    setData(res.data || null)
    disposablesRef.current.push(atmosphere.retain(operation.root))
    disposablesRef.current.push(
      atmosphere.subscribe(res, (newSnapshot) => {
        setData(newSnapshot.data || null)
      })
    )
    const disposables = disposablesRef.current
    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [atmosphere, setData, query, variables])
  return dataRef.current
}

export default useLocalQuery
