import {ContentState, convertToRaw} from 'draft-js';
import truncateCard from 'universal/utils/draftjs/truncateCard';

describe('truncateCard', () => {
  test('does not truncate 0 len', async () => {
    // SETUP
    const inStr = '';
    const contentState = ContentState.createFromText(inStr);
    const content = JSON.stringify(convertToRaw(contentState));

    // TEST
    const res = truncateCard(content);

    // VERIFY
    const outStr = res.getPlainText();
    expect(outStr).toEqual('');
  });
  test('does not truncate MAX_LEN in 1 block', async () => {
    // SETUP
    const inStr = 'this is a string that is exactly 52 chars in lengthx';
    const contentState = ContentState.createFromText(inStr);
    const content = JSON.stringify(convertToRaw(contentState));

    // TEST
    const res = truncateCard(content);

    // VERIFY
    const outStr = res.getPlainText();
    expect(outStr).toEqual(inStr);
  });
  test('does not truncate MAX_LEN in MAX blocks', async () => {
    // SETUP
    const inStr = 'this\nis\na\nstring\nthat is exactly 52 chars in lengthx';
    const contentState = ContentState.createFromText(inStr);
    const content = JSON.stringify(convertToRaw(contentState));

    // TEST
    const res = truncateCard(content);

    // VERIFY
    const outStr = res.getPlainText();
    expect(outStr).toEqual(inStr);
  });
  test('does not truncate when emoji takes char 51 and 52', async () => {
    // SETUP
    const inStr = 'this is a string that is exactly 52 chars in lengt😀';
    const contentState = ContentState.createFromText(inStr);
    const content = JSON.stringify(convertToRaw(contentState));

    // TEST
    const res = truncateCard(content);

    // VERIFY
    const outStr = res.getPlainText();
    expect(outStr).toEqual(inStr);
  });
  test('truncates last block when max blocks in exceeded', async () => {
    // SETUP
    const inStr = 'this\nis\na\nstring\nthat\nis exactly 52 chars in lengthx';
    const contentState = ContentState.createFromText(inStr);
    const content = JSON.stringify(convertToRaw(contentState));

    // TEST
    const res = truncateCard(content);

    // VERIFY
    const outStr = res.getPlainText();
    const expectedStr = 'this\nis\na\nstring\nthat';
    expect(outStr).toEqual(expectedStr);
  });
  test('truncates when max chars is exceeded in 1 block', async () => {
    // SETUP
    const inStr = 'this is a string that is exactly 52 chars in lengthxxxxxxxxxxxx';
    const contentState = ContentState.createFromText(inStr);
    const content = JSON.stringify(convertToRaw(contentState));

    // TEST
    const res = truncateCard(content);

    // VERIFY
    const outStr = res.getPlainText();
    const expectedStr = 'this is a string that is exactly 52 chars in leng...';
    expect(outStr).toEqual(expectedStr);
  });
  test('truncates when max chars is exceeded in 5 blocks', async () => {
    // SETUP
    const inStr = 'this\nis\na\nstring\nthat is exactly 52 chars in lengthxxxxxxxxxxxx';
    const contentState = ContentState.createFromText(inStr);
    const content = JSON.stringify(convertToRaw(contentState));

    // TEST
    const res = truncateCard(content);

    // VERIFY
    const outStr = res.getPlainText();
    const expectedStr = 'this\nis\na\nstring\nthat is exactly 52 chars in leng...';
    expect(outStr).toEqual(expectedStr);
  });
  test('truncates the full unicode, not half', async () => {
    // SETUP
    const inStr = 'this is a string that is exactly 52 chars in length😀';
    const contentState = ContentState.createFromText(inStr);
    const content = JSON.stringify(convertToRaw(contentState));

    // TEST
    const res = truncateCard(content);

    // VERIFY
    const outStr = res.getPlainText();
    const expectedStr = 'this is a string that is exactly 52 chars in leng...';
    expect(outStr).toEqual(expectedStr);
  });
});
