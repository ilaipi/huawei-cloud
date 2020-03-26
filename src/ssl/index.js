import { commonHeader } from '../utils/huawei';

const baseURL = 'https://elb.cn-east-3.myhuaweicloud.com';

const certificate_id = '198333743cc24cc8bc43077306742a91';
const certificate_name = '';

const refreshCer = async ctx => {
  await ctx.request.request({
    baseURL,
    url: `/v2.0/lbaas/certificates/${certificate_id}`,
    data: {
      name: certificate_name,
      private_key: 'xx',
      certificate: 'xxx'
    },
    headers: {
      ...commonHeader(ctx)
    }
  }, 'PUT');
};

export { refreshCer };
