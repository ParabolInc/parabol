const emitTemplateTarget = 'packages/server/postgres/queries/generated/{{name}}.ts'

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
  dbUrl: 'postgres://postgres:dcac4a55540fbd2f20ca6745c2beb346@localhost:5432/pb_pg'
}

module.exports = pgtypedConfig
