// generateJSON & generateHTML need happy-dom, megabytes of code, so the first conversion evaluates them instead of every server's startup
const loadHTMLConverters = async () => {
  const [{generateJSON}, {generateHTML}] = await Promise.all([
    import(/* webpackMode: "eager" */ './generateJSON'),
    import(/* webpackMode: "eager" */ './generateHTML')
  ])
  return {generateJSON, generateHTML}
}

export default loadHTMLConverters
