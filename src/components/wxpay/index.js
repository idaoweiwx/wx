import { fetchObjToString } from "./../fetch/index"
import Global from "./../config/globla"
import { Toast } from 'antd-mobile'
let wx = window.wx;
let param_str_obj = {};
//注入微信config
const Wxpay = (id,callback) => {

    let orderid = id;
    let url = Global.PATHNAME + "comp/weichart.do?unifiedOrder";
    let params = {
        order_id: orderid,
        open_id: window.open_id
    }
    fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }),
        body: fetchObjToString(params)// 这里是请求对象
    }).then((res) => {
        return res.text()
    }).then((res) => {
        let json = JSON.parse(res);
        if (json.result === 1) {
            let data = json.data;
            param_str_obj = {
                timestamp: "1414723233",
                nonceStr: data.nonce_str,
                package: 'prepay_id=' + data.prepay_id,
                signType: 'MD5', // 注意：新版支付接口使用 MD5 加密
            }
            console.log(JSON.stringify({
                debug: false,
                appId: data.appid,
                timestamp: 1522046742,
                nonceStr: data.nonce_str,
                signature: data.sign,
                jsApiList: [
                    'chooseWXPay'
                ]
            }));
            wx.config({
                debug: false,
                appId: data.appid,
                timestamp: 1522046742,
                nonceStr: data.nonce_str,
                signature: data.sign,
                jsApiList: [
                    'chooseWXPay'
                ]
            });
            wx.ready(function () {
                Toast.success("成功");
                console.log(JSON.stringify(param_str_obj));
                // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
            });
            wx.error(function (res) {
                Toast.fail(res);
                // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            });
        } else {
            Toast.fail("下单失败");
        }
    }).then(() => {
        Pay(callback);
    }).catch((err) => {
        console.log(err);
    })
    // wx.config({"debug":false,"appId":"wx4c16c5c5a3c3f117","timestamp":1522046742,"nonceStr":"SJ8V4sR7ngtpYL5o","signature":"55B9BC5A5BCF06460E4FE4DF7332F2A5","jsApiList":["chooseWXPay"]});
    // wx.ready(function () {
    //     message.success("成功");
    //     Pay();
    //     // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    // });
    // wx.error(function (res) {
    //     message.error(res);
    //     // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    // });
}


const Pay = (callback) => {
    param_str_obj["timeStamp"] = param_str_obj["timestamp"];
    delete param_str_obj["timestamp"];
    let url = Global.PATHNAME + "comp/weichart.do?getSign";
    let params = {
        param_str: JSON.stringify(param_str_obj)
    }
    fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        }),
        body: fetchObjToString(params)// 这里是请求对象
    }).then((res) => {
        return res.text()
    }).then((res) => {
        let json = JSON.parse(res);
        if (json.result === 1) {
            //拷贝  使用JSON.parse(JSON.stringify))
            let option = JSON.parse(JSON.stringify(param_str_obj));
            option.paySign = json.data;
            option.timestamp = Number(option.timeStamp);
            delete option["timeStamp"];
            option.success = () => {
                Toast.success("支付成功");
                try{
                    setTimeout(() => {
                        callback();
                    }, 1500);
                }catch(err){

                }
            }
            option.cancel = () => {
                Toast.success("取消支付");
                try {
                    setTimeout(() => {
                        callback();
                    }, 1500);
                } catch (err) {

                }
            }
            wx.chooseWXPay(option);
        } else {
            Toast.fail("获取签名失败");
        }
    }).catch((err) => {
        console.log(err);
    })
    // wx.chooseWXPay({ 
    //     nonceStr: "SJ8V4sR7ngtpYL5o", package: "prepay_id=wx201803281825004780a0df8a0596592800", signType: "MD5", paySign: "EB519D20EC26A8800A74BF31FC95E255", timestamp: 1414723233,
    //         success: function (res) {
    //             message.success("支付成功");
    //         },
    //         cancel: function (res) {
    //             message.success("取消支付");
    //         }  

    //     });
}
export default Wxpay;




