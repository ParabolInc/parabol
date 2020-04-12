import {useEffect} from 'react'
import hideBodyScroll from '../utils/hideBodyScroll'

const useHideBodyScroll = () => {
  useEffect(hideBodyScroll, [])
}

export default useHideBodyScroll
