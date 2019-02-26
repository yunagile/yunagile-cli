const notice = require("./notice");
function registerCmd(program){
    program
        .command('notice')
        .option('-v,--view','查看通知公告')
        .description('通知公告')
        .action((option) => {
            notice.noticeInit();
        });
}
module.exports = { registerCmd };