export interface ScaffoldNames {
  service: string
  pascal: string
  title: string
  description: string
  envPrefix: string
}

export const SERVICE_PATTERN = /^[a-z][a-zA-Z0-9]*$/

const makeScaffoldNames = (service: string, title: string, description?: string) => {
  const names: ScaffoldNames = {
    service,
    pascal: service.charAt(0).toUpperCase() + service.slice(1),
    title,
    description: description || `Use ${title} issues from within Parabol.`,
    envPrefix: service.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()
  }
  return names
}

export default makeScaffoldNames
