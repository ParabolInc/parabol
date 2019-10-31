exports.up = async (r) => {
  const projects = await r
    .table('Project')
    .pluck('id', 'content', 'tags')
    .run()
  const promises = []
  projects.forEach((project) => {
    let contentWithTag = project.content || ''
    project.tags.forEach((tag) => {
      if (contentWithTag.indexOf(tag) === -1) {
        contentWithTag += ` ${tag}`
      }
    })
    if (contentWithTag !== project.content) {
      promises.push(
        r
          .table('Project')
          .get(project.id)
          .update({content: contentWithTag})
          .run()
      )
    }
  })
  try {
    await Promise.all(promises)
  } catch (e) {
    console.log('ERR', e)
  }
}

exports.down = async () => {
  // noop
}
