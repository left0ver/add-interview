// 如果你部署的时候想使用https,则下面的url请修改为对应的https（后端端接口也需要使用https，需要ssl证书，具体请看.env.prod文件）
export const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'http://xxx:12500' //端口号对应后端的端口号，域名就填写你要部署的域名即可
    : 'http://localhost:12500' //本地开发调试的时候的地址，一般来说你不需要管
