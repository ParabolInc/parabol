import SegmentIo from 'analytics-node';
import getDotenv from '../universal/utils/dotenv';

getDotenv();

// const segmentIoOpts = process.env.NODE_ENV === 'production' ?
//  { flushAt: 20, flushAfter: 10000} : { flushAt: 1 };
const segmentIoOpts = { flushAt: 1 };
const segmentIo = process.env.SEGMENT_WRITE_KEY ?
  new SegmentIo(process.env.SEGMENT_WRITE_KEY, segmentIoOpts) : {
  // no environment variable? Mock it!
    identify: () => true,
    track: () => true
  };

export default segmentIo;
