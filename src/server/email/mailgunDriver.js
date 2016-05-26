import Mailgun from 'mailgun-js';
import {getMailgunApiConfig} from './getMailgunConfig';

const config = getMailgunApiConfig();
const mailgun = new Mailgun(config);

export default mailgun;
