const inquirer = require('inquirer');
const ajax = require('../../scripts/post');
const utils = require('../../scripts/utils');

var params = {
    page:1,
    rows: 8,
    noticeTypeId: "",
    examineStateCode: "0"
};
/**通知公告入口 */
function noticeInit(){
    var cdata = [
        {
            name:"未读通知",
            value:"0"
        },
        {
            name:"已读通知",
            value:"1"
        }
    ];
    var promptList = [{
        type: 'list',
        message: '您想查看?',
        name: 'type',
        choices: cdata,
        filter: function (val) { 
            return val.toLowerCase();
        }
    }];
    inquirer.prompt(promptList).then((data) => {
        var _data = JSON.parse(JSON.stringify(data));
        if(_data['type']['value']==cdata[0]['value']){
            params['examineStateCode'] = "0";
        }else if(_data['type']==cdata[1]['value']){
            params['examineStateCode'] = "1";
        }
        queryNotice();
    });
}
function queryNotice() {
    ajax.post("/notice/queryCompanyNoticeAction",params,function(data,flag,msg){
        if(flag){
            var cdata = JSON.parse(data.data.data);
            var rows = cdata.rows;
            if(rows && rows.length==0){
                utils.print("暂无通知公告!");
            }else{
                var dataList = [];
                for(var i in rows){
                    let obj = {
                        name:rows[i]['title'],
                        value:getHtmlText(rows[i]['content'])
                    };
                    dataList.push(obj);
                }
                var promptList = [{
                    type: 'list',
                    message: '您想查看哪条通知呢？',
                    name: 'data',
                    choices: dataList
                }];
                //console.log(dataList);
                inquirer.prompt(promptList).then((sdata) => {
                    var _data = JSON.parse(JSON.stringify(sdata));
                    console.log(_data['data']);
                });
            }
        }else{
            utils.print("查询通知公告出错!","red");
        }
    });
}
function getHtmlText(html) {
    html += "";
    if (html && html != "null" && html != null) {
      var content = html
        .replace(/<\/?.+?>/g, "")
        .replace(/[ ]|[&nbsp;]/g, "");
      return content;
    } else {
      return "无内容";
    }
};

module.exports = { noticeInit };