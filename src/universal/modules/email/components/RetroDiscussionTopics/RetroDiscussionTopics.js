import PropTypes from 'prop-types';
import React from 'react';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import ui from 'universal/styles/ui';
import RetroDiscussionTopic from 'universal/modules/email/components/RetroDiscussionTopics/RetroDiscussionTopic';

const fontFamily = ui.emailFontFamily;

const tableStyle = {
  borderCollapse: 'collapse'
};

const sectionHeading = {
  fontFamily,
  fontSize: '18px',
  fontWeight: 600,
  textAlign: 'center'
};

const RetroDiscussionTopics = (props) => {
  const {
    imageSource,
    topics
  } = props;

  return (
    <table style={tableStyle} width="100%">
      <tbody>
      <tr>
        <td style={sectionHeading}>
          <EmptySpace height={16} />
          {'Upvoted Reflections'}
          <EmptySpace height={16} />
        </td>
      </tr>
      <tr>
        <td>
          {topics.map((topic) => <RetroDiscussionTopic imageSource={imageSource} topic={topic} />)}
        </td>
      </tr>
      </tbody>
    </table>
  );
};

RetroDiscussionTopics.propTypes = {
  imageSource: PropTypes.oneOf([
    'local',
    'static'
  ]),
  topics: PropTypes.array
};

export default RetroDiscussionTopics;
