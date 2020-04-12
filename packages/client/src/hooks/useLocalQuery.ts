import {useEffect, useRef} from 'react'
import {createOperationDescriptor, Disposable, getRequest, SelectorData} from 'relay-runtime'
import useAtmosphere from './useAtmosphere'
import useDeepEqual from './useDeepEqual'
import useRefState from './useRefState'

interface Options {
  ttl: number
}

const useLocalQuery = <TQuery extends {response: any; variables: any}>(
  query: any,
  inVariables: TQuery['variables'] = {},
  options: Options = {ttl: 0}
): TQuery['response'] | null => {
  const variables = useDeepEqual(inVariables)
  const atmosphere = useAtmosphere()
  const [dataRef, setData] = useRefState<SelectorData | null>(() => {
    const request = getRequest(query)
    const operation = createOperationDescriptor(request, variables)
    const res = atmosphere.lookup(operation.fragment)
    return res.data || null
  })
  const opDisposableRef = useRef<Disposable>()
  const subDisposableRef = useRef<Disposable>()
  const {ttl} = options
  useEffect(() => {
    const request = getRequest(query)
    const operation = createOperationDescriptor(request, variables)
    const res = atmosphere.lookup(operation.fragment)
    setData(res.data || null)
    opDisposableRef.current = atmosphere.retain(operation)
    subDisposableRef.current = atmosphere.subscribe(res, (newSnapshot) => {
      setData(newSnapshot.data || null)
    })
    const opDisposable = opDisposableRef.current
    const subDisposable = subDisposableRef.current
    return () => {
      setTimeout(() => {
        subDisposable.dispose()
        opDisposable.dispose()
      }, ttl)
    }
  }, [atmosphere, setData, query, variables])
  return dataRef.current
}

export default useLocalQuery
