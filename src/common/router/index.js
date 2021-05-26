// 路由监听
const history = require('history');

const CreateRouterHistory = history.createHashHistory;
const routerHistory = new CreateRouterHistory();
routerHistory.listen((action, location) => {
    //dosomething
    console.log(action, location);
});
//导出的路由模式可以使用push方法等
module.exports = routerHistory;
