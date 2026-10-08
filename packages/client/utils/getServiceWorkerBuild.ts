interface ServiceWorkerBuild {
  version?: string
  commitHash?: string
}

const getServiceWorkerBuild = (worker: ServiceWorker) => {
  return new Promise<ServiceWorkerBuild>((resolve) => {
    const {port1, port2} = new MessageChannel()
    const timeout = window.setTimeout(() => {
      port1.close()
      resolve({})
    }, 5000)
    port1.onmessage = (event) => {
      window.clearTimeout(timeout)
      port1.close()
      resolve({version: event.data?.payload, commitHash: event.data?.commitHash})
    }
    worker.postMessage({type: 'getVersion'}, [port2])
  })
}

export default getServiceWorkerBuild
