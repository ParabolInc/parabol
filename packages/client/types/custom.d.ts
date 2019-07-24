declare module '*.svg' {
  const content: any
  export default content
}

declare module '*.graphql' {
  const content: any
  export default content
}

// the path to the CDN or the static folder
declare const __webpack_public_path__
