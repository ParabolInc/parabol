interface InspirationTab {
  service: string
  isConnected: boolean
}

const getActiveInspirationService = (tabs: readonly InspirationTab[], storedService: string) => {
  if (tabs.some((tab) => tab.service === storedService)) return storedService
  const connectedTab = tabs.find((tab) => tab.service !== 'PARABOL' && tab.isConnected)
  return connectedTab?.service ?? 'PARABOL'
}

export default getActiveInspirationService
