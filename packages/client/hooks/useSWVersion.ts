import {useEffect, useState} from 'react'
import getServiceWorkerBuild from '../utils/getServiceWorkerBuild'

const useSWVersion = () => {
  const [swVersion, setSWVersion] = useState<string>()

  useEffect(() => {
    const controller = 'serviceWorker' in navigator ? navigator.serviceWorker.controller : null
    if (!controller) return
    getServiceWorkerBuild(controller).then(({version}) => setSWVersion(version))
  }, [])

  return swVersion
}

export default useSWVersion
