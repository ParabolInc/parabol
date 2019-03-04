import {exec} from 'child_process'
import {promisify} from 'util'

const execAsync = promisify(exec)

const initDb = ({restore}: {restore: string}) => async () => {
  return execAsync(restore)
}

export default initDb
