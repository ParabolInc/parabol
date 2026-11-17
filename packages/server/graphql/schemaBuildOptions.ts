// Development and the build's schema printer still validate the SDL.
// Each schema built with these options is new, so its resolvers are added in place instead of copying every type
const schemaBuildOptions = {
  assumeValidSDL: __PRODUCTION__,
  updateResolversInPlace: true
}

export default schemaBuildOptions
