import React, { Component } from "react";
import { InputItem, Toast, Button, Modal, Picker} from 'antd-mobile'
import "./fillinOrder.less";
import { Row, Col } from "./../common/common"
import Global from "./../config/globla"
import { fetchObjToString } from "./../fetch/index"
import c_img_default from "./commodity_default.png"
const alert = Modal.alert;
class FillinOrderControl extends Component {
    state = {
        "freight": 0,
        "isgetfreight": false,
        "address": {}
    }
    componentDidMount() {

    }
    //改变收货地址
    changeaddress_id = (obj) => {
        this.setState({
            "address": obj
        })
        this.getfreight(obj);
        this.props.changeAddress(obj);
    }
    //获取运费
    getfreight = (obj) => {

        let data = this.props.data;
        let goods = "";
        if (data !== null && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                goods += "cid:" + data[i].commodity_id + ",num:" + data[i].c_count + ",cost:" + this.props.sumPrice + ";";
            }
        }
        goods = goods.substring(0, goods.length - 1);
        let url = Global.PATHNAME + "comp/order/freight.do?price";
        let params = {
            address_id: obj.address_id,
            goods: goods,
        }
        this.setState({
            "freight": "",
            "isgetfreight": true
        })
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
                    "freight": json.data,
                    "isgetfreight": false
                })
            } else {
                Toast.fail("获取运费失败！");
            }

            //改运费
            this.props.changeFreight(json.data);
        }).catch((err) => {
            console.log(err);
        })
    }
    //改变留言
    changeremark = (value) => {
        this.props.changeRemark(value)
    }
    render() {
        window.document.title = "填写订单信息";
        return (<div className="fillinorder">
            <Address
                getfreight={this.getfreight}
                changeaddress_id={this.changeaddress_id}
            />

            <div className="shopWrap">
                {
                    this.props.data.map((e, i) => {
                        let price = 0;
                        let commodityPrices = e.commodity.commodityPrices ? e.commodity.commodityPrices : []
                        if (commodityPrices !== null && commodityPrices.length > 0) {
                            for (let j = 0; j < commodityPrices.length; j++) {
                                if (commodityPrices[j].c_itemid === e.c_itemid) {//默认价
                                    price = commodityPrices[j].c_price;
                                }
                            }
                        }
                        return (
                            <Row className="cartItem" key={i}>
                                <Col span={5}>
                                    <img alt="商品图片" key={"img" + i} className="shopImg" src={e.commodity.c_pic ? e.commodity.c_pic : c_img_default} />
                                </Col>
                                <Col span={18} offset={1}>
                                    <Col span={24}>
                                        <p className="c_name" key={"name" + i}>{e.commodity.c_name}</p>
                                    </Col>
                                    <Col span={24} style={{ "marginTop": "0.1rem" }}>
                                        <span className="price">￥{Number(price).toFixed(2)}</span>
                                        <span className="count">x{e.c_count}</span>
                                    </Col>
                                </Col>
                            </Row>
                        )
                    })
                }
                <Row className="item">
                    <Col span={6} className="label">
                        运费：
                    </Col>
                    <Col span={18} align="right">
                        ￥{this.state.freight}
                    </Col>
                </Row>
                <Row className="item">
                    <Col span={6} className="label">
                        买家留言：
                    </Col>
                    <Col span={18} align="right">
                        <InputItem onChange={this.changeremark} placeholder="点击给买家留言" style={{ "border": "0" }} />
                    </Col>
                </Row>
                <Row className="item" style={{ "border": "0" }}>
                    <Col span={24} align="right">
                        合计：<span className="price" style={{ "fontSize": "20px", "color": "#ff5000", "position": "relative", "top": "1px" }}>￥{(Number(this.props.sumPrice) + Number(this.state.freight)).toFixed(2)}</span>
                    </Col>
                </Row>
            </div>

        </div>)
    }
}
class Address extends Component {
    state = {
        addressList: [],
        index: 0,
        type: 1, //1-显示第一个  2-显示收货地址 3-新增地址
        receiving_name: "",
        phone: "",
        address: "",
        address_id: "",
        provincearr: [],   //  ["省","市","区"]
        provincedata: [],
        updateAddress: false,
    }
    componentDidMount() {
        this.getaddress();
        this.getprovince();
    }
    toAddList = ()=>{
        this.setState({
            type:2
        })
    }
    //获取地址列表
    getaddress = () => {
        let url = Global.PATHNAME + "comp/order/send/address.do?find";
        let params = {
            pageSize: 99999,
            pageNo: 1,
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
                let paginationData = json.data.paginationData;
                if (paginationData !== null && paginationData.length > 0) {
                    this.setState({
                        addressList: paginationData
                    })
                    this.props.changeaddress_id(paginationData[0]);
                } else {
                    this.setState({
                        addressList: []
                    })
                }

            } else {
                Toast.fail("获取地址列表失败");
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    //删除地址
    deladdress = (address_id) => {
        alert('Delete', '是否删除地址？', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确认', onPress: () => {
                let url = Global.PATHNAME + "comp/order/send/address.do?delete";
                let params = {
                    address_id: address_id
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
                        Toast.success("删除收货地址成功");
                        this.getaddress();
                    } else {
                        Toast.fail("删除收货地址失败");
                    }
                }).catch((err) => {
                    console.log(err);
                })
            }},
        ]);
    }
    //编辑地址
    editaddress = (receiving_name, phone, address, address_id, provincearr) => {
        // e.nativeEvent.stopImmediatePropagation()
        this.setState({
            type: 3,
            receiving_name: receiving_name,
            phone: phone,
            address: address,
            address_id: address_id,
            provincearr: JSON.parse(provincearr),   //  ["省","市","区"]
            updateAddress: true,
        })

    }
    //添加地址
    saveaddress = (address_id) => {
        if (this.state.receiving_name === "") {
            Toast.fail("收货姓名必填");
            return;
        }
        if (this.state.phone === "") {
            Toast.fail("联系人电话必填");
            return;
        }
        if (this.state.provincearr.length === 0) {
            Toast.fail("所在地区必填");
            return;
        }
        if (this.state.address === "") {
            Toast.fail("详细地址必填");
            return;
        }
        let url = Global.PATHNAME + "comp/order/send/address.do?" + (this.state.updateAddress ? "update" : "add");
        let params = {
            receiving_name: this.state.receiving_name,
            phone: this.state.phone,
            province_id: this.state.provincearr[0],
            city_id: this.state.provincearr[1],
            country_id: this.state.provincearr[2],
            address: this.state.address
        }
        if (this.state.updateAddress) {
            params.address_id = this.state.address_id
        }
        fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }),
            body: fetchObjToString(params)// 这里是请求对象
        }).then((res) => {
            return res.text()
        }).then((res) => {
            let json = JSON.parse(res);
            if (json.result === 1) {
                this.setState({
                    receiving_name: "",
                    phone: "",
                    address: "",
                    address_id: "",
                    provincearr: [],   //  ["省","市","区"]
                    updateAddress: false,
                    type: 2
                })
                this.getaddress();
            } else {
                Toast.fail("添加地址失败！");
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    //选中地址
    selectAddress = (i) => {
        this.setState({
            index: i,
            type: 1
        })
        this.props.changeaddress_id(this.state.addressList[i]);
    }
    changeType = (type) => {
        this.setState({
            type: type
        })
        if (type === 3) { //选择地区的时候如果没有取过那么取一遍

            this.setState({
                receiving_name: "",
                phone: "",
                address: "",
                provincearr: [],   //  ["省","市","区"]
            })
        }
    }
    //获取省市区列表
    getprovince = () => {
        let url = Global.PATHNAME + "sys/province.do?all";
        let params = {
            iswebsite: 1
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
                    provincedata: json.data
                })
            } else {
                Toast.fail(json.message);
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    //城市选择
    changeprovince = (value, selectedOptions) => {
        console.log(value, selectedOptions);
        this.setState({
            provincearr: value
        })
    }
    //输入姓名
    changereceiving_name = (value) => {
        this.setState({
            receiving_name: value
        })
    }
    //输入手机号
    changephone = (value) => {
        this.setState({
            phone: value
        })
    }
    //输入地址
    changeaddress = (value) => {
        this.setState({
            address: value
        })
    }
    //
    render() {
        if (this.state.type === 1) {  //填写订单 显示第一个地址
            window.document.title = "填写订单信息";
            if (this.state.addressList.length > 0) {
                let addressObj = this.state.addressList[this.state.index] ? this.state.addressList[this.state.index] : {};
                return (
                    <Row className="addressWrap" onClick={this.changeType.bind(this, 2)}>
                        <Col span={2} align="center">
                            <i className="iconfont icon-zuobiao"></i>
                        </Col>
                        <Col className="perinfo" style={{ "fontSize": "15px" }} span={22}>{addressObj.receiving_name}<span style={{ "marginLeft": "0.5rem" }}>{addressObj.phone}</span></Col>
                        <Col className="address" span={22} offset={2}>地址：{addressObj.province.name + addressObj.city.name + addressObj.country.name + addressObj.address}</Col>
                    </Row>
                )
            } else {
                return (<div className="addAddress" onClick={this.changeType.bind(this, 3)}>
                    <i className="iconfont icon-tianjia"></i>添加收货地址
                </div>)
            }
        } else if (this.state.type === 2) {//显示收货地址列表
            window.document.title = "收货地址";

            return (<div className="pageaddressList">
                <div className="addressList">
                    {
                        this.state.addressList.map((e, i) => {
                            let receiving_name = e.receiving_name;
                            let phone = e.phone;
                            let address = e.address;
                            let address_id = e.address_id;
                            let provincearr = JSON.stringify([e.province_id, e.city_id, e.country_id]);
                            return (
                                <Row className="addressItem" key={i} onClick={this.selectAddress.bind(this, i)}>
                                    <Col className="perinfo" span={18}>{e.receiving_name}<span style={{ "marginLeft": "0.5rem" }}>{e.phone}</span></Col>
                                    <Col span={6} align="right" className="btns">
                                        <i className="iconfont icon-xiugai_l" style={{ "fontSize": "0.4rem" }} onClick={(ev) => { this.editaddress(receiving_name, phone, address, address_id, provincearr); ev.stopPropagation(); }} ></i>
                                        <i className="iconfont icon-iconfontshanchu3" style={{ "marginLeft": "0.2rem", "fontSize": "0.4rem" }} onClick={(ev) => { this.deladdress(e.address_id); ev.stopPropagation(); }}></i>
                                    </Col>
                                    <Col className="address" span={24}>地址：{e.province.name + e.city.name + e.country.name + e.address}</Col>
                                </Row>

                            )
                        })
                    }
                </div>
                <div className="addAddress" onClick={this.changeType.bind(this, 3)}>
                    <i className="iconfont icon-tianjia" style={{ "marginRight": "0.2rem" }}></i>添加收货地址
                </div>
            </div>)
        } else if (this.state.type === 3) {//新增地址
            window.document.title = "新增地址";
            let provincedata = provincedataToOption(this.state.provincedata);
            console.log(provincedata);
            let province = {};//省
            let city = {};//市
            let country = {};//区
            if(this.state.provincearr.length!==0){
                //获取省
                for (let i = 0; i < provincedata.length;i++){
                    if (provincedata[i].value === this.state.provincearr[0]){
                        province = provincedata[i];
                        break;
                    }
                }
                //获取室
                for (let i = 0; i < province.children.length;i++){
                    if (province.children[i].value === this.state.provincearr[1]) {
                        city = province.children[i];
                        break;
                    }
                }
                //获取县
                for (let i = 0; i < city.children.length; i++) {
                    if (city.children[i].value === this.state.provincearr[2]) {
                        country = city.children[i];
                        break;
                    }
                }

            }
            return (<div className="addAddressPage">
                <div style={{ "background": "#fff", "marginTop": "0.5rem", "borderTop": "1px solid #ececec", "borderBottom": "1px solid #ececec" }}>
                    <Row className="item">
                        <Col span={5} className="label">
                            收货姓名
                        </Col>
                        <Col span={19} align="right">
                            <InputItem value={this.state.receiving_name} onChange={this.changereceiving_name} placeholder="请输入收货姓名" style={{ "border": "0" }} />
                        </Col>
                    </Row>
                    <Row className="item">
                        <Col span={5} className="label">
                            联系电话
                        </Col>
                        <Col span={19} align="right">
                            <InputItem value={this.state.phone} onChange={this.changephone} placeholder="请输入联系人电话" style={{ "border": "0" }} />
                        </Col>
                    </Row>
                    <Row className="item">
                        <Col span={5} className="label">
                            所在地区
                        </Col>
                        <Col span={19}>
                            <Picker
                                title="选择地区"
                                extra="请选择(可选)"
                                data={provincedata}
                                value={this.state.provincearr}
                                onChange={v => this.setState({ provincearr: v })}
                                onOk={v => this.setState({ provincearr: v })}
                            >
                                <div style={{ "paddingLeft": "26px", "fontSize": "14px" }}>{this.state.provincearr.length === 0 ? <span style={{color: '#bbbbc9'}}>请选地区</span>:(province.label + "/" + city.label + "/" + country.label)}</div>
                            </Picker>
                        </Col>
                    </Row>
                    <Row className="item">
                        <Col span={5} className="label">
                            详细地址
                        </Col>
                        <Col span={19} align="right">
                            <InputItem value={this.state.address} onChange={this.changeaddress} placeholder="请输入详细地址" style={{ "border": "0" }} />
                        </Col>
                    </Row>

                    
                </div>
                <div className="saveBtn">
                    <Button style={{ "background": "#389EC9", "color": "#fff" }} onClick={this.saveaddress}>保存</Button>
                    <Button style={{"marginTop":"10px"}} onClick={this.toAddList}>取消</Button>
                </div>
            </div>)
        }

    }
}

const provincedataToOption = (data) => {
    let newData = [];
    if (data !== null) {
        for (let i = 0; i < data.length; i++) {
            let obj = {};
            let dataInt = data[i];
            let cityList = dataInt.cityList;

            //处理省
            obj.value = dataInt.province_id;
            obj.label = dataInt.name;
            obj.children = [];
            //处理市
            if (cityList !== null && cityList.length > 0) {
                for (let j = 0; j < cityList.length; j++) {
                    let cityobj = {}
                    let countryList = cityList[j].countryList;
                    cityobj.value = cityList[j].id;
                    cityobj.label = cityList[j].abbrv_name;
                    cityobj.children = [];
                    //处理区
                    if (countryList !== null && countryList.length > 0) {
                        for (let k = 0; k < countryList.length; k++) {
                            let countryobj = {};
                            countryobj.value = countryList[k].id;
                            countryobj.label = countryList[k].name;
                            cityobj.children.push(countryobj);
                        }
                    }
                    obj.children.push(cityobj);
                }
            }

            newData.push(obj);
        }
    }
    return newData;
}

export default FillinOrderControl