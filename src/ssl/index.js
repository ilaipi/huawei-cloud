import fs from 'fs';

import { split } from 'lodash';
import moment from 'moment';

import { commonHeader } from '../utils/huawei';
import { accessHeader } from '../utils/qiniu';

/**
 * CERTIFICATE_ID only for huawei
 * DOMAIN_NAME 证书域名
 * DOMAIN_LIST 使用证书的域名列表，多个域名之间用英文分号连接 only for qiniu
 * SSL_ROOT 证书位置
 */
const { CERTIFICATE_ID, DOMAIN_NAME, DOMAIN_LIST, SSL_ROOT = '/ssl', LIVE_DOMAIN_NAME } = process.env;

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
  const token = await ctx.supported.getToken(ctx);
  const cert = `${SSL_ROOT}/${DOMAIN_NAME}`;
  const result = await ctx.request.request({
    baseURL: ctx.config.host.elb,
    url: `/v2.0/lbaas/certificates/${CERTIFICATE_ID}`,
    data: {
      private_key: fs.readFileSync(`${cert}/${DOMAIN_NAME}.key`, { encoding: 'utf-8' }),
      certificate: fs.readFileSync(`${cert}/fullchain.cer`, { encoding: 'utf-8' })
    },
    headers: {
      ...commonHeader(token)
    }
  }, 'PUT');
  console.log('=========refreshCer========', result);
};

/**
 * 更新cdn域名证书
 * CERTIFICATE_ID: 域名id
 * DOMAIN_NAME：证书名字
 */
const refreshHuaweiCdnCer = async ctx => {
  if (!CERTIFICATE_ID || !DOMAIN_NAME) {
    console.warn('必须指定证书id和证书域名（支持泛域名）');
    return;
  }
  ctx.config.auth.scope = { domain: { name: ctx.config.auth.identity.password.user.domain.name } };
  const token = await ctx.supported.getToken(ctx);
  const cert = `${SSL_ROOT}/${DOMAIN_NAME}`;
  const certificate = fs.readFileSync(`${cert}/fullchain.cer`, { encoding: 'utf-8' });
  const result = await ctx.request.request({
    baseURL: 'https://cdn.myhuaweicloud.com',
    url: `/v1.0/cdn/domains/${CERTIFICATE_ID}/https-info`,
    data: {
      https: {
        cert_name: DOMAIN_NAME,
        force_redirect_https: 0,
        http2: 0,
        https_status: 2,
        certificate_type: 0,
        private_key: fs.readFileSync(`${cert}/${DOMAIN_NAME}.key`, { encoding: 'utf-8' }),
        certificate: certificate.replace(/\n\n/g, '\n')
      }
    },
    headers: {
      ...commonHeader(token)
    }
  }, 'PUT');
  console.log('=========refreshHuaweiCdnCer========', result);
};

/**
 * 获取证书
 */
const getCer = async ctx => {
  const token = await ctx.supported.getToken(ctx);
  const result = await ctx.request.get(`/v2.0/lbaas/certificates/${CERTIFICATE_ID}`, null, {
    baseURL: ctx.config.host.elb,
    headers: {
      ...commonHeader(token)
    }
  });
  console.log('=========getCer========', result);
};

/**
 * 证书更新到七牛
 *
 * 使用同一个证书的域名，每次一起更新
 *
 * 更新逻辑：每天都上传一次证书。七牛云上面不管证书是否重复，都会新生成一个证书。
 * 所以上传后，获取证书列表，然后把昨天日期的证书给删除。
 * 每次上传的时候，把name设置为`YYYYMMDD_${DOMAIN_NAME}`格式
 */
const refreshQiniuCer = async ctx => {
  // e.g. sub1.baidu.com & sub2.baidu.com 都是使用 *.baidu.com 这个证书
  // 那么 DOMAIN_LIST 就是sub1.baidu.com;sub2.baidu.com DOMAIN_NAME 就是 *.baidu.com
  if (!DOMAIN_NAME) {
    console.warn('必须指定证书域名（支持泛域名）');
    return;
  }
  if (!DOMAIN_LIST) {
    console.warn('必须指定使用证书的域名（七牛空间绑定的域名）');
    return;
  }
  // 1 上传证书
  const { config } = ctx;
  const cert = `${SSL_ROOT}/${DOMAIN_NAME}`;
  let token = await ctx.supported.getQiniuToken(ctx);
  const certName = `${moment(new Date()).format('YYYYMMDD')}_${DOMAIN_NAME}`;
  const resp = await ctx.request.post(
    `${config.host.qiniu.sslcert}/sslcert`,
    {
      name: certName,
      common_name: DOMAIN_NAME,
      pri: fs.readFileSync(`${cert}/${DOMAIN_NAME}.key`, { encoding: 'utf-8' }),
      ca: fs.readFileSync(`${cert}/fullchain.cer`, { encoding: 'utf-8' })
    },
    {
      headers: {
        ...accessHeader(token)
      }
    }
  );
  const { certID } = resp.data;
  try {
    if (LIVE_DOMAIN_NAME) {
      const url = `https://pili.qiniuapi.com/v2/hubs/sureemed/domains/${LIVE_DOMAIN_NAME}/cert`;
      token = await ctx.supported.getQiniuTokenV2(ctx, { url, method: 'POST', reqContentType: 'application/json', reqBody: JSON.stringify(data) });
      await ctx.request.post(
        url,
        { certName },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        },
      );
    }
  } catch (err) {
    console.log('======update live cert error', err);
  }

  // 2 设置域名证书
  let url;
  let options;
  let data;
  for (const domain of split(DOMAIN_LIST, ';')) {
    data = { certId: certID, forceHttps: false, http2Enable: true };
    url = `${config.host.qiniu.sslcert}/domain/${domain}/httpsconf`;
    token = await ctx.supported.getQiniuTokenV2(ctx, { url, method: 'PUT', reqContentType: 'application/json', reqBody: JSON.stringify(data) });
    options = { headers: { Authorization: token, 'Content-Type': 'application/json' } };
    const r = await ctx.request.request({
      url,
      data,
      ...options,
    }, 'PUT');
  }
  // 3 删除旧证书 昨天的证书因为还在生效无法删除 删除前天的即可
  const old = `${moment(new Date()).subtract(2, 'days').format('YYYYMMDD')}_${DOMAIN_NAME}`;
  // 获取全部证书，删除名字是昨天证书
  token = await ctx.supported.getQiniuToken(ctx);
  options = { headers: { Authorization: token } };
  const certs = await ctx.request.get(`${config.host.qiniu.sslcert}/sslcert`, {}, options);
  for (const { certid, name } of certs.data.certs) {
    if (name !== old) continue;
    url = `${config.host.qiniu.sslcert}/sslcert/${certid}`;
    token = await ctx.supported.getQiniuTokenV2(ctx, { url, method: 'DELETE' });
    options = { headers: { Authorization: token } };
    await ctx.request.request({
      url,
      ...options
    }, 'DELETE');
  }

  // 1 获取证书id
  // url = `${config.host.qiniu.sslcert}/domain/${split(DOMAIN_LIST, ';')[0]}`;
  // token = await ctx.supported.getQiniuTokenV2(ctx, { url, method: 'GET' });
  // options = { headers: { Authorization: token } };
  // const { data: { https } } = await ctx.request.get(url, {}, options);
  // console.log('====resp1', https);

  // url = `${config.host.qiniu.sslcert}/sslcert/${https.certId}`;
  // token = await ctx.supported.getQiniuTokenV2(ctx, { url, method: 'GET' });
  // options = { headers: { Authorization: token } };
  // const { data: { cert: { not_after } } } = await ctx.request.get(url, {}, options);
  // const invalid = moment(new Date(not_after * 1000));
  // if (invalid.isBefore(moment().add(7, 'days'))) {
    // console.log('====1====');
  // } else {
    // console.log('====2====');
  // }
  // console.log('====certs', certs.data);

  // let url = `${config.host.qiniu.sslcert}/domain/osspri.sureemed.com`;
  // token = await ctx.supported.getQiniuTokenV2(ctx, { url, method: 'GET' });
  // options = { headers: { Authorization: token } };
  // let domains = await ctx.request.get(url, {}, options);
  // console.log('====refresh qiniu cert done====', domains.data);

  // url = `${config.host.qiniu.sslcert}/domain/osspub.sureemed.com`;
  // token = await ctx.supported.getQiniuTokenV2(ctx, { url, method: 'GET' });
  // options = { headers: { Authorization: token } };
  // domains = await ctx.request.get(url, {}, options);
  // console.log('====refresh qiniu cert done====', domains.data);
};

export { refreshCer, refreshHuaweiCdnCer, getCer, refreshQiniuCer };
