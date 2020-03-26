import * as consts from './utils/consts';
import * as request from './utils/request';

import { getToken } from './token/';
import { refreshCer } from './ssl/';

const ctx = {
  request,
  consts,
  supported: {
    getToken,
    refreshCer
  }
};

const bootstrap = async () => {
  await getToken(ctx);
  await ctx.supported[process.argv[2]](ctx);
};

bootstrap();
