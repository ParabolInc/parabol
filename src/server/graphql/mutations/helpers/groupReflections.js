import cos from 'compute-cosine-similarity';
import clusterfck from 'tayden-clusterfck';

const groupReflections = (meetingId, groupingThreshold) => {
  const card1 = {
    text: 'retros leave a bad taste in my mouth',
    entities: [
      {
        word: 'retros',
        salience: 0.54
      },
      {
        word: 'taste',
        salience: 0.33
      },
      {
        word: 'mouth',
        salience: 0.13
      }
    ]
  }

  const card2 = {
    text: 'retros are awesome i want to put them in my pocket',
    entities: [
      {
        word: 'retros',
        salience: 0.86
      },
      {
        word: 'pocket',
        salience: 0.14
      }
    ]
  };

  const card3 = {
    text: 'fixing the themes and layouts of the product is difficult in retros',
    entities: [
      {
        word: 'themes',
        salience: 0.37
      },
      {
        word: 'layouts',
        salience: 0.26
      },
      {
        word: 'product',
        salience: 0.24
      },
      {
        word: 'retros',
        salience: 0.13
      }
    ]
  }
  const cos = require();
  const x = [.54,.33,.13, 0, 0, 0, 0];
  const y = [.86, 0, 0, .14, 0, 0, 0];
  const z = [.03, 0, 0, 0, .37, .26, .23];

  const cosFn = (v1, v2) => {
    return cos(v1, v2);
  };
  const data = [x,y,z];
  const clusters = clusterfck.hcluster(data, clusterfck.max,
    clusterfck.AVERAGE_LINKAGE);
}

export default groupReflections;
