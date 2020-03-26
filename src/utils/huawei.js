const commonHeader = ctx => ({
  'X-Auth-Token': ctx.token
});

export { commonHeader };
