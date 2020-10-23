import qiniu from 'qiniu';

/**
 * 华为云统一认证
 */
const getToken = async ctx => {
  const options = {
    auth: { ...ctx.config.auth }
  };
  const x = await ctx.request.post('/v3/auth/tokens', options, { baseURL: ctx.config.host.token });
  const token = x.headers['x-subject-token'];
  return token;
};

/**
 * 七牛认证
 * 适用于 GET 请求
 */
const getQiniuToken = async (ctx, { url = `${ctx.config.host.qiniu.sslcert}/sslcert` } = {}) => {
  const { ak, sk } = ctx.config.qiniu.accessToken;
  const mac = new qiniu.auth.digest.Mac(ak, sk);
  const token = await qiniu.util.generateAccessToken(mac, url);
  return token;
};

/**
 * 七牛认证v2
 * 适用于 非GET 请求
 */
const getQiniuTokenV2 = async (ctx, { url, method, reqContentType, reqBody }) => {
  const { ak, sk } = ctx.config.qiniu.accessToken;
  const mac = new qiniu.auth.digest.Mac(ak, sk);
  const token = await qiniu.util.generateAccessTokenV2(mac, url, method, reqContentType, reqBody);
  return token;
};

export { getToken, getQiniuToken, getQiniuTokenV2 };
