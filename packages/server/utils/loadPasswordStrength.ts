// the zxcvbn dictionaries hold megabytes of heap, so the first password check evaluates them instead of every server's startup
const loadPasswordStrength = async () =>
  (await import(/* webpackMode: "eager" */ 'parabol-client/shared/passwordStrength'))
    .passwordStrength

export default loadPasswordStrength
