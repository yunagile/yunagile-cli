# yunagile-cli

[![npm](https://img.shields.io/npm/v/yunagile.svg?maxAge=3600&style=flat-square)](https://www.npmjs.com/package/yunagile)
[![NPM downloads](https://img.shields.io/npm/dm/yunagile.svg?style=flat-square)](https://npmjs.org/package/yunagile)
[![NPM all downloads](https://img.shields.io/npm/dt/yunagile.svg?style=flat-square)](https://npmjs.org/package/yunagile)
[![CNPM all downloads](http://npm.taobao.org/badge/d/yunagile.svg?style=flat-square)](https://npm.taobao.org/package/yunagile)
[![GitHub last commit](https://img.shields.io/github/last-commit/qq476743842/yunagile-cli.svg?style=flat-square)](https://github.com/qq476743842/yunagile-cli/commits/dev)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/qq476743842/yunagile-cli.svg?style=flat-square)](https://github.com/qq476743842/yunagile-cli/issues?utf8=%E2%9C%93&q=)
[![Join the chat at https://gitter.im/qq476743842-yunagile-cli/chat](https://img.shields.io/gitter/room/qq476743842/yunagile-cli.svg?style=flat-square)](https://gitter.im/qq476743842-yunagile-cli/chat?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

> 一个基于 [Node.js](https://nodejs.org/en/) 的app脚手架工具

## 安装

```shell
npm i yunagile -g
或
cnpm i yunagile -g
```

## 所有命令

```shell
$ yunagile -h

Usage: index [options] [command]

Options:
  -V, --version     output the version number
  -h, --help        output usage information
 
Commands:
  login             登录至软捷后台!(只需登录一次,以后将会自动登录)
  relogin           强制重新登录!
  logout            退出登录!
  create            生成新的p9项目或者app项目
  notice [options]  通知公告
  daily [options]   日报功能(查日报,写日报)
```

## 登录 

```shell
$ yunagile login
```

登录在进行首次操作时，需要先执行 yunagile login 命令，该命令登录过一次之后将会记住密码，下次调用yunagile login 时将自动登录

## 强制登录 

```shell
$ yunagile relogin
```

强制重新登录

## 退出登录

```shell
$ yunagile logout
```

退出登录

## 通知公告

```shell
$ yunagile notice -h

Usage: notice [options]

通知公告

Options:
  -v,--view   查看通知公告
  -h, --help  output usage information
```

### 查看通知公告

```shell
$ yunagile notice -v
```
使用该命令即可查看通知公告

## 日报功能

```shell
$ yunagile daily -h

Usage: daily [options]

日报功能(查日报,写日报)

Options:
  -v,--viewself          查看我的日报
  -o,--viewother         查看他人的日报
  -w,--writeday [value]  写日报
  -s,--search [value]    搜索关键字
  -p,--project           查找项目
  -h, --help             output usage information
```

### 项目查询

```shell
$ yunagile daily -p             //查询所有项目
```

```shell
$ yunagile daily -p -s 长安      //模糊查询项目
```

### 日报填写

```shell
$ yunagile daily -w
```
注：该命令需要与dayreport.json模板进行配合使用，dayreport.json模板内容如下：

``` js
{
	"date":"2019-02-25",
	"content":"1.测试日报\n2.测试内容",
	"project":[{
		"name":"天津中环",         //可随意填写
		"code":"20171215027",     //项目编码,可通过yunagile daily -p -s 查找
		"pt":"100"                //项目占比
	}]
}
```
该模板文件必须在执行命令的目录下，如下图：

<img src="https://github.com/qq476743842/image/blob/master/cli/cli.png?raw=true"/>

当前执行命令的路径即是：C:\Users\Administrator\
所以模板文件应该复制到该目录下
