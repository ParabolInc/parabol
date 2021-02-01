import * as db from 'zapatos/db'

/* todo: allow verbose debug output in dev env */
db.setConfig({
  castArrayParamsToJson: true,
  castObjectParamsToJson: true
})

export default db
