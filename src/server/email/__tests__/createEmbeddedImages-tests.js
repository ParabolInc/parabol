import createEmbeddedImages from '../createEmbeddedImages';

test('throws if no html is provided', () => {
  expect(() => createEmbeddedImages()).toThrow();
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

test('returns html with embedded attachments', () => {
  const result = createEmbeddedImages(HTML_DOC);

  expect('html' in result).toBeTruthy();
  expect('attachments' in result).toBeTruthy();
  expect(result.attachments.length).toBe(2);

  expect(!result.attachments[0].filename).toBeFalsy();
  expect(!result.attachments[0].path).toBeFalsy();
  expect(!result.attachments[0].cid).toBeFalsy();

  result.attachments.forEach(attachment => {
    const {cid} = attachment;
    expect(result.html.match(new RegExp(`img src="cid:${cid}"`))).toBeTruthy();
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

test('omits non-existing files ', () => {
  const result = createEmbeddedImages(HTML_DOC_ONE_IMG_NOT_EXIST);

  expect('html' in result).toBeTruthy();
  expect('attachments' in result).toBeTruthy();
  expect(result.attachments.length).toBe(1);
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

test('omits external assets', () => {
  const result = createEmbeddedImages(HTML_DOC_EXTERNAL_ASSETS);

  expect(result.hasOwnProperty('html')).toBeTruthy();
  expect(result.hasOwnProperty('attachments')).toBeTruthy();
  expect(result.attachments.length).toBe(0);
});
