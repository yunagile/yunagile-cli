/**
 * @description 登录操作
 * @version 1.0.1
 * @author Jie.
 */

const config = require("../config/config.json");
const encrypt = require("./encrypt");
const utils = require("./utils");
const request = require('request');
const qs = require('querystring'); 
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
//beforeLogin();
/**
 * @description 登录之前的操作
 * @param relogin 是否直接登录
 * @author Jie.
 *  */
function beforeLogin(relogin) {
    var questions = [{
        type: 'input',
        name: 'username',
        message: "请输入用户名："
    }, {
        type: 'password',
        name: 'password',
        message: "请输入密码："
    }];
    if(config['username']&&config['password']&&relogin){
        login(config['username'],config['password'],true);
    }else{
        inquirer.prompt(questions).then(function(answers) {
            var _answers = JSON.parse(JSON.stringify(answers));
            if(!_answers['username']){
                return console.log("请输入用户名！");
            }
            if(!_answers['password']){
                return console.log("请输入密码！");
            }
            login(_answers['username'],_answers['password'],false);
        });
    }
}
/**
 * @description 登录操作
 * @param username 用户名
 * @param password 密码
 * @param directLogin 是否直接登录
 * @author Jie.
 *  */
function login(username, password,directLogin) {
    /**加密密码 */
    var ps = null;
    if(directLogin){
        ps = password;
    }else{
        encrypt.setMaxDigits(130);
        var key = new encrypt.RSAKeyPair(
            "10001",
            "",
            "818e85269508bd1b747a0fa10a85e832ce461ccc2195f944430611c7ac28b0da2eb7814a57c194a4fd396d6ec802aa74353fa4f6981bdc726d79400920304e6d60780f5b55fc312831618d512c32df94133cefddedd733843cd419b9c2e6c7bb593b134018d84c6a14e1e2931ddc0d9c9342fef8c95dd3cc29552f1056c822b1"
        );
        ps = encrypt.encryptedString(key, encodeURIComponent(password));
    }
    /**post表单内容 */
    var queryData = {
        username:username,
        password:ps
    };
    var content = qs.stringify(queryData);  
    /**请求配置*/
    var options = {
        method: 'post',
        url: config.rootPath + "/loginAsAction",
        form: content,
        type:"json",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
    };
    var errorMsg = "登录出错,请稍后再试！";
    request(options, function (err, res, body) {
        if (err) {
            utils.print(errorMsg,"red");
            writeJson("","","");
        } else {
            try {
                body = JSON.parse(body);
            } catch (error) {
                body = {msg:errorMsg};
            }
            if(body&&body['status']=="SUCCESS"){
                utils.print("登录成功","green");
                writeJson(username,ps,body['data']['bsessionid']);
            }else{
                utils.print(body.msg,"red");
                writeJson("","","");
            }
        }
    });
}
function logout(){
    delete config['username'];
    delete config['password'];
    delete config['bsessionid'];
    var data = JSON.stringify(config,null,4);
    fs.writeFile(path.resolve(__dirname,"../config/config.json"),data,function(err){
        if(err){
            utils.print(err,"red");
        }else{
            utils.print("退出登录成功","green");
        }
    });
}
/**
 * @description 存到json文件中
 * @param username 用户名
 * @param password 密码
 * @param bsessionid 登录后的sessionid
 * @author Jie.
 *  */
function writeJson(username,password,bsessionid){
    config['username'] = username;
    config['password'] = password;
    config['bsessionid'] = bsessionid;
    var data = JSON.stringify(config,null,4);
    fs.writeFile(path.resolve(__dirname,"../config/config.json"),data,function(err){
        if(err){
            utils.print(err,"red");
        }
    });
}

module.exports = { beforeLogin,login,logout };