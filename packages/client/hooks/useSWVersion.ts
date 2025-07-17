import {useEffect, useState} from 'react'

const useSWVersion = () => {
  const [swVersion, setSWVersion] = useState<string>()

  useEffect(() => {
    const messageChannel = new MessageChannel()

    messageChannel.port1.onmessage = (event) => {
      if (event.data?.type === 'version') {
        setSWVersion(event.data?.payload)
        messageChannel.port1.close()
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({type: 'getVersion'}, [messageChannel.port2])
    }
  }, [])

  return swVersion
}

export default useSWVersion
