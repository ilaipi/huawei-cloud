# ---- Base Node ----
FROM node:12.16-alpine3.11 AS base
ENV BASE_DIR /app
# set up the timezone to Shanghai
RUN ln -fs /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# Create app directory
WORKDIR $BASE_DIR

FROM base AS dependencies
COPY ./package*.json ./
RUN npm install --registry=https://registry.npm.taobao.org

FROM base AS src
COPY ./ $BASE_DIR/
RUN rm -fr src .git .env .env.example .gitignore Dockerfile package-lock.json yarn.lock .eslintrc

# ---- Copy Files/Build ----
FROM base AS release
COPY --from=dependencies $BASE_DIR/node_modules/ ./node_modules/
COPY --from=src $BASE_DIR/ $BASE_DIR/

CMD ["node"]
