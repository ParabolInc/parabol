// @flow
import React from 'react';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import ui from 'universal/styles/ui';
import arrayToRows from '../../helpers/arrayToRows';
import checkIcon from 'universal/styles/theme/images/icons/fa-check.svg';
import ReflectionEditorWrapperForEmail from 'universal/components/ReflectionEditorWrapperForEmail';

const fontFamily = ui.emailFontFamily;

const tableStyle = {
  borderCollapse: 'collapse'
};

const topicThemeHeading = {
  fontFamily,
  fontSize: '13px',
  fontWeight: 600,
  textAlign: 'center'
};

const votesBlock = {
  textAlign: 'center'
};

const voteIcon = {
  display: 'inline-block',
  height: '10px',
  margin: '0 4px',
  width: '14px'
};

const reflectionCard = {
  backgroundColor: 'white',
  border: `1px solid ${ui.cardBorderColor}`,
  borderRadius: '4px',
  fontFamily,
  fontSize: '13px',
  margin: '8px',
  padding: '8px'
};

type Reflection = {
  id: string,
  content: string
}
type Topic = {
  reflections: Array<Reflection>,
  title: string,
  voteCount: number
}

type Props = {
  imageSource: | 'local'
    | 'static',
  topic: Topic
}

const RetroDiscussionTopic = (props: Props) => {
  const {imageSource, topic} = props;
  const {reflections, title, voteCount} = topic;
  const rows = arrayToRows(reflections);
  const src = imageSource === 'local' ? checkIcon : '/static/images/icons/fa-check@3x.png';
  const voteRange = [...Array(voteCount).keys()];
  return (
    <table style={tableStyle} width="100%">
      <tbody>
        <tr>
          <td>
            <EmptySpace height={16} />
            <div style={topicThemeHeading}>{`“${title}”`}</div>
          </td>
        </tr>
        <tr>
          <td style={votesBlock}>
            {voteRange.map((idx) => <img key={idx} height="10" src={src} style={voteIcon} width="14" />)}
          </td>
        </tr>
        <tr>
          <td>
            <table style={tableStyle} width="100%">
              <tbody>
                {rows.map((row, idx) => (
                  // eslint-disable-next-line
                  <tr key={idx}>
                    {row.map(({id, content}) => (
                      <td key={id}>
                        <div style={reflectionCard}>
                          <ReflectionEditorWrapperForEmail content={content} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <EmptySpace height={16} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default RetroDiscussionTopic;
