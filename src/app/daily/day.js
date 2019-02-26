const ajax = require('../../scripts/post');
const utils = require('../../scripts/utils');
const data = require('../../scripts/data');
const fs = require("fs");
const ph = require("path");
var dayConfig = null;
/**查看项目 */
function projectlist(search,callback){
    var params = {
        keywords : search || "",
        state:'',
        typeCode:''
    }
    ajax.post("/oa/weekItemQueryAction",params,(data,flag,msg)=>{
        if(flag){
            var cdata = JSON.parse(data.data.data);
            var rows = cdata.rows;
            if(rows && rows.length==0){
                utils.print("未搜索到项目!");
            }else{
                if(callback){
                    callback(rows);
                }else{
                    for(var i in rows){
                        var name = rows[i]['name'];
                        var code = rows[i]['code'];
                        console.log((i*1+1)+"."+name+","+code);
                    }
                }
            }
        }else{
            utils.print("查询项目出错!","red");
        }
    });
}
/**data的配置 */
var dayDataConfig = {
    queryAction:{
        url:"/oa/queryDailyReportAction",
        param:{
            'dayTime':''
        }
    },
    saveAction:{
        url:"/oa/dailyReportSaveAction"
    },
    newAction:{
        url:"/oa/dailyReportNewAction",
        param:{
            'dayTime':''
        }
    }
};
var itemDataConfig = {
    newAction: {
        url: "/oa/dailyReportDetailNewAction"
    },
    saveAction: {
        url: "/oa/dailyReportDetailSaveAction"
    },
    queryAction: {
        url: "/oa/dailyReportDetailQueryAction",
        param: {
            'masterId':"1"
        }
    },
};
var dayData = data.creat('dayData',dayDataConfig);
var itemData = data.creat('itemData',itemDataConfig);
/**编写日报 */
function writeDaily(){
    var path = ph.resolve(process.cwd(),"./dayreport.json");
    var exists = fs.existsSync(path);
    if(!exists) return utils.print("根目录下没发现日报配置文件!","red");
    /**读取日报配置文件 */
    readDayConfig(path,(sdata)=>{
        if(!sdata['date']){
            return utils.print("请设置填写日报的日期！","red");
        }
        dayDataConfig.queryAction.param.dayTime = sdata['date'];
        dayDataConfig.newAction.param.dayTime = sdata['date'];
        dayData.clear();
        dayData.refreshData((cdata,flag,msg)=>{
            if(flag){
                if(cdata.length >0){
                    dayData.selectRow(cdata[0]['id']);
                    queryItem(dayData.getValue("id"));
                }else{
                    dayData.newData((rowId,flag)=>{
                        if(flag){
                            dayData.selectRow(rowId);
                            createItem(dayData.getValue("id"));
                        }else{
                            utils.print("新建日报失败","red");
                        }
                    });
                }
            }else{
                utils.print("获取日报信息失败","red");
            }
        });
    });
};
/*查询项目之后填写日报*/
function queryItem(mid){
    itemDataConfig.queryAction.param.masterId = mid;
    itemData.refreshData((data,flag,msg)=>{
        if(flag){
            //删除item中的数据
            for(var i in data){
                itemData.deleteByRowID(data[i]['id']);
            }
            createItem(mid);
        }else{
            utils.print("获取项目信息失败","red")
        }
    });
};
/*查询项目的数据并且创建item*/
function createItem(mid){
    var items = dayConfig["project"];
    if(!items || items.length<0) {
        return utils.print("请在配置文件中设置项目情况!","red");
    }
    /*判断项目数据是否占比为100%*/
    var all_pt = 0;
    for(var i in items){
        all_pt += items[i]['pt'] * 1;
    }
    if(all_pt!=100) return utils.print("项目占比总和必须为100%!","red");
    var po = [];
    for(var i in items){
        po.push(queryProject(items[i]['code'],items[i]['pt']));
    }
    /*查询到了项目数据*/
    Promise.all(po).then((data)=>{
        //utils.print(data);
        if(data.length>0){
            itemData.newData((rowId,flag)=>{
                if(!Array.isArray(rowId)){
                    setItemData(data[0]["name"],data[0]["code"],data[0]["pmName"],
                        data[0]["pmCode"],data[0]['pt'],mid,rowId);
                }else{
                    for(var i =0;i<rowId.length;i++){
                        setItemData(data[i]["name"],data[i]["code"],data[i]["pmName"],
                            data[i]["pmCode"],data[i]['pt'],mid,rowId[i]);
                    }
                }
                //去写日报
                saveData();
            },data.length);
            function setItemData (name,code,pmName,pmCode,scale,masterId,rowid){
                itemData.setValue("name", name, rowid);
                itemData.setValue("code", code, rowid);
                itemData.setValue("pmName", pmName, rowid);
                itemData.setValue("pmCode", pmCode, rowid);
                itemData.setValue("scale", scale, rowid);
                itemData.setValue("masterId", masterId, rowid);
            }
        }else{
            utils.print('未查询到项目数据!', "red");
        }
    });
};
function saveData(){
    var content = dayConfig["content"];
    var createtime = dayConfig["time"];
    if(!content) return utils.print('请配置日报内容!', "red");
    dayData.setValue("content",content);
    dayData.setValue("remark",content);
    if(createtime) {
        var h = Math.floor(Math.random() * 99999999);
        var c_date = new Date(createtime).getTime() + h;
        dayData.setValue("createTime",c_date);
    }
    dayData.save((flag)=>{
        if(flag){
            itemData.save((flag)=>{
                if(flag){
                    utils.print("一键写日报成功","green");
                }else{
                    utils.print("保存项目数据错误!","red");
                }
            });
        }else{
            utils.print('保存日报内容失败!', "red");
        }
    });
};
function queryProject(itemcode,itempt){
    return new Promise((resolve, reject)=> {
        projectlist(itemcode,(rows)=>{
            for(var i in rows){
                rows[i]['pt'] = itempt;
            }
            resolve(rows?rows[0]:null);
        });
    });
};
function readDayConfig(path,callback){
    fs.readFile(path, 'utf-8', (err, data)=> {
        if (err) {
            utils.print('日报配置文件读取失败!', "red");
            callback && callback(null);
        } else {
            try {
                var re = dayConfig = JSON.parse(data);
                callback && callback(re);
            } catch (e) {
                callback && callback(null);
            }
        }
    });
};
module.exports = { projectlist,writeDaily };