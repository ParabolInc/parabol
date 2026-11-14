// sharp loads libvips, a native library, so the first image to process loads it instead of every server's startup
const loadSharp = async () => (await import(/* webpackMode: "eager" */ 'sharp')).default

export default loadSharp
