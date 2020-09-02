<div align="center">
  <h1>Tuile</h1>
  <p>
    动画版豆瓣，一个动画资讯、评分、图一乐的专业社区网站。
  </p>
</div>

## 目录

1. [开发环境部署](#开发环境部署)
2. [生产环境部署](#生产环境部署)
3. [架构图](#架构图)
4. [项目文件结构](#项目文件结构)

<h2 align="center">开发环境部署</h2>

### 步骤

- 开发环境配置
  * Git
  * Node.js
  * IDE，目前用的是HBuilder X或VSCode
  * 数据库，目前用的是Wampserver64中的MySQL
- 将项目clone到本地
- npm安装依赖
```
npm install
```
- 使用others文件夹中的sql文件导入mysql数据库
- 如果IDE用的是vscode初始化生成.vscode
- 开始开发

<h2 align="center">生产环境部署</h2>

**参考**

- [菜鸟入坑：Centos配置nginx、node和mysql（阿里云ECS服务器)](https://www.jianshu.com/p/2f406e6153f6)
- [阿里云ECS服务器部署Node.js项目全过程详解](https://www.jianshu.com/p/2e31fd9eb048)
- [在Nginx或Tengine服务器上安装SSL证书](https://help.aliyun.com/document_detail/98728.html?spm=5176.2020520163.0.0.2cce56a7cKVcAw)

**安装清单**

- nginx（需要依赖pcre pcre-devel zlib-devel）
- openssl，配置HTTPS
- node（需要依赖gcc）
- pm2
- mysql
- git
- java8
- Elastic Search

**约定**

- 环境所需的软件，统一安装在`/usr/local`目录下
- 下载的安装包，统一放在`/usr/local/src`目录下
- 项目放在`/home/animebase`

### nginx

安装位置：`/usr/local/nginx`  
配置文件：`/usr/local/nginx/nginx.conf`

### node

安装位置：`/usr/local/node`  
- [CentOS下nodejs最简单的安装方法](https://www.liuzongyang.com/linux/23.html)

### pm2

全局安装

```
npm install pm2 -g
```

- [PM2 对 Node 项目进行线上部署与配置](https://www.cnblogs.com/cckui/p/10997638.html)

### mysql

安装位置：`/usr/local/mysql`
配置文件位置：`/etc/my.cnf`
使用阿里云的[数据管理控制台](https://dms.console.aliyun.com/#/dms/rsList)来连接数据库  
- [Centos 8安装 MySQL5.7.28](https://blog.csdn.net/lury_figo/article/details/104343306)  
- [手动部署MySQL数据库（CentOS 7）](https://help.aliyun.com/document_detail/116727.html?spm=5176.10695662.1996646101.searchclickresult.24a81ef8DLvYfY&aly_as=P2orehIN)  

### git

```
yum install git
```

### 配置环境变量

配置文件位置：`/root/.bash_profile`

```
PATH=$PATH:$HOME/bin:/usr/local/node/bin:/usr/local/nginx/sbin:/usr/local/mysql/bin
```

### 系统自启动

位置：`/etc/init.d`，在这里存放自启动脚本，系统启动时会自动执行  
开机后自动启动nginx、mysql、tuile服务器  

tuile脚本：  

```
#!/bin/bash
# chkconfig: 2345 10 90
# 指定2、3、4和5级别启动, 10的启动的顺序, 90是关闭的顺序
# description: tuile开机自启动脚本
# 以下是脚本内容

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/node/bin
cd /home/animebase
npm install
npm run build
npm run pm2-prod

```

### 其他

在项目中配置`config/config-override.js`文件  

<h2 align="center">架构图</h2>

- [架构图(草稿)](https://www.processon.com/view/link/5ed218f80791290770d1b472)

- [开发和生产环境下的url分发](https://www.processon.com/view/link/5ee5f3f8e0b34d4dba3a0647)

- [数据库](https://www.processon.com/view/link/5ed238e01e085306e3648b7d)

- [业务资源权限设计](https://www.processon.com/view/link/5f0150026376891e81fbd199)

<h2 align="center">业务逻辑</h2>

### 条目封面存储逻辑

- 草稿条目封面保存在temporary文件夹的用户文件夹中
- 待审核条目封面留在temporary中不变
- 已通过条目的封面保存两份，一份复制到cover文件夹中，与条目id绑定；另一份移动到cover-history文件中留档，与该条目的审核id绑定。原temporary文件夹的图片不存在了
- 历史版本条目延续已通过条目流程的封面，不用执行特定操作
- 未通过条目的封面留在temporary中不变，可能会删除
- 下架条目删除cover文件夹中的封面，cover-history文件中的封面不变

### 动画条目首播/上映日期逻辑

- 如果动画条目没有设置首播日期，则会默认生成一个未知日期（例如：9999-99-99），以此表示日期未知，排序时是最大值
- 公开的动画条目会将自己的所有的首播日期里面最早的日期冗余保存

<h2 align="center">项目文件结构</h2>

<pre>
animebase/
|
+- .vscode/
|  |
|  +- launch.json <-- VSCode 配置文件
|
+- controllers/
|  |
|  +- index.js <-- MVC Controllers
|  |
|  +- sign.js <-- 用户登录注册相关REST API
|
+- config/ <-- 各种配置相关文件
|  |
|  +- config-default.js <-- mysql默认配置文件
|  |
|  +- config-test.js <-- mysql测试配置文件
|  |
|  +- config.js <-- mysql配置文件入口
|  |
|  +- db.js <-- 如何定义Model
|  |
|  +- init-db.js <-- 测试用，没设置数据库时可用来初始化数据库
|
+- dist/ <-- webpack生成PC WEB客户端部署文件
|
+- libs/ 自定义内部使用模块
|
+- models/ <-- 存放所有Model
|  |
|  +- User.js <-- User
|
+- others/ <-- 存放建库模型及网站素材等其他文件
|
+- public/ <-- 公共资源文件
|
+- src/ <-- PC WEB客户端源文件
|  |
|  +- webpack.*.config.js <-- webpack配置文件
|
+- .gitignore <-- git忽略配置文件
|
+- app.js <-- 使用koa的js
|
+- controller.js <-- 扫描注册Controller
|
+- model.js <-- 如何导入Model
|
+- rest.js <-- 支持REST的middleware
|
+- static-files.js <-- 支持静态文件的middleware
|
+- templating.js <-- 支持Nunjucks的middleware
|
+- node_modules/ <-- npm安装的所有依赖包
|
+- package-lock.json <-- 项目描述文件
|
+- package.json <-- 项目描述文件
|
+- README.md <-- 项目基本情况描述文件
</pre>