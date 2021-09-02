const getReposFromQueryStr = (queryString: string | null) => {
  if (!queryString) return []
  const selectedRepos = queryString.split(' ').filter((str) => str.includes('repo:'))
  const reposLen = 'repos'.length
  return selectedRepos.map((repo) => repo.slice(reposLen))
}

export default getReposFromQueryStr
