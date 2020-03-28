import fs from 'fs';

import config from '../utils/config';

import { commonHeader } from '../utils/huawei';

const baseURL = config.host.elb;

const { CERTIFICATE_ID, DOMAIN_NAME, SSL_ROOT = '/ssl' } = process.env;

/**
 * 刷新elb的证书
 *
 * e.g.
 * SSL_ROOT = /ssl
 * DOMAIN_NAME = *.baidu.com
 * 证书文件夹路径是 /ssl/*.baidu.com/
 * 文件夹下面至少有
 * *.baidu.com.cer like: -----BEGIN CERTIFICATE-----
 * *.baidu.com.key like: -----BEGIN RSA PRIVATE KEY-----
 */
const refreshCer = async ctx => {
  if (!CERTIFICATE_ID || !DOMAIN_NAME) {
    console.warn('必须指定证书id和证书域名（支持泛域名）');
    return;
  }
  const cert = `${SSL_ROOT}/${DOMAIN_NAME}/${DOMAIN_NAME}`;
  await ctx.request.request({
    baseURL,
    url: `/v2.0/lbaas/certificates/${CERTIFICATE_ID}`,
    data: {
      private_key: fs.readFileSync(`${cert}.key`, { encoding: 'utf-8' }),
      certificate: fs.readFileSync(`${cert}.cer`, { encoding: 'utf-8' })
    },
    headers: {
      ...commonHeader(ctx)
    }
  }, 'PUT');
};

/**
 * 获取证书
 */
const getCer = async ctx => {
  await ctx.request.get(`/v2.0/lbaas/certificates/${CERTIFICATE_ID}`, null, {
    baseURL,
    headers: {
      ...commonHeader(ctx)
    }
  });
};

export { refreshCer, getCer };
