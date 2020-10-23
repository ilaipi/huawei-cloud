# huawei-cloud
后续继续支持很多的操作。

## 部署

```
cp env.example .env

# edit .env

docker-compose up -d
```

如果要改认证token，直接在`config/default.yaml`和`config/custom-environment-variables.yaml`中改成目标格式即可。



## 更新证书  refreshCer

[Ref Repo](https://github.com/ilaipi/acme.sh-docker)

通过Ref Repo来生成证书

```
docker-compose exec -e CERTIFICATE_ID={YOUR_CERTIFICATE_ID} -e DOMAIN_NAME={YOUR_DOMAIN} -e SSL_ROOT={YOUR_SSL_INSTALL_DIR} huawei npm start -- refreshCer
```

## 实现证书自动更新
复制crontab.sh.sample 为 crontab.sh

生成证书后，根据实际情况把证书信息填进crontab.sh

在运行的服务器执行crontab -e，写入：

```
# 每天3点同步本地证书到华为云
0 3 * * * sh -x /home/huawei-cloud/crontab.sh
```

## 查看证书  getCer

```
docker-compose exec -e CERTIFICATE_ID={YOUR_CERTIFICATE_ID} -e DOMAIN_NAME={YOUR_DOMAIN} -e SSL_ROOT={YOUR_SSL_INSTALL_DIR} huawei npm start -- getCer
```
