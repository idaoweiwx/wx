import React, { Component } from "react"
import { Content, Footer, Row, Col } from "./../common/common"
import { Icon, Modal, Toast } from 'antd-mobile'
import Global from "./../config/globla"
import { fetchObjToString } from "./../fetch/index"
import { ScrollWrapSwipeout } from "./../util/scroll/index"
import FillinOrder from "./fillinOrder";
import c_img_default from "./commodity_default.png"
import "./index.less"
import Wxpay from "./../wxpay/index"

const prompt = Modal.prompt;


class CartPage extends Component {
    componentDidMount() {
        document.title = "购物车";
    }
    render() {
        return (<div className="cartPage">
            <Content hasFooter={true}>
                <CartContent />
            </Content>
            <Footer active={1} />
        </div>)
    }
}

class CartContent extends Component {
    constructor() {
        super();
        this.state = {
            "data": [],
            "checked": "",
            "visible": false,
            "checkall": false,
            "sumPrice": 0,
            "step": 1,
            "selectData": [],
            "remark": "",
            "addressobj": {},
            "freight": ""
        }
    }
    componentDidMount() {
        this.getCartList();
    }
    showModal = ()=>{
        this.setState({
            visible:true
        })
    }
    getCartList = () => {
        let url = Global.PATHNAME + "comp/order/cart.do?list";
        let params = {
            "c_type": 2
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
                    data: json.data,
                    "checkall": false,
                    "sumPrice": 0,
                    "step": 1,
                    "selectData": []
                })
            } else {
                Toast.fail("获取购物车列表失败");
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    //选购物车商品
    selectShop = (i) => {
        let data = this.state.data;
        data[i].checked = !data[i].checked;
        let boolean = true;
        for (let i = 0; i < data.length; i++) {
            if (!data[i].checked) {
                boolean = false;
                break;
            }
        }
        this.setState({
            data: data,
            checkall: boolean
        })
        this.evalSumPrice(data);
    }
    //计算是否全选
    evalAllCheck = () => {
        let data = this.state.data;
        let boolean = true;
        for (var i = 0; i < data.length; i++) {
            if (!data[i].checked) {
                boolean = false;
                break;
            }
        }
        this.setState({
            checkall: boolean
        })
        this.evalSumPrice(data);
    }
    //手动改变数量
    editText = (e) => {
        let ev = e || window.event;
        this.setState({
            moduleText: isNaN(Number(ev.target.value)) ? this.state.moduleText : Number(ev.target.value)
        })
        this.evalSumPrice(this.state.data);
    }
    //全选全不选
    checkallClick = () => {
        let boolean = this.state.checkall ? false : true
        let data = this.state.data;
        for (var i = 0; i < data.length; i++) {
            data[i].checked = boolean;
        }
        this.evalSumPrice(data);
        this.setState({
            data: data,
            checkall: !this.state.checkall
        });
    }
    //计算总价
    evalSumPrice = (dataP) => {
        let sum = 0;
        let data = dataP;
        let selectData = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].checked && data[i].c_count !== "") {
                selectData.push(data[i]);
                let price = 0;
                let commodityPrices = data[i].commodity.commodityPrices ? data[i].commodity.commodityPrices : []
                if (commodityPrices !== null && commodityPrices.length > 0) {
                    price = commodityPrices[0].c_price;
                }
                sum += price * data[i].c_count;
            }
        }
        this.setState({
            sumPrice: sum.toFixed(2),
            selectData: selectData
        })
    }
    changeConut = (value,id) => {
        if (Number(value) < 0) {
            value = 1.0;
        }
        let ind = id;
        let data = this.state.data;
        data[ind].c_count = value;
        if (value === "") {
            data[ind].checked = false;
        }
        this.setState({
            data: data
        })
        this.evalSumPrice(data);
        setTimeout(() => {
            this.evalAllCheck();
        }, 300);
    }
    checkPrice = (callback) => {
        if (this.state.selectData.length !== 0) {
            let selectData = this.state.selectData;
            let commodity_ids = "";
            for (let i = 0; i < selectData.length; i++) {
                commodity_ids += selectData[i].commodity_id + ",";
            }
            let url = Global.PATHNAME + "comp/commodity.do?list";
            let params = {
                commodity_ids: commodity_ids,
                status: 1,
                in_type: 1,
                isPersonPrice: 1
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
                    let data = json.data.paginationData ? json.data.paginationData : [];
                    let obj = {};
                    let changeGoods = "";
                    for (let i = 0; i < data.length; i++) {
                        obj[data[i].commodity_id] = data[i];
                    }
                    for (let i = 0; i < selectData.length; i++) {
                        let oldprice = 0;
                        let newprice = 0;
                        let oldcommodityPrices = selectData[i].commodity.commodityPrices ? selectData[i].commodity.commodityPrices:[];
                        let newcommodityPrices = obj[selectData[i].commodity_id].commodityPrices ? obj[selectData[i].commodity_id].commodityPrices:[];
                        if (oldcommodityPrices.length>0){
                            oldprice = oldcommodityPrices[0].c_price;
                        }
                        if (newcommodityPrices.length > 0) {
                            newprice = newcommodityPrices[0].c_price;
                        }
                        if (oldprice !== newprice){
                            changeGoods += selectData[i].commodity.c_name+"、";
                        }
                        
                        selectData[i].commodity = obj[selectData[i].commodity_id];
                    }
                    if (changeGoods!==""){
                        Modal.info({
                            title: '有商品价格改变',
                            content: (
                                <div>
                                    <p>{changeGoods}</p>
                                </div>
                            ),
                            onOk() { },
                        });
                    }
                    this.setState({
                        selectData: selectData
                    })
                    this.evalSumPrice(selectData);
                    if (callback) {
                        callback();
                    }
                } else {
                    Toast.fail("价格确认失败");
                }
            }).catch((err) => {
                console.log(err);
                return false;
            })


        } else {
            Toast.fail("请选择商品");
        }
    }
    toStep2 = () => {
        console.log(this.state.selectData);
        if (this.state.selectData.length !== 0) {
            let callback = () => {
                this.setState({
                    step: 2
                })
            }
            this.checkPrice(callback);
        } else {
            Toast.fail("请选择商品");
        }

    }
    delCartItem = (commodity_id, c_itemid) => {
        let url = Global.PATHNAME + "comp/order/cart.do?delete";
        let params = {
            "cids": commodity_id,
            "pid": c_itemid,
            "c_type": 2
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
                Toast.success("删除成功");
                this.getCartList();
            } else {
                Toast.fail("删除失败");
            }
        }).catch((err) => {
            console.log(err);
        })

    }
    //修改备注
    changeRemark = (remark) => {
        this.setState({
            remark: remark
        })
    }
    //修改送货地址
    changeAddress = (obj) => {
        this.setState({
            addressobj: obj
        })
    }
    //修改运费
    changeFreight = (string) => {
        this.setState({
            freight: string
        })
    }
    //提单
    oCrtOrUpt = () => {
        let url = Global.PATHNAME + "comp/order.do?oCrtOrUpt";
        let sendaddr = this.state.addressobj.province.name + this.state.addressobj.city.name + this.state.addressobj.country.name + this.state.addressobj.address;
        let params = {
            sendaddr: sendaddr,
            contacts: this.state.addressobj.receiving_name,
            phone: this.state.addressobj.phone,
            remark: this.state.remark,
            gettype: 2,
            details: createdetails(this.state.selectData),
            osum: this.state.sumPrice,
            otype: 5,
            senddate: "2018-02-20 13:59:00",
            status: (Number(this.state.sumPrice) + Number(this.state.freight)) !== 0?-1:0,
            express_fee: this.state.freight
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
                Toast.success("提单成功");
                
                // let url = window.location.origin + window.location.pathname + "#/order/list"
                // window.location.href = url;
                const callback = ()=>{
                    let url = window.location.origin + window.location.pathname + "?#/order/detail?order_id=" + json.data;
                    window.location.href = url;
                }
                if ((Number(this.state.sumPrice) + Number(this.state.freight))!==0){
                    Wxpay(json.data, callback);
                }else{
                    callback();
                }
                
                
            } else {
                Toast.fail("提单失败");
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    render() {
        window.document.title = "购物车";
        const createCartList = () => {
            if (this.state.data.length === 0) {
                return (<div style={{ "textAlign": "center", "paddingTop": "100px", "fontSize": "0.32rem" }}>购物车暂无商品</div>)
            } else {
                return (<div>
                    {
                        this.state.data.map((e, i) => {
                            let price = 0;
                            let commodityPrices = e.commodity.commodityPrices ? e.commodity.commodityPrices : []
                            if (commodityPrices !== null && commodityPrices.length > 0) {
                                price = commodityPrices[0].c_price;
                            }
                            price = Number(price).toFixed(2);
                            return (
                                <ScrollWrapSwipeout key={i} arguments={[e.commodity_id, e.c_itemid]} del={this.delCartItem}>
                                    <Row className="cartItem"> 
                                        <Col span={3} style={{ "lineHeight": "40px" }} align="left">
                                            <Icon style={{ "marginLeft": "0.1rem" }} className={e.checked ? "check checkMt active" : "check checkMt"} key={"icon" + i} type={e.checked ? "check-circle" : "check-circle-o"} onClick={this.selectShop.bind(this, i)} />
                                        </Col>
                                        <Col span={5}>
                                            <img alt="" key={"img" + i} className="shopImg" src={e.commodity.c_pic ? e.commodity.c_pic : c_img_default} />

                                        </Col>
                                        <Col span={8} offset={1}>
                                            <Col span={24} style={{"display":"table"}}>
                                                <p className="c_name" key={"name" + i}>{e.commodity.c_name}</p>
                                            </Col>
                                            
                                        </Col>
                                        <Col span={4}>
                                            <div className="price">￥{Number(price).toFixed(2)}</div>
                                            <div className="c_count">{e.c_count}</div>
                                        </Col>
                                        <Col span={3} align="right" style={{ "display": "table" }}>
                                            <div className="icon_edit"><i onClick={
                                                () => prompt('修改商品数量', '', [
                                                    { text: '关闭' },
                                                    { text: '确定', onPress: value => this.changeConut(value,i)},
                                                ], 'default', e.c_count)
                                            } className="iconfont icon-xiugai_l"></i></div>
                                            
                                        </Col>
                                    </Row>
                                </ScrollWrapSwipeout >
                            )
                        })
                    }
                </div>)
            }
        }
        if (this.state.step === 1) {//购物车列表
            return (<div>
                <div className="cartCont">
                    {
                        createCartList()
                    }
                </div>
                <Row className="statics" style={{ "paddingLeft": "0.24rem" }}>
                    <Col span={6} style={{ "lineHeight": "40px" }} align="left" onClick={this.checkallClick} >
                        <Icon style={{ "top": "0.05rem", "marginLeft": "0.1rem" }} className={this.state.checkall ? "check active" : "check"} type={this.state.checkall ? "check-circle" : "check-circle-o"} />
                        <span className="checkAlldes">{this.state.checkall ? "取消" : "全选"}</span>
                    </Col>

                    <Col span={10} style={{ "lineHeight": "40px" }} align="right">
                        <p className="eval">合计：<span className="sumPrice">￥{this.state.sumPrice}</span></p>
                    </Col>
                    <Col span={7} offset={1} className="clearing" align="center" onClick={this.toStep2}>
                        结算
                    </Col>
                </Row>
            </div>)
        } else if (this.state.step === 2) {
            return (
                <div>
                    <div className="cartCont">
                        <FillinOrder
                            data={this.state.selectData}
                            sumPrice={this.state.sumPrice}
                            changeRemark={this.changeRemark}
                            changeAddress={this.changeAddress}
                            changeFreight={this.changeFreight}
                        />
                    </div>
                    <Row className="statics">
                        <Col span={15} offset={1} style={{ "lineHeight": "40px" }} align="left">
                            应付总额：<span className="price" style={{ "fontSize": "20px", "color": "#ff5000", "position": "relative", "top": "2px" }}>￥{(Number(this.state.sumPrice) + Number(this.state.freight)).toFixed(2)}</span>
                        </Col>
                        <Col span={7} offset={1} className="clearing" align="center" onClick={this.oCrtOrUpt}>
                            提交订单
                        </Col>
                    </Row>
                </div>
            )
        }


    }
}

const createdetails = (data) => {
    let detailsObj = [];
    console.log(data);
    if (data !== null && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            let dataInt = data[i];
            let detailObj = {
                "commodity_id": 8014, "count": 2, "price": 31, "unit_id": 12054, "subTotal": 62, "price_id": 3921
            };
            let commodityPrices = dataInt.commodity.commodityPrices ? dataInt.commodity.commodityPrices : [];
            detailObj.commodity_id = dataInt.commodity_id;
            detailObj.count = dataInt.c_count;
            detailObj.price_id = dataInt.c_itemid;
            detailObj.unit_id = dataInt.commodity.mainunit.unit_id;
            detailObj.price = 0;
            for (let j = 0; j < commodityPrices.length; j++) {
                if (detailObj.price_id === commodityPrices[j].c_itemid) {
                    detailObj.price = commodityPrices[j].c_price;
                    break;
                }
            }
            detailObj.subTotal = detailObj.count * detailObj.price;

            detailsObj.push(detailObj);
        }
    }
    return JSON.stringify(detailsObj);
}

export default CartPage