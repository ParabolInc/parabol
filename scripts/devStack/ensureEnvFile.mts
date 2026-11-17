import {execFileSync} from 'child_process'
import fs from 'fs'
import path from 'path'

// .env is gitignored, so a new git worktree starts without one. It is copied from the main checkout
const ensureEnvFile = (projectRoot: string) => {
  const envPath = path.join(projectRoot, '.env')
  if (fs.existsSync(envPath)) return
  const gitCommonDir = execFileSync(
    'git',
    ['rev-parse', '--path-format=absolute', '--git-common-dir'],
    {cwd: projectRoot, encoding: 'utf8'}
  ).trim()
  const mainEnvPath = path.join(path.dirname(gitCommonDir), '.env')
  if (mainEnvPath === envPath || !fs.existsSync(mainEnvPath)) {
    throw new Error('No .env found. Copy .env.example to .env & fill it in')
  }
  fs.copyFileSync(mainEnvPath, envPath)
  console.log(`Copied .env from ${mainEnvPath}`)
}

export default ensureEnvFile
