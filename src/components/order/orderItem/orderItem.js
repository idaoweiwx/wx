import React, { Component } from "react"
import {  Button, Toast } from 'antd-mobile'
import { Row, Col } from "./../../common/common"
import { Link } from "react-router-dom"
import c_img_default from "./commodity_default.png"
import { fetchObjToString } from "./../../fetch/index"
import Global from "./../../config/globla"
import "./index.less"
import Wxpay from "./../../wxpay/index"
class OrderItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "data": props.data,
            //订单状态 -1 - 待付款0 - 待处理 1-待送货 2-撤销 3-已完成  4-已配货 5-配送中 6-待审核  7-审核中  8-未通过
            "orderTypePObj": {
                "-1": "待付款",
                "0": "待发货",
                "1": "已发货",
                "3": "已完成",
                "4": "待发货",
                "5": "已发货",
                "2": "已取消",
                "8": "已取消"
            }
        }
    }
    componentWillReceiveProps(newprops) {
        this.setState({
            data: newprops.data
        })
    }
    //取消订单
    uptStatus = () => {
        let url = Global.PATHNAME + "comp/order.do?uptStatus";
        let params = {
            orderid: this.state.data.order_id,
            status: 2,//撤销
        }
        fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }),
            body: fetchObjToString(params)// 这里是请求对象
        }).then((res) => {
            return res.text()
        }).then((res) => {
            let json = JSON.parse(res);
            if (json.result === 1) {
                Toast.success(json.message);
                this.props.getorderlist();
            } else {
                Toast.fail(json.message)
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    //支付
    pay = (order_id) => {
        Wxpay(order_id, this.props.getorderlist())
    }
    //关闭
    close = () => {

    }
    render() {
        let status = this.state.data.status;
        let details = this.state.data.details ? this.state.data.details : [];
        const createBtn = () => {
            if (!this.props.isDetail) {
                return (
                    <Row className="btnGroup">
                        <Col span={24} align="right">
                            <Button onClick={this.uptStatus} inline size="small" style={{"margin":"0 5px"}} className={[-1, 0,4].indexOf(status) === -1 ? "hide" : ""}>取消订单</Button>
                            <Button inline size="small" style={{ "border": "1px solid #FF5000", "color": "#FF5000", "margin": "0 5px" }} onClick={this.pay.bind(this, this.state.data.order_id)} className={status !== -1 ? "hide" : ""}>付款</Button>
                            <Link to={"logInfo?order_id=" + this.state.data.order_id}><Button inline size="small" style={{ "margin": "0 5px" }}  className={[1,3,5].indexOf(status) === -1 ? "hide" : ""}>查看物流</Button></Link>
                        </Col>

                    </Row>
                )
            } else {

            }
        }
        return (<div className="orderItem">
            <Link to={"detail?order_id=" + this.state.data.order_id}>
                <Row className={this.props.isDetail ? "hide" : ""}>
                    <Col span={20} className="order_id">
                        订单编号：{this.state.data.order_id}
                    </Col>
                    <Col span={4} className="status">
                        {
                            this.state.orderTypePObj[this.state.data.status]
                        }
                    </Col>
                </Row>
                {
                    details.map((item, j) => {
                        return (<Row className="cartItem" key={j}>
                            <Col span={5}>
                                <img key={"img" + j} alt="图片" className="shopImg" src={item.c_pic ? item.c_pic : c_img_default} />
                            </Col>
                            <Col span={11}>
                                <span className="c_name" key={"name" + j}>{item.c_name}</span>
                            </Col>
                            <Col span={6} offset={2} align="right">
                                <p className="price">￥{Number(item.price).toFixed(2)}</p>
                                <p className="count">{"x" + item.count}</p>
                            </Col>
                        </Row>)
                    })
                }
                <Row className={this.props.isDetail ? "hide" : "otherPrice"}>
                    <Col span={9} align="right" offset={8}>
                        运费:￥<span style={{ fontSize: "16px" }}>{this.state.data.express_fee ? this.state.data.express_fee : 0}</span>
                    </Col>
                    <Col span={7} align="right">
                        合计:￥<span style={{ fontSize: "16px" }}>{(Number(this.state.data.order_sum) + Number(this.state.data.express_fee)).toFixed(2)}</span>
                    </Col>
                </Row>
            </Link>
            {
                createBtn()
            }
        </div>)
    }
}
OrderItem.defaultProps = {
    "data": [],
    "isDetail": false
}
export default OrderItem;