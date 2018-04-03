import PropTypes from 'prop-types';
import React from 'react';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import ui from 'universal/styles/ui';
import arrayToRows from '../../helpers/arrayToRows';
import checkIcon from 'universal/styles/theme/images/icons/fa-check.svg';

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

const RetroDiscussionTopics = (props) => {
  const {
    imageSource,
    topics
  } = props;

  const makeVotes = (count) => {
    const votes = [];
    const src = imageSource === 'local' ? checkIcon : '/static/images/icons/fa-check@3x.png';
    while (votes.length < count) votes.push(<img height="10" src={src} style={voteIcon} width="14" />);
    return votes;
  };

  const makeCard = (reflection) => (
    <td>
      <div style={reflectionCard}>
        {reflection.content}
      </div>
    </td>
  );

  const makeTopic = (topic) => {
    const {reflections} = topic;
    const rows = arrayToRows(reflections);
    return (
      <table style={tableStyle} width="100%">
        <tbody>
          <tr>
            <td>
              <EmptySpace height={16} />
              <div style={topicThemeHeading}>{`“${topic.theme}”`}</div>
            </td>
          </tr>
          <tr>
            <td style={votesBlock}>
              {makeVotes(topic.voteCount)}
            </td>
          </tr>
          <tr>
            <td>
              <table style={tableStyle} width="100%">
                <tbody>
                  {rows.map((row) => (
                    <tr>
                      {row.map((reflection) => makeCard(reflection))}
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
            {topics.map((topic) => makeTopic(topic))}
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
