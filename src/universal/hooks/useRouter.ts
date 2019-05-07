import {useContext} from 'react'
import * as rr from 'react-router'

const useRouter = <T = {}>(): rr.RouteComponentProps<T> => {
  return useContext((rr as any).__RouterContext)
}

export default useRouter
