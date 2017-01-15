import initStripe from 'stripe';
import {getDotenv} from '../../universal/utils/dotenv';

getDotenv();
export default initStripe(process.env.STRIPE_SECRET_KEY);
