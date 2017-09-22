import {FACILITATOR_REQUEST} from 'universal/utils/constants';

const ephemeralNotifications = [FACILITATOR_REQUEST];
const isNotificationEphemeral = (type) => ephemeralNotifications.includes(type);

export default isNotificationEphemeral;
