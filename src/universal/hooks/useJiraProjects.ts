import {useEffect, useState} from 'react'
import AtlassianClientManager, {
  AccessibleResource,
  JiraProject
} from 'universal/utils/AtlassianClientManager'

interface MenuItem {
  label: string
  value: JiraProject
}

// Dirty little hack to cache the results even after the component unmounts
const container = {
  projects: [] as MenuItem[],
  status: 'loading',
  clear: null as null | number
}

const useJiraProjects = (accessToken: string, sites: AccessibleResource[]) => {
  let isMounted = true
  window.clearTimeout(container.clear as number)
  const manager = new AtlassianClientManager(accessToken || '')
  const [projects, setProjects] = useState<MenuItem[]>(container.projects)
  const [status, setStatus] = useState(container.status)
  useEffect(() => {
    const fetchProjects = async () => {
      const cloudIds = sites.map(({id}) => id)
      await manager.getProjects(cloudIds, (err, res) => {
        if (!isMounted) return
        if (err) {
          console.error(err)
          container.status = 'error'
          setStatus('error')
        } else if (res) {
          const {cloudId, newProjects} = res
          const site = sites.find((site) => site.id === cloudId)
          if (!site) return
          const siteName = site.name
          const newItems = newProjects.map((project) => ({
            label: `${siteName}/${project.name}`,
            value: project
          }))
          container.projects.push(...newItems)
          setProjects(container.projects)
        }
      })
      container.status = 'loaded'
      setStatus('loaded')
    }

    if (isMounted && container.projects.length === 0) {
      fetchProjects().catch()
    }
    return () => {
      isMounted = false
      container.clear = window.setTimeout(() => {
        container.projects.length = 0
        container.status = 'loading'
      }, 10000)
    }
  }, [accessToken, sites])
  return {projects, status}
}

export default useJiraProjects
