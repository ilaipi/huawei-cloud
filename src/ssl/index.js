import fs from 'fs';

import { commonHeader } from '../utils/huawei';

const baseURL = 'https://elb.cn-east-3.myhuaweicloud.com';

const certificate_id = '198333743cc24cc8bc43077306742a91';
const certificate_name = 'adouhealth-1';

const refreshCer = async ctx => {
  try {
    await ctx.request.request({
      baseURL,
      url: `/v2.0/lbaas/certificates/${certificate_id}`,
      data: {
        name: certificate_name,
        private_key: fs.readFileSync('/ssl/lingdou/*.adouhealth.com/*.adouhealth.com.key'),
        certificate: fs.readFileSync('/ssl/lingdou/*.adouhealth.com/*.adouhealth.com.cer')
      },
      headers: {
        ...commonHeader(ctx)
      }
    }, 'PUT');
  } catch (err) {
    console.log('====fefresh error====', err);
  }
};

export { refreshCer };
