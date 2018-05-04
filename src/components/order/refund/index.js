import React, { Component } from "react";
import { Button } from "antd-mobile";
import "./index.less"
class Refund extends Component {
    render() {
        return (<div className="refund_page">
            <p>该商品暂不支持在线退款申请</p>
            <p>请联系客服</p>
            <Button type="primary" onClick={() => { window.history.back(); }}>返回</Button>
        </div>)
    }
}

export default Refund;