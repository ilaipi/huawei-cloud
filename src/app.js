import * as consts from './utils/consts';
import * as request from './utils/request';
import config from './utils/config';

import { getToken, getQiniuToken, getQiniuTokenV2 } from './token/';
import { refreshCer, getCer, refreshQiniuCer } from './ssl/';
import { login as dockerLogin } from './docker/';

const ctx = {
  request,
  consts,
  config,
  supported: {
    getToken,
    getQiniuToken,
    getQiniuTokenV2,
    refreshCer,
    getCer,
    refreshQiniuCer,
    dockerLogin
  }
};

const bootstrap = async () => {
  const m = [process.argv[2]];
  if (m && ctx.supported[m]) {
    await ctx.supported[m](ctx);
  }
};

bootstrap();
