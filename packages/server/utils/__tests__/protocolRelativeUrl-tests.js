/* eslint-env jest */
import path from 'path'
import url from 'url'
import protocolRelativeUrl from '../protocolRelativeUrl'

test('parses protocol-relative URL', () => {
  const testUrl = '//s3-host.prbl.co/test'
  const result = protocolRelativeUrl.parse(testUrl)
  // Object.assign drops result's class:
  expect(Object.assign({}, result)).toEqual({
    protocol: '//',
    slashes: true,
    auth: null,
    host: 's3-host.prbl.co',
    port: null,
    hostname: 's3-host.prbl.co',
    hash: null,
    search: null,
    query: null,
    pathname: '/test',
    path: '/test',
    href: '//s3-host.prbl.co/test'
  })
})

test('still parses regular URLs', () => {
  const testUrl = 'http://s3-host.prbl.co/test'
  const result = protocolRelativeUrl.parse(testUrl)
  expect(result).toEqual(url.parse(testUrl))
})

test('formats protocol-relative URLs', () => {
  const parsedUrl = {
    protocol: '//',
    slashes: true,
    auth: null,
    host: 's3-host.prbl.co',
    port: null,
    hostname: 's3-host.prbl.co',
    hash: null,
    search: null,
    query: null,
    pathname: '/test',
    path: '/test',
    href: '//s3-host.prbl.co/test'
  }
  expect('//s3-host.prbl.co/test').toEqual(protocolRelativeUrl.format(parsedUrl))
  parsedUrl.pathname = path.join(parsedUrl.pathname, '/subdir')
  expect('//s3-host.prbl.co/test/subdir').toEqual(protocolRelativeUrl.format(parsedUrl))
})

test('still formats regular URLs', () => {
  const parsedUrl = {
    protocol: 'http:',
    slashes: true,
    auth: null,
    host: 's3-host.prbl.co',
    port: null,
    hostname: 's3-host.prbl.co',
    hash: null,
    search: null,
    query: null,
    pathname: '/test',
    path: '/test',
    href: 'http://s3-host.prbl.co/test'
  }
  expect('http://s3-host.prbl.co/test').toEqual(protocolRelativeUrl.format(parsedUrl))
  parsedUrl.pathname = path.join(parsedUrl.pathname, '/subdir')
  expect('http://s3-host.prbl.co/test/subdir').toEqual(protocolRelativeUrl.format(parsedUrl))
})
