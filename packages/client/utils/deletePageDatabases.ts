const deletePageDatabases = async () => {
  const databases = await indexedDB.databases()
  databases.forEach(({name}) => {
    if (name?.startsWith('page:')) indexedDB.deleteDatabase(name)
  })
}

export default deletePageDatabases
