// 公共方法
import constant from '@/common/utils/constant.js';
//token,get
export function getToken() {
    return localStorage.getItem(constant.storage.currentToken);
}
//token,set
export function setToken(token) {
    window.localStorage.setItem(constant.storage.currentToken, token);
}
//token,rm
export function removeToken() {
    return window.localStorage.removeItem(constant.storage.currentToken);
}
//uuid
export function getUUid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
//深拷贝
export function deepClone(source, key) {
    const targetObj = source.constructor === Array ? [] : {};
    for (const keys in source) {
        if (source.hasOwnProperty(keys)) {
            if (source[keys] && typeof source[keys] === 'object') {
                targetObj[keys] = source[keys].constructor === Array ? [] : {};
                targetObj[keys] = deepClone(source[keys], key);
            } else {
                if (keys === 'name' && key) {
                    targetObj.label = source.name;
                } else {
                    targetObj[keys] = source[keys];
                }

            }
        }
    }
    return targetObj;
}
//解析路由取参
export function urlParse() {
    const url = window.location.search;
    const obj = {};
    const reg = /[?&][^?&]+=[^?&]+/g;
    const arr = url.match(reg);
    if (arr) {
        arr.forEach((item) => {
            const tempArr = item.substr(1).split('=');
            const key = decodeURIComponent(tempArr[0]);
            const val = decodeURIComponent(tempArr[1]);
            obj[key] = val;
        });
    }
    return obj;
}
//处理后端数据的null值,生成'--'
export function handleNull(value) {
    const result = {
        0: 0,
        null: '--',
        undefined: '--',
        true: true,
        false: false
    };
    return value || result[value];
}
/**
 * 防抖函数
 * 只需要在事件触发的第一行调用,如:
 * shakePrevent()
 * @param delay,延迟毫秒,可不传,默认3000
 */
export function shakePrevent(event, delay) {
    const e = event;
    const _delay = delay ? delay : 3000;

    function getTarget(target) {
        //已到顶层,非button和input类型的按钮
        if (['BODY', 'HTML', '#document'].indexOf(target.nodeName) >= 0) {
            // '非button和input类型的按钮,无法设置防抖'
            return e.target;
        }
        const flag = target.nodeName === 'BUTTON' || target.nodeName === 'INPUT';
        return flag ? target : getTarget(target.parentNode);
    }
    const _target = getTarget(e.target);
    _target.disabled = true;
    setTimeout(() => {
        _target.disabled = false;
    }, _delay);
}
//获取URL参数,返回一个对象
export function getParam() {
    const search = window.location.search;
    const hash = window.location.hash;
    const searchParam = search.indexOf('?') >= 0 && search;
    const hashParam = hash.indexOf('?') >= 0 && hash;
    const paramObj = {};

    function montage(obj, params) {
        const startIndex = params.indexOf('?') + 1;
        const query = params.substr(startIndex, params.length);
        const list = query.split('&' || '&&');
        for (let i = 0; i < list.length; i++) {
            const pair = list[i].split('=');
            obj[pair[0]] = pair[1];
        }
    }
    if (searchParam.length > 0) {
        montage(paramObj, searchParam);
    }
    if (hashParam.length > 0) {
        montage(paramObj, hashParam);
    }
    return paramObj;
}
/**
 * 获取指定的URL参数值
 * URL:http://www.quwan.com/index?name=tyler
 * 参数：paramName URL参数
 * 调用方法:getUrlParam("name")
 * 返回值:tyler
 */
export function getUrlParam(paramName) {
    const str = window.location.href;
    const xh = str.indexOf('?');
    const query = str.substr(xh + 1, str.length);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (pair[0] === paramName) {
            return pair[1];
        }
    }
    return false;
}
/**
 * 获取url的search参数值,适用于brower路由
 * 调用方法:getUrlSearchParam()
 * 返回值:object
 */
export function getUrlSearchParam() {
    const str = window.location.search;
    const xh = str.indexOf('?');
    const query = str.substr(xh + 1, str.length);
    const params = query.split('&');
    const obj = {};
    for (let i = 0; i < params.length; i++) {
        const pair = params[i].split('=');
        obj[pair[0]] = pair[1];
    }
    return obj;
}
/**
 * 获取url的href参数值,适用于hash路由
 * 调用方法:getUrlSearchParam()
 * 返回值:object
 */
export function getUrlHrefParam() {
    const str = window.location.href;
    const xh = str.indexOf('?');
    const query = str.substr(xh + 1, str.length);
    const params = query.split('&');
    const obj = {};
    for (let i = 0; i < params.length; i++) {
        const pair = params[i].split('=');
        obj[pair[0]] = pair[1];
    }
    return obj;
}
/**
 * react阻止当前事件冒泡
 * @param e,当前事件触发的事件对象,调用:stopeEventPropagation(e)
 */
export function stopeEventPropagation(e) {
    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();
}
/**文本框chang事件防抖类
 * @param fn,写自己的处理逻辑
 * @param delay,延迟多少毫秒拿到结果,默认2000
 * @param value,文本框输入的值
 * debounce.init(fn, delay)(value);
 * 如:debounce.init(() => {console.log('在这里写请求')}, 1000)('文本框输入的值');
 **/
export const debounce = {
    timerId: null,
    init(fn, delay) {
        return (...parms) => {
            let args = parms;
            if (this.timerId) {
                clearTimeout(this.timerId);
            }
            this.timerId = setTimeout(() => {
                fn.apply(this, args);
            }, delay || 2000); //默认2秒
        };
    }
};
/**
 *根据key,value,从树里面找到一个节点,return当前节点
 *@param treeList,标准的树型结构,必须要有children字段
 *@param key,查询的关键属性
 *@param value,key的值
 *如:queryFindTreeNode(treeList,'key',1),查找treeList中id为3的节点
 **/
export function queryFindTreeNode(treeList, key, value) {
    let result = null;
    if (!treeList) {
        return;
    }
    for (let i = 0; i < treeList.length; i++) {
        if (result !== null) {
            break;
        }
        let item = treeList[i];
        if (item[key] === value) {
            result = item;
            break;
        } else if (item.children && item.children.length > 0) {
            result = queryFindTreeNode(item.children, key, value);
        }
    }
    return result;
}
//下载文件
export function downloadFile(url, filename) {
    if (!url) {
        throw '缺少必要参数url';
    }
    if (navigator.userAgent.indexOf('Trident') > -1) {
        //ie
        window.open(url, '_blank');
    } else {
        //非ie
        const a = document.createElement('a'); // 创建a标签
        const e = document.createEvent('MouseEvents'); // 创建鼠标事件对象
        e.initEvent('click', false, false); // 初始化事件对象
        a.href = url; // 设置下载地址
        a.download = filename || '邀请加入部门名称二维码'; // 设置下载文件名
        a.dispatchEvent(e);
    }
}
/**
 * 日期格式化
 * @param dete,时间chuo,默认今天
 * @param fmt,'-'或'/',默认'-'
 */
export function dateformat(date, fmt) {
    function setLen(str) {
        return str.toString().length < 2 ? 0 + str.toString() : str.toString();
    }
    const str = date || new Date();
    const YYYY = setLen(str.getFullYear());
    const MMMM = setLen(str.getMonth() + 1);
    const DDDD = setLen(str.getDate());
    const hhhh = setLen(str.getHours());
    const mmmm = setLen(str.getMinutes());
    const ssss = setLen(str.getSeconds());
    const yesterday = new Date().getTime() - (24 * 60 * 60 * 1000);
    const _reg = fmt ? fmt : '-';
    return {
        'Y': YYYY,
        'M': MMMM,
        'D': DDDD,
        'YMD': YYYY + _reg + MMMM + _reg + DDDD,
        'HMS': hhhh + ":" + mmmm + ":" + ssss,
        'FULL': YYYY + _reg + MMMM + _reg + DDDD + " " + hhhh + ":" + mmmm + ":" + ssss,
        'NOFMT': YYYY + MMMM + DDDD,
        'YESTERDAY': setLen(new Date(yesterday).getFullYear()) + _reg +
            setLen(new Date(yesterday).getMonth() + 1) + _reg +
            setLen(new Date(yesterday).getDate())
    };
}
// base64 转file,并生成表单数据
export function dataURLtoFile(dataurl, fileName) {
    fileName = fileName || 'avatarfile';
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let fileType = mime.substr(mime.indexOf('/') + 1, mime.length - 1);
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], fileName + '.' + fileType, {
        type: mime
    });
    const formData = new FormData();
    formData.append('file', file);
    return formData;
}
/**
 * 将图片url转换成base64
 */
export function getBase64Image(imgUrl, callback) {
    function tobase64(img) {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
        let dataURL = canvas.toDataURL("image/" + ext);
        return dataURL;
    }
    let image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = imgUrl;
    image.onload = () => {
        let base64 = tobase64(image);
        callback(base64);
    };
}
/**
 * 创建openLayers支持的多边形数据格式: [ [ [],[],[] ] ]
 * @param arr[] [lat, lng, lat, lng,...]
 */
export function createPolygonEchoData(arr) {
    const targetArr = [];
    for (let i = 0; i < arr.length; i++) {
        const tipArr = [];
        if (2 * i < arr.length) {
            tipArr.push(arr[2 * i], arr[2 * i + 1]);
            targetArr.push(tipArr);
        }
    }
    return [targetArr];
}
/**
 * 获取多边形中心点
 * @param arr[] [lat, lng, lat, lng,...]
 * @return [lat, lon]
 */
export function getPolygonCenterFn(arr = []) {
    // 空 长度0 不是数组
    if (!Array.isArray(arr) || arr.length < 1) {
        return false;
    }
    let lat = []; // 纬度
    let lon = []; // 经度
    for (let i = 0; i < arr.length; i++) {
        if (i % 2) {
            lon.push(arr[i]);
        } else {
            lat.push(arr[i]);
        }
    }
    const averageLat = ((lat.reduce((a, b) => a + b)) / lat.length).toFixed(6);
    const averageLon = ((lon.reduce((a, b) => a + b)) / lon.length).toFixed(6);
    return [averageLat, averageLon];
}
//isNumber
export function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
