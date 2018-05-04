// 封装fetch

/**
 * 将对象转成 a=1&b=2的形式
 * @param obj 对象
 */
const fetchObjToString = (obj, arr = [], idx = 0) => {
    for (let item in obj) {
        arr[idx++] = [item, obj[item]]
    }
    arr.push(["os", "3"]);
    arr.push(["ver", "0.8"]);
    arr.push(["productid", "1"]);
    arr.push(["token", window.token]);
    arr.push(["rand", Math.random()]);
    // return new URLSearchParams(arr).toString()  不兼容狠狠地鄙视
    var paramStr = "";
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        paramStr += arr[i][0] + "=" + arr[i][1] + "&";
    }
    paramStr = paramStr.substring(0, paramStr.length - 1);
    return paramStr;
}

/**
 * 真正的请求
 * @param url 请求地址
 * @param options 请求参数
 * @param method 请求方式
 */
const commonFetcdh = (url, options, method = 'GET') => {
    const searchStr = fetchObjToString(options)
    let initObj = {}
    if (method === 'GET') { // 如果是GET请求，拼接url
        url += '?' + searchStr
        initObj = {
            method: method,
            credentials: 'include'
        }
    } else {
        initObj = {
            method: method,
            credentials: 'include',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }),
            body: searchStr
        }
    }
    fetch(url, initObj).then((res) => {
        return res.json()
    }).then((res) => {
        return res
    })
}

/**
 * GET请求
 * @param url 请求地址
 * @param options 请求参数
 */
const fetchGet = (url, options) => {
    return commonFetcdh(url, options, 'GET')
}

/**
 * POST请求
 * @param url 请求地址
 * @param options 请求参数
 */
const fetchPost = (url, options) => {
    return commonFetcdh(url, options, 'POST')
}


export { fetchPost, fetchGet, fetchObjToString }

export default fetchObjToString;