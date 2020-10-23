import fs from 'fs';
import { exec } from 'child_process';

import { keys } from 'lodash';

import { commonHeader } from '../utils/huawei';

/**
 * 生成docker指令，完成docker登录
 */
const login = async ctx => {
  const token = await ctx.supported.getToken(ctx);
  const url = `${ctx.config.host.docker}/v2/manage/utils/secret?projectname=cn-east-3`;
  const resp = await ctx.request.post(url, {}, {
    headers: {
      ...commonHeader(token)
    }
  });
  const { headers, data: { auths } } = resp;
  const domain = keys(auths)[0];
  const cmd = `${headers['x-swr-dockerlogin']} ${domain}`;
  console.log('====login resp====', headers, domain);
  console.log('login_command:', cmd);
  exec(cmd);
};

export { login };
