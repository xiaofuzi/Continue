## Continue----the contination programm style

在JS中，回调函数可以说无处不在，回调函数的编程范式其实有一个名词——CPS变换。基于这种方式，我简单的实现了一个基于正则的router dispatcher,也就是Continue的first commit,随着后续的不断修改，我发现connect也是基于这么一种方式来实现的，受此影响，我参照connext将部分功能进行完善，同时将如下的中间件进行重写。

## Middleware

  - csrf
  - basicAuth
  - bodyParser
  - json
  - multipart
  - urlencoded
  - cookieParser
  - directory
  - compress
  - errorHandler
  - favicon
  - limit
  - logger
  - methodOverride
  - query
  - responseTime
  - session
  - static
  - staticCache
  - vhost
  - subdomains
  - cookieSession
部分还未完成。。

## 为什么要重写？
* 虽然node的底层web框架主流的也就connect/express/koa等，但跟着看着它们每一个版本的改动以及koa的出现，我不得不考虑其架构组成的问题，不然每一个大的版本更新都会需要一定的学习成本。
* 既然打算使用connext/express这样的框架作为以后的一个主要web开发工具，那么就很有必要对其具体实现有一个比较清晰的了解
