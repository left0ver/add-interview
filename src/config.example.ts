export const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'http://xxx:12500' //端口号对应后端的端口号，域名就填写你要部署的域名即可
    : 'http://localhost:12500'
