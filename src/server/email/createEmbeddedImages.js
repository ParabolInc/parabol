import cheerio from 'cheerio';
import path from 'path';
import shortid from 'shortid';
import fs from 'fs';

const STATIC_ASSETS = path.join(__dirname, '../../../static');

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

 /**
 * Given an HTML document, returns a new HTML document containing embedded
 * images and an array of attachments suitable for embedding in an email.
 *
 * Searchs input HTML document for img tags. If src URN matches `urnPrefix`
 * and exists within fsPath, it will replace the src with an embedded cid
 * and add the path to the list of returned attachments.
 *
 * @param {Object} mailcomposer compatible object, including html key
 * @param {String} urnPrefix
 * @param {String} fsPath
 * @return {Object} replaced html key and attachments key
 */
const createEmbeddedImages = (email, urnPrefix = '/static', fsPath = STATIC_ASSETS) => {
  if (!('html' in email)) {
    // nothing to do:
    return email;
  }
  const {html} = email;
  const attachments = [];

  const $ = cheerio.load(html);
  $('body').find('img').each((i, img) => {
    const pathname = $(img).attr('src');

    if (!pathname || !pathname.startsWith(urnPrefix)) {
      return;
    }

    const relPath = path.normalize(
      path.join(fsPath, pathname.slice(urnPrefix.length))
    );

    if (!fileExists(relPath)) {
      return;
    }

    const filename = path.parse(pathname).base;
    const cid = shortid.generate();
    attachments.push({
      filename,
      path: relPath,
      cid
    });
    $(img).attr('src', `cid:${cid}`);
  });

  return {
    ...email,
    html: $.html(),
    attachments
  };
};

export default createEmbeddedImages;
