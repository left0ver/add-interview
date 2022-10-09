[qqRot-interview](https://github.com/robot-bingbing/qqRot-interview)项目是我开发的一个 qq 机器人，用来每日定时在 QQ 群里发送面试题，而本项目是用来帮助使用者更好地向数据库中录入面试题

# Example

![leftover](https://leftover-md.oss-cn-guangzhou.aliyuncs.com/img-md/20221009203615-2022-10-09.png)

# Feature

- :necktie: 支持拖拽上传.txt 文件，从而批量上传面试题
- :beer: 支持 https 的部署

# 部署

```shell
1.
#以下部署建议直接在服务上进行
git clone https://github.com/robot-bingbing/add-interview
cd add-interview
cp .env.example.prod .env.prod
cp  ./server/config.example.ts ./server/config.ts
cp  ./src/config.example.ts ./src/config.ts

2.
首先确认您是否需要部署到https上，如若需要，需要准备好ssl证书
在服务器上创建数据库
之后修改server/config.ts文件中的生产环境下数据库的配置以及需要监听的端口号

3.
修改.env.prod文件中的配置（文件中有注释）
修改 src/config.ts文件中的配置（文件中有注释）

4.
yarn build （打包前端项目,生成build文件夹）
yarn build:server  (打包后端项目，生成dist文件夹)

5.
#如果以上操作部署在服务器上进行，则需要先把整个项目上传到服务器上
对于前端的部署，推荐使用宝塔+nginx
对于后端的部署，可以直接在项目根目录运行yarn start,对于熟悉pm2的小伙伴也可以使用pm2进行部署
# 后端项目部署成功之后会初始化数据库
```

# License

[MIT](https://github.com/robot-bingbing/add-interview/blob/main/LICENSE)
