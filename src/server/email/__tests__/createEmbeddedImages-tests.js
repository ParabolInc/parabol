import test from 'ava';
import createEmbeddedImages from '../createEmbeddedImages';

test('throws if no html is provided', t => {
  t.throws(() => {
    return createEmbeddedImages();
  });
});

const HTML_DOC = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html dir="ltr">
    <head><title>Welcome to Action by Parabol</title></head>
    <body>
      <p>Replace some images!</p>
      <img src="/static/images/email/action-email-header@2x.png" />
      <div>
        Get loud!
        <img src="/static/images/email/email-icon-megaphone@2x.png" />
      </div>
    </body>
  </html>
`;

test('returns html with embedded attachments', t => {
  t.plan(8);

  const result = createEmbeddedImages(HTML_DOC);

  t.true('html' in result);
  t.true('attachments' in result);
  t.is(result.attachments.length, 2);

  t.false(!result.attachments[0].filename);
  t.false(!result.attachments[0].path);
  t.false(!result.attachments[0].cid);

  result.attachments.forEach(attachment => {
    const {cid} = attachment;
    t.regex(result.html, new RegExp(`img src="cid:${cid}"`));
  });
});

const HTML_DOC_ONE_IMG_NOT_EXIST = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html dir="ltr">
    <head><title>Welcome to Action by Parabol</title></head>
    <body>
      <p>Replace some images!</p>
      <img src="/static/images/email/action-email-header@2x.png" />
      <div>
        Get loud!
        <img src="/static/images/email/not_present.png" />
      </div>
    </body>
  </html>
`;

test('omits non-existing files ', t => {
  t.plan(3);

  const result = createEmbeddedImages(HTML_DOC_ONE_IMG_NOT_EXIST);

  t.true('html' in result);
  t.true('attachments' in result);
  t.is(result.attachments.length, 1);
});

const HTML_DOC_EXTERNAL_ASSETS = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html dir="ltr">
    <head><title>Welcome to Action by Parabol</title></head>
    <body>
      <p>Replace some images!</p>
      <img src="http://another.server/action-email-header@2x.png" />
      <div>
        Get loud!
        <img src="another/path/images/email/not_present.png" />
      </div>
    </body>
  </html>
`;

test('omits external assets', t => {
  t.plan(3);

  const result = createEmbeddedImages(HTML_DOC_EXTERNAL_ASSETS);

  t.true('html' in result);
  t.true('attachments' in result);
  t.is(result.attachments.length, 0);
});
