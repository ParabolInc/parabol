import {useContext} from 'react'
import * as rr from 'react-router'

const useRouter = () => {
  return useContext((rr as any).__RouterContext)
}

export default useRouter
