/**
 * Release Flags are feature flags that are immutable for a given release.
 *
 * They're exposed to the client via webpack.DefinePlugin, which allows us to
 * take advantage of UglifyJS' dead code eliminator.  If you want to use a
 * release flag on the client, DO NOT IMPORT from this module.  Instead,use
 * the global __RELEASE_FLAGS__.<featureName>.  To take advantage of DCE, you
 * will have to directly pass the name to a control structure, rather than passing
 * it to a function. e.g.
 *
 *   <div>
 *     {__RELEASE_FLAGS__.newThing && <NewThing />}
 *     {__RELEASE_FLAGS__.foo ? <Foo /> : <Bar />}
 *   </div>
 *
 * They're exposed to the GraphQL server via context.releaseFlags
 *
 */

export default {}
