import resolvePromiseMap from 'universal/utils/promises';

const setMeetingImports = () =>
  new Map([
    ['component', System.import(
      'universal/modules/summary/containers/MeetingSummary/MeetingSummaryContainer')]
  ]);

const getMeetingImports = (importMap) => ({
  component: importMap.get('component').default
});

export default () => ({
  path: '/summary/:meetingId',
  getComponent: async (location, cb) => {
    const promiseMap = setMeetingImports();
    const importMap = await resolvePromiseMap(promiseMap);
    const {component} = getMeetingImports(importMap);
    cb(null, component);
  }
});
