const {existsSync} = require('fs')
const {_builtinLibs} = require('repl') // List of Node.js built in modules.
const path = require('path')

const makeIsDependency = (packageDir) => {
  const {dependencies, devDependencies, peerDependencies} = require(path.resolve(
    packageDir,
    'package.json'
  ))
  const allDependencies = [
    ..._builtinLibs,
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies),
    ...Object.keys(peerDependencies || {})
  ]
  return (importedModulePath) =>
    allDependencies.some(
      (name) => importedModulePath === name || importedModulePath.startsWith(`${name}/`)
    )
}

const isRelative = (importedModulePath) =>
  importedModulePath.startsWith('./') || importedModulePath.startsWith('../')

const makeGetDiskPathFromImportPath = (rootDirs) => {
  const importPathToDiskPath = {}
  return (importedModulePath) => {
    let diskPath = importPathToDiskPath[importedModulePath]
    if (diskPath) {
      return diskPath
    }
    const importedModuleRoot =
      rootDirs.find((root) => existsSync(path.join(root, importedModulePath))) || rootDirs[0]
    if (importedModuleRoot) {
      diskPath = path.join(importedModuleRoot, importedModulePath)
      importPathToDiskPath[importedModulePath] = diskPath
      return diskPath
    }
    throw new Error(`Cannot find root for imported module ${importedModulePath}`)
  }
}

const makeChangePathToRelativeIfNeeded = (currentModuleDirectoryPath, isDependency, rootDirs) => {
  // const getDiskPathFromImportPath = makeGetDiskPathFromImportPath(rootDirs)
  return (importedModulePath) => {
    if (importedModulePath.includes('__generated__') && importedModulePath.endsWith('.graphql')) {
      const fileName = importedModulePath.slice(importedModulePath.lastIndexOf('/') + 1)
      const diskPath = path.join(__dirname, 'packages', 'client', '__generated__', fileName)
      const relativePath = path.relative(currentModuleDirectoryPath, diskPath).replace(/\\/g, '/')
      // const rp = relativePath.replace('universal', 'client')
      return relativePath.startsWith('../') ? relativePath : `./${relativePath}`
    }
    return importedModulePath

    if (isRelative(importedModulePath) || isDependency(importedModulePath)) {
      return importedModulePath
    }

    const diskPath = getDiskPathFromImportPath(importedModulePath)
    const relativePath = path.relative(currentModuleDirectoryPath, diskPath).replace(/\\/g, '/')
    // const rp = relativePath.replace('universal', 'client')
    return relativePath.startsWith('../') ? relativePath : `./${relativePath}`
  }
}

module.exports = (fileInfo, api, options) => {
  const currentModuleDirectoryPath = path.dirname(path.resolve(fileInfo.path))
  const isDependency = makeIsDependency(options.packageDir)
  const rootDirs = options.rootDirs.split(',').map((rootPath) => path.resolve(rootPath))
  const changePathToRelativeIfNeeded = makeChangePathToRelativeIfNeeded(
    currentModuleDirectoryPath,
    isDependency,
    rootDirs
  )

  const j = api.jscodeshift
  const root = j(fileInfo.source)
  root.find(j.ImportDeclaration).forEach((node) => {
    node.value.source.value = changePathToRelativeIfNeeded(node.value.source.value)
  })

  root.find(j.CallExpression).forEach((node) => {
    const {callee} = node.value
    if (callee.type === 'Import') {
      node.value.arguments[0].value = changePathToRelativeIfNeeded(node.value.arguments[0].value)
    }
  })

  return root.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })
}
