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
    ...Object.keys(peerDependencies)
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
    const importedModuleRoot = rootDirs.find((root) =>
      existsSync(path.join(root, importedModulePath))
    )
    if (importedModuleRoot) {
      diskPath = path.join(importedModuleRoot, importedModulePath)
      importPathToDiskPath[importedModulePath] = diskPath
      return diskPath
    }
    throw new Error(`Cannot find root for imported module ${importedModulePath}`)
  }
}

const makeChangePathToRelativeIfNeeded = (currentModuleDirectoryPath, isDependency, rootDirs) => {
  const getDiskPathFromImportPath = makeGetDiskPathFromImportPath(rootDirs)
  return (importedModulePath) => {
    if (isRelative(importedModulePath) || isDependency(importedModulePath)) {
      return importedModulePath
    }

    const diskPath = getDiskPathFromImportPath(importedModulePath)
    const relativePath = path.relative(currentModuleDirectoryPath, diskPath).replace(/\\/g, '/')
    return relativePath.startsWith('../') ? relativePath : `./${relativePath}`
  }
}

const sortImportsAlphabetically = (imports) => {
  imports.sort((a, b) => a.path.localeCompare(b.path))
}

const sortImportDeclarations = (importDeclarations, changePathToRelativeIfNeeded) => {
  let lastEndOfImportLine
  const importGroups = []
  importDeclarations.forEach((path) => {
    const node = path.value

    const isFirstImport = lastEndOfImportLine === undefined
    const isNewImportBlock = !isFirstImport && lastEndOfImportLine < node.loc.start.line - 1
    if (isFirstImport || isNewImportBlock) {
      importGroups.push([])
    }
    lastEndOfImportLine = node.loc.end.line

    const currentImportPath = node.source.value
    const newImportPath = changePathToRelativeIfNeeded(currentImportPath)

    importGroups[importGroups.length - 1].push({
      path: newImportPath,
      specifiers: node.specifiers
    })
  })
  importGroups.forEach(sortImportsAlphabetically)
  const flattenedImports = [].concat.apply([], importGroups)
  return flattenedImports
}

const replaceBySortedImportDeclarations = (j, importDeclarations, sortedImportDeclarations) => {
  return importDeclarations.forEach((path, index) => {
    const newImport = sortedImportDeclarations[index]
    j(path).replaceWith(j.importDeclaration(newImport.specifiers, j.literal(newImport.path)))
  })
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
  const {comments} = root.find(j.Program).get('body', 0).node

  const importDeclarations = root.find(j.ImportDeclaration)
  const sortedImportDeclarations = sortImportDeclarations(
    importDeclarations,
    changePathToRelativeIfNeeded
  )
  replaceBySortedImportDeclarations(j, importDeclarations, sortedImportDeclarations)

  root.get().node.comments = comments
  return root.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })
}
