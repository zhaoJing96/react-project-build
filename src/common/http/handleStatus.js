import { message } from 'antd';
export function checkStatus(response) {
    if (!response) {
        const noRes = { code: null, data: null, msg: '接口没有响应' };
        message.error(noRes.msg);
        return noRes;
    }
    let errorMsgTips = null;
    const data = response.data;
    const requestStatus = response && response.status === 200;
    //请求成功
    if (requestStatus) {
        if (data.code !== 200) {
            errorMsgTips = data.msg || '未知错误';
            if (data.code === 401) {
                //token失效
                errorMsgTips = '登录已过期,请重新登录';
            }
            message.error(errorMsgTips);
            return { code: data.code, data: {}, msg: errorMsgTips };
        }
    }
    //请求失败
    if (!requestStatus) {
        const statusObj = {
            401: '请求授权失败',
            403: '请求不允许,无操作权限',
            404: '没有发现文件、查询地址或URl',
            405: 'Request-Line字段定义的方法不允许',
            500: '服务器内部错误,' + response.statusText,
            502: 'Nginx配置网关受限或超时等,' + response.statusText,
            503: '服务器访问受限,' + response.statusText,
            504: '网关超时,' + response.statusText
        };
        errorMsgTips = statusObj[response.status] || '未知错误';
        console.error(response.status, statusObj[response.status], response);
        if (errorMsgTips) {
            message.error(errorMsgTips);
        }
        return { code: response.status, data: {}, msg: errorMsgTips };
    }
    return data;
}
