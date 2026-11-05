import path from 'path'

// A build file named with webpack's content hash never changes; index.html, sw.js and the like do
const isContentHashed = (pathname: string) => /(^|_)[0-9a-f]{20,}\./.test(path.basename(pathname))

export default isContentHashed
