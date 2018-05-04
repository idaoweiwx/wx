import React, { Component } from "react"
import "./index.less"
import { Row, Col } from "./../../common/common"
import { Steps, Icon, Toast, Button} from 'antd-mobile'
import OrderItem from "./../orderItem/orderItem"
import { Link } from "react-router-dom"
import { fetchObjToString } from "./../../fetch/index"
import Global from "./../../config/globla"
import "./../../common/common.less"
import Wxpay from "./../../wxpay/index"
import getHashParameters from "./../../util/getParams"
let orderid = getHashParameters("order_id");


const Step = Steps.Step;
class OrderDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "current": -1,
            "step1Date": "",
            "step2Date": "",
            "step3Date": "",
            "data": {},
            "isgetInfo": false
        }
    }
    componentDidMount() {
        document.title = "订单详情";
        this.getOrderInfo();
    }
    getOrderInfo = () => {
        Toast.loading("正在获取商品数据", 1000);
        let orderid = getHashParameters("order_id");
        let url = Global.PATHNAME + "comp/order.do?info";
        let params = {
            orderid: orderid
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
                this.setState({
                    data: json.data.order ? json.data.order : {},
                    "isgetInfo": true
                })
                this.handleStatus(json.data.order)

            } else {
                Toast.fail(json.message);
            }
            Toast.hide();
        }).catch((err) => {
            console.log(err);
        })
    }
    handleStatus = (data) => {
        console.log(data);
        let status = data.status;
        switch (status) {
            case -1://待付款
                this.setState({
                    "current": -1,
                    "step1Date": "",
                    "step2Date": "",
                    "step3Date": "",
                })
                break;
            case 0://待处理
            case 4://已配货
                this.setState({
                    "current": 0,
                    "step1Date": data.pay_time ? data.pay_time.substring(0, 16) : "",
                    "step2Date": "",
                    "step3Date": "",
                }) 
                break;
            case 5://配送中
            case 1://待送货
                this.setState({
                    "current": 1,
                    "step1Date": data.pay_time ? data.pay_time.substring(0, 16) : "",
                    "step2Date": data.send_date ? data.send_date.substring(0, 16) : "",
                    "step3Date": "",
                })
                break;
            case 3://已完成
                let sends = data.sends ? data.sends : [];
                let signer_date = data.signer_date ? data.signer_date : (sends[sends.length - 1].send_endtime);
                this.setState({
                    "current": 2,
                    "step1Date": data.pay_time ? data.pay_time.substring(0, 16) : "",
                    "step2Date": data.send_date ? data.send_date.substring(0, 16) : "",
                    "step3Date": signer_date,
                })
                break;
            default:
                this.setState({
                    "current": -2,
                    "step1Date": "",
                    "step2Date": "",
                    "step3Date": "",
                })
                break;
        }
    }
    //更改订单状态
    uptStatus = (status) => {
        let url = Global.PATHNAME + "comp/order.do?uptStatus";
        let params = {
            orderid: this.state.data.order_id,
            status: status,//撤销
        }
        if (status === 3) {
            params.is_sign = 1
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
                if (status === 2) {
                    let url = window.location.origin + window.location.pathname + "?#/order/list"
                    window.location.href = url;
                } else {
                    this.getOrderInfo();
                }

            } else {
                Toast.fail(json.message)
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    pay = () => {
        Wxpay(orderid, this.getOrderInfo);
    }
    render() {

        const createBottom = () => {
            if (this.state.current === -1) {
                return (
                    <Row className="statics" style={{ "paddingLeft": "0.24rem" }}>
                        <Col span={9} style={{ "lineHeight": "40px" }} align="right">
                            <p className="eval">应付金额：<span className="sumPrice">￥{(Number(data.express_fee) + Number(data.order_sum)).toFixed(2)}</span></p>
                        </Col>
                        <Col span={15} align="right" className="nine">
                            <Button style={{"margin":"0 5px"}} inline size="small" onClick={this.uptStatus.bind(this, 2)}>取消订单</Button>
                            <Button inline size="small" style={{ "border": "1px solid #FF5000", "color": "#FF5000", "margin": "0 5px" }} onClick={this.pay}>支付</Button>
                        </Col>
                    </Row>
                )
            } else if (this.state.current === 0) {
                return (
                    <Row className="statics" style={{ "paddingLeft": "0.24rem" }}>
                        <Col span={24} align="right" className="nine">
                            <Link to={"refund"}><Button style={{ "margin": "0 5px" }} inline size="small">申请退款</Button></Link>
                        </Col>
                    </Row>
                )
            } else if (this.state.current === 1) {
                return (
                    <Row className="statics" style={{ "paddingLeft": "0.24rem" }}>
                        <Col span={24} align="right" className="nine">
                            <Link to={"logInfo?order_id=" + this.state.data.order_id}><Button style={{ "margin": "0 5px" }}  inline size="small">查看物流</Button></Link>
                            <Button style={{ "margin": "0 5px" }}  onClick={this.uptStatus.bind(this, 3)} inline size="small">确认收货</Button>
                            <Link to={"refund"}><Button inline size="small" style={{ "margin": "0 5px" }} >申请退款</Button></Link>
                        </Col>
                    </Row>
                )
            } else if (this.state.current === 2) {
                return (
                    <Row className="statics" style={{ "paddingLeft": "0.24rem" }}>
                        <Col span={24} align="right" className="nine">
                            <Link to={"logInfo?order_id=" + this.state.data.order_id}><Button style={{ "margin": "0 5px" }}  inline size="small">查看物流</Button></Link>
                            <Link to={"refund"}><Button style={{ "margin": "0 5px" }}  inline size="small">申请退款</Button></Link>

                        </Col>
                    </Row>
                )
            }

        }
        const createOtherInfo = () => {
            if (this.state.current === -1) { //买家付款
                return (<div>
                    <div className="other_info_wrap">
                        <p>
                            订单编号：{this.state.data.order_id}
                        </p>
                        <p>
                            提单时间：{this.state.data.order_date}
                        </p>
                    </div>
                </div>)
            } else {
                let pay_type = {
                    "0":"未知",
                    "1":"微信",
                    "2":"支付宝"
                }
                return (<div>
                    <div className="other_info_wrap">
                        <div className="">
                            实付金额：￥{Number(data.income_sum).toFixed(2)}
                        </div>
                        <div>
                            支付方式：{pay_type[this.state.data.pay_type]}
                        </div>
                        <p>
                            订单编号：{this.state.data.order_id}
                        </p>
                        <p>
                            提单时间：{this.state.data.order_date}
                        </p>
                        <p>
                            付款时间：{this.state.data.pay_time}
                        </p>
                    </div>
                </div>)
            }
        }
        let data = this.state.data;
        if (!this.state.isgetInfo) {
            return (<div className="pageLoading">
                
            </div>)
        } else {
            return (<div className="order_detail_page">
                <div className="order_detail_con">
                    <div className={this.state.current === -1 ? "" : "hide"} style={{ "background": "#fff", "color": "red", "lineHeight": "0.6rem", "paddingLeft": "0.4rem" }}>等待买家付款</div>
                    <div className="step_wrap">
                        <Steps current={this.state.current} direction="horizontal" size="small">
                            <Step key={0} title="买家付款" description={this.state.step1Date} />
                            <Step key={1} title="卖家发货" description={this.state.step2Date} />
                            <Step key={2} title="交易成功" description={this.state.step3Date} />
                        </Steps>
                    </div>
                    <Row className="addressWrap">
                        <Col span={2} align="center">
                            <Icon className="environment" type="environment-o" />
                        </Col>
                        <Col className="perinfo" span={22}>{data.contacts}<span style={{ "marginLeft": "0.5rem" }}>{data.phone}</span></Col>
                        <Col className="address" span={22} offset={2}>地址：{data.send_address}</Col>
                    </Row>
                    <OrderItem data={this.state.data} isDetail={true} />
                    <div className="price_wrap">
                        <Row>

                            <Col span={12} align="left">
                                商品总额：
                        </Col>
                            <Col span={12} align="right">
                                ￥{Number(data.order_sum).toFixed(2)}
                            </Col>
                            <Col span={12} align="left">
                                运费：
                        </Col>
                            <Col span={12} align="right">
                                ￥{Number(data.express_fee).toFixed(2)}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24} align="right">
                                总价￥{(Number(data.express_fee) + Number(data.order_sum)).toFixed(2)}
                            </Col>
                        </Row>
                        <div style={{ padding: "0.2rem 0" }}>
                            买家留言：<span className="des">{this.state.data.remark}</span>
                        </div>
                    </div>
                    {
                        createOtherInfo()
                    }
                </div>
                {
                    createBottom()
                }
            </div>)
        }

    }
}

export default OrderDetail