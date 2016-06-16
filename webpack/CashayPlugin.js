const {transformSchema} = require('cashay');

class CashayPlugin {
  constructor({graphql, rootSchema}) {
    this.graphql = graphql;
    this.rootSchema = rootSchema;
  }

  apply(compiler) {
    compiler.plugin('compilation', async(compilation, callback) => {
      // Create a header string for the generated file:
      const clientSchema = await transformSchema(this.rootSchema, this.graphql);
      const clientSchemaString = JSON.stringify(clientSchema);
      compilation.assets['clientSchema.json'] = {
        source() {
          return clientSchemaString;
        },
        size() {
          return clientSchemaString.length;
        }
      };
      callback();
    });
  }
}
module.exports = CashayPlugin;
