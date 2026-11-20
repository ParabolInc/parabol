const LOOPBACK_HOSTNAMES = ['127.0.0.1', '[::1]', 'localhost']

const isLoopbackHostname = (hostname: string) => LOOPBACK_HOSTNAMES.includes(hostname)

export default isLoopbackHostname
