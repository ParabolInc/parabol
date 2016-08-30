import segmentSnippet from 'segmentio-snippet';
import {getDotenv} from '../../src/universal/utils/dotenv';

// Import .env and expand variables:
getDotenv();

if (process.env.SEGMENT_WRITE_KEY) {
  const snippet = segmentSnippet.min({
    host: 'cdn.segment.com',
    apiKey: process.env.SEGMENT_WRITE_KEY
  });
  console.log(JSON.stringify(snippet));
} else {
  console.log(JSON.stringify('<!-- segment io snippet disabled -->'));
}
