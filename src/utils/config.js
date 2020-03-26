import path from 'path';

import dotenv from 'dotenv';
import { merge } from 'lodash';

// external .env
const env = dotenv.config().parsed || {};

// custom env: production prod
env.production = process.env.NODE_ENV === 'production';
env.prod = env.production && process.env.NODE_APP_INSTANCE === 'production';
merge(env);

const config = require('config');
merge(config, { env });

export default config;
