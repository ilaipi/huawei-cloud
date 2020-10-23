const accessHeader = token => ({
  'Authorization': token,
  'Content-Type': 'application/json'
});

/**
 * 把证书上次到七牛云，获取证书id
 *
 * 每次上传前，先检查证书有效期。有效期小于7天，则更新。否则不上传
 * @param { Object } 全局ctx
 * @return { String } certID
 */
const uploadCer = async ctx => {
};

/**
 * 证书上传后，需要把证书设置到对应的域名
 */
const setCer = async ctx => {
};

/**
 * 因为七牛这边每次上次同一个域名的证书都会新增一条记录
 *
 * 不管域名是否相同，证书是否相同
 *
 * 所以需要定期删除。
 *
 * 删除规则：不是当天日期的证书，删除
 */
const deleteCers = async ctx => {
};

export { accessHeader };
