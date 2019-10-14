import {useEffect, useRef, useState} from 'react'
import AzureDevopsClientManager, {
  AccessibleResource,
  AzureDevopsProject
} from '../utils/AzureDevopsClientManager'

interface MenuItem {
  organization: string
  projectName: string
  project: AzureDevopsProject
}

// Dirty little hack to cache the results even after the component unmounts
const container = {
  projects: [] as MenuItem[],
  status: 'loading',
  clear: null as null | number
}

const getProjectName = (projectName, sites, organization) => {
  if (sites.length === 1) return projectName
  const site = sites.find((site) => site.id === organization)
  return `${site.name}/${projectName}`
}

const useAzureDevopsProjects = (accessToken: string, sites: AccessibleResource[]) => {
  window.clearTimeout(container.clear as number)
  const [projects, setProjects] = useState<MenuItem[]>(container.projects)
  const [status, setStatus] = useState(container.status)
  const isMountedRef = useRef(true)
  useEffect(() => {
    const fetchProjects = async () => {
      const organizations = sites.map(({id}) => id)
      const manager = new AzureDevopsClientManager(accessToken || '')
      await manager.getProjects(organizations, (err, res) => {
        if (!isMountedRef.current) return
        if (err) {
          console.error(err)
          container.status = 'error'
          setStatus('error')
        } else if (res) {
          const {organization, newProjects} = res
          const newItems = newProjects.map((project) => ({
            organization,
            projectName: getProjectName(project.name, sites, organization),
            project
          }))
          container.projects.push(...newItems)
          // important! we only mutated the current object, we need a new one to trigger a rerender
          setProjects([...container.projects])
        }
      })
      container.status = 'loaded'
      setStatus('loaded')
    }

    if (isMountedRef.current && container.projects.length === 0 && sites.length > 0) {
      fetchProjects().catch()
    }
    return () => {
      isMountedRef.current = false
      container.clear = window.setTimeout(() => {
        container.projects.length = 0
        container.status = 'loading'
      }, 10000)
    }
  }, [accessToken, sites])
  return {items: projects, status}
}

export default useAzureDevopsProjects
