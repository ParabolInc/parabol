import {readFileSync} from 'fs'
import {join} from 'path'

export default function readCert() {
  return readFileSync(join(__dirname, 'cacert'), 'utf8')
}
