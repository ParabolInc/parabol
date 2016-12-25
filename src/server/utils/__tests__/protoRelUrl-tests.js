import test from 'ava';
import path from 'path';
import url from 'url';
import protoRelUrl from '../protoRelUrl';


test('parses protocol-relative URL', t => {
  const testUrl = '//s3-host.prbl.co/test';
  const result = protoRelUrl.parse(testUrl);
  // Object.assign drops result's class:
  t.deepEqual(Object.assign({}, result), {
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
  });
});

test('still parses regular URLs', t => {
  const testUrl = 'http://s3-host.prbl.co/test';
  const result = protoRelUrl.parse(testUrl);
  t.deepEqual(result, url.parse(testUrl));
});

test('formats protocol-relative URLs', t => {
  t.plan(2);
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
  };
  t.deepEqual('//s3-host.prbl.co/test', protoRelUrl.format(parsedUrl));
  parsedUrl.pathname = path.join(parsedUrl.pathname, '/subdir');
  t.deepEqual('//s3-host.prbl.co/test/subdir', protoRelUrl.format(parsedUrl));
});

test('still formats regular URLs', t => {
  t.plan(2);
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
  };
  t.deepEqual('http://s3-host.prbl.co/test', protoRelUrl.format(parsedUrl));
  parsedUrl.pathname = path.join(parsedUrl.pathname, '/subdir');
  t.deepEqual('http://s3-host.prbl.co/test/subdir', protoRelUrl.format(parsedUrl));
});
