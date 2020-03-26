import config from '../utils/config';

const baseURL = 'https://iam.cn-east-3.myhuaweicloud.com';

/**
 * 华为云统一认证
 */
const getToken = async ctx => {
  const options = {
    auth: {
      identity: {
        methods: ['password'],
        password: {
          user: {
            ...config.auth.identity
          }
        }
      },
      scope: {
        domain: {
          id: config.auth.scope.domain
        }
      }
    }
  };
  const x = await ctx.request.post('/v3/auth/tokens', options, { baseURL });
  const token = x.headers['x-subject-token'];
  ctx.token = token;
  return token;
};

export { getToken };
