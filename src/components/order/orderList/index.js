import React, { Component } from "react"
import "./index.less"
import { Content, Footer } from "./../../common/common"
import { fetchObjToString } from "./../../fetch/index"
import Global from "./../../config/globla"
import OrderItem from "./../orderItem/orderItem"
import { Toast } from 'antd-mobile';
//手动abort fetch
let timer = (t) => {
    return new Promise(resolve => setTimeout(resolve, t))
        .then(function (res) {
            console.log('timeout');
        });
}
let orderFetch = null;


class OrderListPage extends Component {
    componentDidMount() {
        document.title = "我的订单";
    }
    render() {
        return (<div className="orderListPage">
            <Content hasFooter={true}>
                <OrderList />
            </Content>
            <Footer active={2} />
        </div>)

    }
}

class OrderList extends Component {
    constructor() {
        super();
        this.state = {
            "label": 0,
            "data": [],
            "navList": ["全部订单", "待付款", "待发货", "已发货", "已完成"],
            "spin": true
        }
    }
    changeLabel = (label) => {
        this.setState({
            "label": label
        })
        this.getorderlist(label);
    }

    componentDidMount() {
        this.getorderlist(0);
    }
    getorderlist = (type = this.state.label) => {
        Toast.loading("获取订单中...请稍候", 1000);
        if (orderFetch !== null) {
            Promise.race([orderFetch, timer(1000)]);
        }
        this.setState({
            "data": []
        })
        let status = "";
        switch (type) {
            case 0://全部订单
                status = "-1,0,1,5,4,3,8,2";
                break;
            case 1://待付款
                status = "-1"
                break;  
            case 2://待发货
                status = "0,4"
                break;
            case 3://已发货
                status = "1,5"
                break;
            case 4://已完成
                status = "3" 
                break;
            default:
                break;
        }
        let url = Global.PATHNAME + "comp/order.do?list";
        let params = {
            startdate: "",
            enddate: "",
            status: status,
            dtype: 2,
            stype: 1,
            balance: - 1,
            userid: 0,
            customerid: -1,
            pageNo: 1,
            pageSize: 50,
            new: 1,
            sdetails: "7",
            otype: 5,
            islist: 1,
            trans_type: 6
        }
        orderFetch = fetch(url, {
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
                let data = json.data.paginationData ? json.data.paginationData : []
                this.setState({
                    data: data
                })

            } else {
                Toast.fail(json.message);
                this.setState({
                    data: []
                })
            }
            Toast.hide();
        }).catch((err) => {
            console.log(err);
        })
    }
    render() {
        const createList = () => {
            return (<div>
                {
                    this.state.data.map((e, i) => {
                        return <OrderItem
                            data={e}
                            getorderlist={this.getorderlist}
                        />
                    })
                }

            </div>)

        }

        return (<div>
            <ul className="nav">
                {
                    this.state.navList.map((e, i) => {
                        return <li className={i === this.state.label ? "active" : ""} onClick={this.changeLabel.bind(this, i)} key={i}><span className="text_wrap">{e}</span></li>
                    })
                }
            </ul>

            <div className="orderListWrap">
                {
                    createList()
                }
            </div>
        </div>)
    }
}


export default OrderListPage;