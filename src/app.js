import * as consts from './utils/consts';
import * as request from './utils/request';

import { getToken } from './token/';
import { refreshCer, getCer } from './ssl/';

const ctx = {
  request,
  consts,
  supported: {
    getToken,
    refreshCer,
    getCer
  }
};

const bootstrap = async () => {
  await getToken(ctx);
  const m = [process.argv[2]];
  if (m && ctx.supported[m]) {
    await ctx.supported[m](ctx);
  }
};

bootstrap();
