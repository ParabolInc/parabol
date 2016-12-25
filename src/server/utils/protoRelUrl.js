import url from 'url';

/*
 * Node's url.parse is unable to handle protocol-relative URLs
 * such as '//host/path1/path2'. This method extends Node's url.parse
 * method.
 */

const protoRelUrl = Object.assign({}, url);

protoRelUrl.parse = (urlString, parseQueryString, slashesDenoteHost) => {
  if (urlString.startsWith('//')) {
    const urlStringWithProto = `http:${urlString}`;
    const result = url.parse(
      urlStringWithProto, parseQueryString, slashesDenoteHost
    );
    result.protocol = '//';
    result.href = urlString;

    return result;
  }

  return url.parse(urlString, parseQueryString, slashesDenoteHost);
};

protoRelUrl.format = (urlObject) => {
  if (typeof urlObject === 'string') {
    urlObject = protoRelUrl.parse(urlObject);
  }
  if (urlObject.protocol === '//') {
    const urlObjectWithProto = Object.assign({}, urlObject, {
      protocol: 'http:',
      href: `http:${urlObject.href}`
    });
    return url.format(urlObjectWithProto).replace('http:', '');
  }

  return url.format(urlObject);
};

export default protoRelUrl;
