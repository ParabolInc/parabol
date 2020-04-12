// config.js
// https://github.com/avantcredit/gql2ts/issues/229
const {
  DEFAULT_INTERFACE_BUILDER,
  DEFAULT_TYPE_BUILDER,
  DEFAULT_ENUM_TYPE_BUILDER,
  DEFAULT_EXPORT_FUNCTION
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('@gql2ts/language-typescript')

const overrides = {
  generateNamespace: (_, interfaces) => `// AUTOMATICALLY GENERATED FILE - DO NOT EDIT

  // tslint:disable

  ${interfaces}

  // tslint:enable
  `,
  interfaceBuilder: (name, body) => DEFAULT_EXPORT_FUNCTION(DEFAULT_INTERFACE_BUILDER(name, body)),
  typeBuilder: (name, body) => DEFAULT_EXPORT_FUNCTION(DEFAULT_TYPE_BUILDER(name, body)),
  enumTypeBuilder: (name, values) =>
    DEFAULT_EXPORT_FUNCTION(DEFAULT_ENUM_TYPE_BUILDER(name, values))
}

module.exports = overrides
