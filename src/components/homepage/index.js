import React, { Component } from "react";
import { Content, Footer } from "./../common/common"
import "./index.less"
import { Icon, SearchBar, Modal, Toast, Accordion, List } from 'antd-mobile'
import Global from "./../config/globla"
import { fetchObjToString } from "./../fetch/index"
import c_img_default from "./commodity_default.png"
import { Link } from "react-router-dom"
import Tloader from 'react-touch-loader';

const prompt = Modal.prompt;
class IndexPage extends Component {
    componentDidMount() {
        document.title = "首页";
    }
    render() {
        return (<div className="homepage">
            <Content hasFooter={true}>
                <ShopList />
            </Content>
            <Footer />
        </div>)
    }
}
class ShopList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "commodity_id": 0,
            "p_id": 0,
            "data": [],
            "cond": "",
            "type": 0,
            "pageNo": 1,
            "isSinple": true, //是否是单列
            "typeData": [],
            "isSelectType": false,
            "num": "1.0",
            "hasMore": 1,
            "initializing": 1,
            "canRefreshResolve": 1,
            "refreshedAt": Date.now()
        }
    }
    componentDidMount() {
        Toast.loading("载入中", "1000");
        this.getcommoditlist();
        this.getTypeList();
    }
    //获取商品列表
    getcommoditlist = (cond = this.state.cond, type = this.state.type, pageNo = this.state.pageNo, callback = () => { }) => {

        let url = Global.PATHNAME + "comp/commodity.do?list";
        let params = {
            cond: cond,
            type: type,
            "in_type": 1,
            "look_user_id": 0,
            "status": 1,
            "pageNo": pageNo,
            "pageSize": 10
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
            let newdata = pageNo === 1 ? [] : this.state.data;
            let data = JSON.parse(res).data;
            let hasMore = 1;
            if (json.result === 1) {

                if (data.paginationData && data.paginationData.length > 0) {
                    newdata = newdata.concat(data.paginationData);
                    if (data.pageNo === data.pageAmount) {
                        hasMore = 0;
                    }
                }
            } else {
                Toast.fail("获取商品列表失败");
            }
            this.setState({
                data: newdata,
                hasMore: hasMore,
                pageNo: pageNo
            })
            Toast.hide();
            callback();
        }).catch((err) => {
            console.log(err);
        })
    }
    //获取类型
    getTypeList = () => {
        let url = Global.PATHNAME + "sys/codeitem.do?getMenuTree";
        let params = {
            set_id: 7
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
            let data = JSON.parse(res).data;
            if (data !== null) {
                let typeData = [{
                    "text": "全部",
                    "id": 0,
                    "isLeaf": true
                }]
                this.setState({
                    typeData: typeData.concat(data)
                })
            } else {
                this.setState({
                    typeData: []
                })
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    //改变排序方式
    changeSimple = () => {
        this.setState({
            isSinple: !this.state.isSinple
        })
    }
    //打开筛选类型
    openTypeControl = () => {
        this.setState({
            isSelectType: true
        })
    }
    //选中类型
    selectType = (code_item_id) => {
        this.setState({
            isSelectType: false,
            type: code_item_id,
            data: [],
            pageNo: 1
        })
        this.getcommoditlist("", code_item_id);
    }
    //搜索
    search = (value) => {
        this.setState({
            cond: value,
            data: [],
            pageNo: 1
        })

        this.getcommoditlist(value,0);
    }
    //点击确定
    handleOk = async (e) => {
        // console.log(e);
        // this.setState({
        //     visible: false,
        //     "commodity_id": 0
        // });
        this.addCart();
    }
    //点击取消
    handleCancel = (e) => {
        this.setState({
            "commodity_id": 0
        });
    }
    //打开输入数量框
    addNum = (commodity_id, p_id) => {
        this.setState({
            "commodity_id": commodity_id,
            "num": "1.0",
            "p_id": p_id
        })
    }
    //添加购物车
    addCart = () => {
        let url = Global.PATHNAME + "comp/order/cart.do?add";
        let params = {
            "cid": this.state.commodity_id,
            "pid": this.state.p_id,
            "count": this.state.num,
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
    numChange = (value, resolve) => {
        
        if (Number(value) < 0) {
            Toast.fail("所选商品数量必须大于等于0");
            this.setState({
                "num": "1.0"
            })
        } else {
            this.setState({
                "num": value
            })
            setTimeout(() => {
                resolve();
                this.addCart();
            }, 1000);
        }

    }
    handleRefresh(resolve, reject) {
        this.getcommoditlist(this.state.cond, this.state.type, 1, () => {
            if (!this.state.canRefreshResolve) return reject();

            this.setState({
                refreshedAt: Date.now()
            });
            resolve();
        })
    }
    handleLoadMore(resolve) {
        let pageNo = this.state.pageNo + 1;
        this.getcommoditlist(this.state.cond, this.state.type, pageNo, () => {
            resolve();
        })
    }
    toggleCanRefresh() {
        this.setState({ canRefreshResolve: !this.state.canRefreshResolve });
    }
    getPanel = (item) => {
        if (item.children !== undefined && item.children !== null && item.children.length > 0) {
            return (
                <List className="my-list">
                    <List.Item>
                    {
                        item.children.map((e,i)=>{
                            let renderChild = (data)=>{
                                if (data.children !== null && data.children !== undefined&&data.children.length>0){
                                    return (
                                        <Accordion className="my-accordion">
                                            <Accordion.Panel header={<div onClick={this.selectType.bind(this, data.id)}>{data.text}</div>}>
                                                {
                                                    this.getPanel(data)
                                                }
                                            </Accordion.Panel>
                                        </Accordion>
                                    )
                                }else{
                                    return (<List><List.Item className="AccordionNoChild" onClick={this.selectType.bind(this,e.id)}>
                                        {e.text}
                                    </List.Item></List>)
                                }
                            }

                            return <List.Item>
                                {  renderChild(e)}
                            </List.Item>
                        })
                    }
                    </List.Item>
                </List>
           
            )
        } else {
            return (<div></div>)
        }

    }
    renderTreeNodes = (data) => {
        console.log(data);
        return this.renderAccordion(data);
        
    }
    renderAccordion = (data)=>{
        return (<Accordion defaultActiveKey={this.state.type} className="my-accordion">
            {
                data.map((item) => {
                    if (item.children !== null && item.children !== undefined && item.children.length > 0){
                        return (<Accordion.Panel header={<div onClick={this.selectType.bind(this, item.id)}>{item.text}</div>} >

                            {this.getPanel(item)}


                        </Accordion.Panel>);
                    }else{
                        return <List><List.Item className="listNoChild" onClick={this.selectType.bind(this, item.id)}>
                            {item.text}
                        </List.Item></List>
                    }
                   

                })
            }
        </Accordion>)
    }
    render() {
        const mapShopList = () => {

            if (this.state.data.length > 0) {
                return (<div>
                    <Tloader
                        initializing={this.state.initializing}
                        hasMore={this.state.hasMore}
                        autoLoadMore={true}
                        onRefresh={(resolve, reject) => this.handleRefresh(resolve, reject)}
                        onLoadMore={(resolve) => this.handleLoadMore(resolve)}
                        className="tloader some class"
                    >
                        {
                            this.state.data.map((e, i) => {
                                let price = 0;
                                let p_id = 0;
                                if (e.commodityPrices !== null && e.commodityPrices.length > 0) {
                                    price = e.commodityPrices[0].c_price;
                                    p_id = e.commodityPrices[0].c_itemid;
                                }
                                price = Number(price).toFixed(2);
                                const createItem = () => {

                                    if (this.state.isSinple) {
                                        return (<div className="sinple">
                                            <div style={{"width":"25%","float":"left"}}>
                                                <Link key={"link" + i} to={"/shop/shopdetail?commodity_id=" + e.commodity_id} ><img className="shopImg" alt="商品图片" src={e.c_pic ? e.c_pic : c_img_default} /></Link>
                                            </div>
                                            <div style={{"width":"75%","float":"left"}}>
                                                <Link key={"link" + i} to={"/shop/shopdetail?commodity_id=" + e.commodity_id} >
                                                    <div className="shopInfo">
                                                        <p className="c_name">{e.c_name}</p>
                                                        <p className="specification">{e.specification ? "规格：" + e.specification : ""}</p>
                                                        <div className="label">
                                                            <span className={e.isnew === 1 ? "lab new" : "hide"}>新品</span>
                                                            <span className={e.issales === 1 ? "lab sales" : "hide"}>促销</span>
                                                        </div>
                                                    </div>
                                                </Link>

                                                <div className="showDiff">
                                                    <span className="shopPrice">{"￥" + price}</span>
                                                    <span style={{ "float": "right", "paddingRight": "10px" }}>|<i className="iconfont icon-gouwuche addCart" onClick={() => {
                                                        this.addNum(e.commodity_id, p_id); 
                                                        prompt('请输入商品数量', '商品数量大于0，否则禁止提交', [
                                                            { text: '取消'},
                                                            {
                                                                text: '确定',
                                                                onPress: value => new Promise((resolve) => {
                                                                    this.numChange(value, resolve);
                                                                    
                                                                }) },
                                                        ], 'default', this.state.num)}}></i></span>
                                                </div>
                                            </div>
                                        </div>)
                                    } else {//这个暂时没用  是一行显示俩商品
                                        return (<div style={{"width":"75%","float":"left"}} className="dubbo">
                                            <Link key={"link" + i} to={"/shop/shopdetail?commodity_id=" + e.commodity_id} >
                                                <div  style={{ "overflow": "hidden", "padding": "10px" }}>
                                                    <img alt="商品图片" className="shopImg" src={e.c_pic ? e.c_pic : c_img_default} />
                                                </div>
                                            </Link>
                                            <div span={24}>
                                                <div className="shopName">{e.c_name}</div>
                                                <div className="showDiff">
                                                    <span className="shopPrice">{"￥" + price}</span>
                                                    <span style={{ "float": "right", "paddingRight": "10px" }}>|  <Icon onClick={this.addNum.bind(this, e.commodity_id)} className="addCart" type="shopping-cart" /></span>
                                                </div>
                                            </div>
                                        </div>)
                                    }

                                }
                                return (<div key={i}>
                                    {
                                        createItem()
                                    }
                                </div>
                                )
                            })
                        }
                    </Tloader>
                </div>)

            } else {
                return (<div style={{ "textAlign": "center", "paddingTop": "100px", "fontSize": "0.32rem" }}>
                    暂无商品列表
                </div>)
            }

        }
        if (!this.state.isSelectType) {
            return (<div>
                <div className="btn-group">
                    <div style={{"width":"91.5%","float":"left"}}>
                        <SearchBar
                            placeholder="输入名称、规格、编号"
                            onSubmit={value => this.search(value)}
                        />
                    </div>
                    <div style={{ fontSize: "22px", "lineHeight": "0.88rem" ,"width":"8.5%","float":"left","textAlign":"center"}}>
                        <i className="iconfont icon-shaixuan" onClick={this.openTypeControl}></i>
                    </div>
                </div>
                <div className="shopList" id="scroll-wrap">
                    <div className="shopItem">
                        {
                            mapShopList()
                        }
                    </div>

                </div>
                {/* <Modal
                    title="请输入购买数量"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <InputItem type="number" value={this.state.num} onChange={this.numChange} />
                </Modal> */}
            </div>)

        } else {
            return (
                <div style={{ "height": "100%", "background": "#fff","overflow":"auto"}}>
                    {this.renderTreeNodes(this.state.typeData)}
                </div>

            )
        }

    }
}
export default IndexPage;