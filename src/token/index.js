import config from '../utils/config';

const baseURL = config.host.token;

/**
 * 华为云统一认证
 */
const getToken = async ctx => {
  const options = {
    auth: { ...config.auth }
  };
  const x = await ctx.request.post('/v3/auth/tokens', options, { baseURL });
  const token = x.headers['x-subject-token'];
  ctx.token = token;
  return token;
};

export { getToken };
