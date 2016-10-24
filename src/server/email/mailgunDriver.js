import Mailgun from 'mailgun-js';
import {getMailgunApiConfig} from './getMailgunConfig';

const config = getMailgunApiConfig();
const mailgun = config.apiKey ? new Mailgun(config) : undefined;

export default mailgun;
