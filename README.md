<div align="center">
<img src="https://visitor.leftover.cn?id=robot-bingbing.add-interview"/>
</div>

# Introduction

[qqRot-interview](https://github.com/robot-bingbing/qqRot-interview)项目是我开发的一个 qq 机器人，用来每日定时在 QQ 群里发送面试题，而本项目是用来帮助使用者更好地向数据库中录入面试题

# 具体效果

![leftover](https://leftover-md.oss-cn-guangzhou.aliyuncs.com/img-md/20221104001647-2022-11-04.png)

# Feature

- :necktie: 支持拖拽上传 excel 文件，从而批量上传面试题
- :beer: 支持 https 的部署
- :zap: 快速部署，只需简单修改配置文件即可

# 部署

```shell
1.首先确认您是否需要部署到https上，如若需要，需要准备好ssl证书
2.
#以下部署建议直接在服务器上进行
git clone https://github.com/robot-bingbing/add-interview
cd add-interview
cp .env.example .env
# 根据文件里的要求修改配置文件即可

3.
yarn build （打包前端项目,生成build文件夹）
yarn build:server  (打包后端项目，生成dist文件夹)

4.
部署的时候请将项目的根目录作为启动目录

对于前端的部署，推荐使用宝塔+nginx
对于后端的部署，可以直接在项目根目录运行yarn start,对于熟悉pm2的小伙伴也可以使用pm2进行部署
```

# License

[MIT](./LICENSE)
