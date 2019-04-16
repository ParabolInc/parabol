// const fetchAtlassianProjects = () => {
//   const cloudIds = sites.map(({id}) => id)
//   await manager.getProjects(cloudIds, (err, res) => {
//     if (!isMounted) return
//     if (err) {
//       console.error(err)
//       container.status = 'error'
//       setStatus('error')
//     } else if (res) {
//       const {cloudId, newProjects} = res
//       const newItems = newProjects.map((project) => ({
//         cloudId,
//         projectName: getProjectName(project.name, sites, cloudId),
//         project
//       }))
//       container.projects.push(...newItems)
//       // important! we only mutated the current object, we need a new one to trigger a rerender
//       setProjects([...container.projects])
//     }
//   })
// }

import {DataLoaderWorker} from 'server/graphql/graphql'

const fetchAllIntegrations = (_dataLoader: DataLoaderWorker) => {
  // fetch all atlassian integrations
}

export default fetchAllIntegrations
