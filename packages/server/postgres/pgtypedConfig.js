require('../../../scripts/webpack/utils/dotenv')
const ssl = require('./getPgSSL')()

const emitTemplateTarget = 'packages/server/postgres/queries/generated/{{name}}.ts'

console.log('===process.env.POSTGRES_URL', process.env.POSTGRES_URL)

const pgtypedConfig = {
  transforms: [
    {
      mode: 'sql',
      include: '**/*.sql',
      emitTemplate: emitTemplateTarget
    },
    {
      mode: 'ts',
      include: '**/*.ts',
      emitTemplate: emitTemplateTarget
    }
  ],
  srcDir: 'packages/server/postgres/queries/src',
  camelCaseColumnNames: false,
  dbUrl: process.env.POSTGRES_URL
}

module.exports = pgtypedConfig
