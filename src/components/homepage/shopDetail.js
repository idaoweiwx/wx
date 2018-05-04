import React, { Component } from "react";
import { Content, Footer,Row,Col } from "./../common/common"
import { Carousel, InputItem, Toast } from 'antd-mobile';
import Global from "./../config/globla"
import { fetchObjToString } from "./../fetch/index"
import "./shopDetail.less";
import getHashParameter from "./../util/getParams"
let commodity_id_href;
class ShopDetailPage extends Component {
    state = {
        commodityPrices: []
    }
    componentDidMount() {
        document.title = "详情";
    }
    changecommodityPrices = (commodityPrices = []) => {
        this.setState({
            commodityPrices: commodityPrices
        })
    }
    render() {
        return (<div className="shopDetail">
            <Content hasFooter={true}>
                <ShopDetail changecommodityPrices={this.changecommodityPrices} />
            </Content>
            <Footer>
                <AddCart commodityPrices={this.state.commodityPrices} />
            </Footer>
        </div>)
    }
}
class ShopDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Collection: false,
            data: {},
            "icon": ["icon-shaixuan", "icon-shoucang", "icon-tianjia"]
        }
    }
    componentDidMount() {
        let commodity_id = getHashParameter("commodity_id");
        commodity_id_href = commodity_id;
        let url = Global.PATHNAME + "comp/commodity.do?info";
        let params = {
            "code": commodity_id,
            "isGetAllPrice": 0
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
                    Collection: json.data.isfavorite === 1 ? true : false
                })
                this.props.changecommodityPrices(json.data.commodityPrices);
            } else {
                this.setState({
                    data: {},
                    Collection: false
                })
                Toast.fail(json.message)
            }


        }).catch((err) => {
            console.log(err);
            this.setState({
                data: {},
                Collection: false
            })
        })

    }
    /* //收藏  
    changeCollection = (commodityId)=>{
        let url = Global.PATHNAME + "comp/user/favorite.do?" + (this.state.Collection ?"cancle":"add");
        let params = {
            "obj_id": commodityId
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
                    Collection: !this.state.Collection
                })
            } else {
                message.error(json.message)
            }
        }).catch((err) => {
            console.log(err);
        })
        
    } */
    render() {
        let data = this.state.data;
        //默认价格
        let price = 0;
        let commodityPrices = data.commodityPrices ? data.commodityPrices : []
        if (commodityPrices !== null && commodityPrices.length > 0) {
            // for (let j = 0; j < commodityPrices.length; j++) {
            //     if (commodityPrices[j].c_itemid == 3921) {//默认价

            //     }
            // }
            price = commodityPrices[0].c_price;
        }
        price = Number(price).toFixed(2);
        //附件图片 商品图片
        let sysAttaches = this.state.data.sysAttaches ? this.state.data.sysAttaches : [{ attach_storage: "http://www.idaowei.com/core/view/images/commodity_default.png" }]
        //单位
        let mainUnit = this.state.data.mainunit;
        let unitName = "";
        if (mainUnit != null) {
            unitName = mainUnit.u_name;
        }
        return (<div>
            <Carousel
                autoplay={false}
                infinite
                selectedIndex={0}
            >   
                {sysAttaches.map(val => (
                    <a
                        key={val}
                        style={{ display: 'inline-block', width: '100%', height: "4.5rem" }}
                    >
                        <img
                            src={val.attach_storage}
                            alt=""
                            style={{ width: '100%', verticalAlign: 'top' }}
                            onLoad={() => {
                                // fire window resize event to change height
                                window.dispatchEvent(new Event('resize'));
                                this.setState({ imgHeight: 'auto' });
                            }}
                        />
                    </a>
                ))}
            </Carousel>
            <div className="shopInfo">

                <p className="c_name">{this.state.data.c_name}</p>
                <p className="specification"><span>规格：</span><span>{this.state.data.specification}</span></p>
                <p>
                    <span className="price">￥{price}</span>
                    <span className={this.state.data.isnew === 1 ? "lab new" : "hide"}>新品</span>
                    <span className={this.state.data.issales === 1 ? "lab sales" : "hide"}>促销</span>
                </p>
                {/* <Col span={6}>
                    <Icon onClick={this.changeCollection.bind(this, data.commodity_id)} type={this.state.Collection ? "star":"star-o"} />
                        <p>
                            {this.state.Collection?"已收藏":"未收藏"}
                        </p>
                    </Col> */}
            </div>
            <div className="shopDes">
                <div className="title">商品信息</div>
                <div className="remark">{this.state.data.remark ? this.state.data.remark : "暂无信息"}</div>
            </div>
            <div className="shopSpe" style={{ "marginTop": "15px" }}>
                <div className="title">商品规格</div>
                <div className="spe">
                    <p><span>分类：</span><span>{this.state.data.type_name}</span></p>
                    <p><span>单位：</span><span>{unitName}</span></p>
                    <p><span>规格：</span><span>{this.state.data.specification}</span></p>
                    <p><span>编码：</span><span>{this.state.data.c_code}</span></p>
                    <p><span>条形码：</span><span>{this.state.data.barcode}</span></p>
                </div>
            </div>
        </div>)
    }
}
class AddCart extends Component {
    state = {
        commodityPrices: this.props.commodityPrices ? this.props.commodityPrices : [],
        c_itemid: 3921,
        count: "1.0",
        visible: false
    }
    componentWillReceiveProps(newprops) {
        this.setState({
            commodityPrices: newprops.commodityPrices
        })
    }
    changeCount = (value) => {
        if (Number(value) < 0) {
            Toast.fail("商品数量必须大于等于0");
            this.setState({
                count: "1.0"
            })
        } else {
            this.setState({
                count: value
            })
        }

    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    selectc_itemid = (c_itemid) => {
        this.setState({
            c_itemid: c_itemid,
            visible: false,
        })
    }
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }
    //添加购物车
    addCart = () => {
        if (this.state.count === "") {
            Toast.success("请填写商品数量");
            return;
        }
        let url = Global.PATHNAME + "comp/order/cart.do?add";
        let params = {
            "cid": commodity_id_href,
            "pid": this.state.c_itemid,
            "count": this.state.count,
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
            let json = JSON.parse(res)
            if (json.result === 1) {
                Toast.success("添加购物车成功");
                this.handleCancel();
            } else {
                Toast.fail(json.message)
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    render() {
        // let c_item_name = "";
        // let commodityPrices = this.state.commodityPrices ? this.state.commodityPrices : []
        // if (commodityPrices !== null && commodityPrices.length > 0) {
        //     // for (let j = 0; j < commodityPrices.length; j++) {
        //     //     if (commodityPrices[j].c_itemid == this.state.c_itemid) {//默认价
        //     //         c_item_name = commodityPrices[j].c_item_name;
        //     //     }
        //     // }
        //     c_item_name = commodityPrices[0].c_item_name;
        // }
        return (<Row style={{ height: "100%", "lineHeight": "0.98rem", "paddingLeft": "20px" }}>
            <Col span={4} align="left">
                <span style={{ "fontSize": "0.3rem", color: "#303030","lineHeight":"50px"}}>数量：</span>
            </Col>
            <Col span={8}>
                <InputItem placeholder="商品数量" value={this.state.count} onChange={this.changeCount} />
            </Col>
            <Col className="addCart" span={9} offset={3} align="center" onClick={this.addCart}>
                <i className="carticon iconfont icon-gouwuche" />
                加入购物车
            </Col>
        </Row>)
    }
}
export default ShopDetailPage;