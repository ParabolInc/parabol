// happy-dom is megabytes of code that only HTML conversion needs, so the first conversion evaluates it instead of every server's startup.
// It is a require because the conversions are synchronous
const loadHappyDom = () => require('happy-dom') as typeof import('happy-dom')

export default loadHappyDom
