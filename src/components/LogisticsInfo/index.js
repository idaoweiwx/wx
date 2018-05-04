import React, { Component } from "react"
import "./../common/common.less"
import "./index.less"
import { fetchObjToString } from "./../fetch/index"
import Global from "./../config/globla"
import { Carousel, Toast, Modal, List, Icon, Steps } from 'antd-mobile';
import getHashParameters from "./../util/getParams"
let map;
let orderid = getHashParameters("order_id");
const Step = Steps.Step;
class LogInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            "locactions": [],
            "sends": [],
            "expressdata": [],//快递信息
            "nowClientIndex": 0,
            "visible": false
        }
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    componentDidMount() {
        document.title = "物流信息";
        orderid = getHashParameters("order_id");
        this.getorderinfo();
    }
    componentDidUpdate() {
        if (this.state.queryType === 1) {
            this.createBMapTract();
        }
    }
    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    }
    //画折线
    draw_line_direction = (weight) => {
        let BMap = window.BMap;
        let icons = new BMap.IconSequence(
            new BMap.Symbol('M0 -5 L-5 -2 L0 -4 L5 -2 Z', {
                scale: weight / 10,
                strokeWeight: 1,
                rotation: 0,
                fillColor: 'white',
                fillOpacity: 1,
                strokeColor: 'white'
            }), '100%', '5%', false);
        return icons;
    }
    //画地图
    createBMapTract = () => {
        let BMap = window.BMap;
        map = new BMap.Map('map_canvas');
        // 创建地图实例
        let initPoint = new BMap.Point(116.404, 39.915);
        // 创建点坐标
        map.centerAndZoom(initPoint, 11);

        //添加缩放按钮
        var top_right_navigation = new BMap.NavigationControl({ anchor: 1, type: 1 }); //右上角
        map.addControl(top_right_navigation);
        let locactions = (this.state.locactions !== null && this.state.locactions.length > 0) ? this.state.locactions : [];
        let pointArr = [];
        for (let i = 0; i < locactions.length; i++) {
            pointArr.push(new BMap.Point(locactions[i].bd_longitude, locactions[i].bd_latitude));
        }
        //添加覆盖物
        // for(let i=0;i<pointArr.length;i++){
        //     let marker = new BMap.Marker(pointArr[i]);
        //     map.addOverlay(marker);
        // }
        var pointCollection = new BMap.PointCollection(pointArr, { shape:window.BMAP_POINT_SHAPE_WATERDROP});
        
        var polyline = new BMap.Polyline(pointArr, {
            strokeColor: "#25d462", strokeWeight: 4, strokeOpacity: 1,
            icons: [this.draw_line_direction(8)]
        });   //创建折线
        map.addOverlay(polyline);          //增加折线
        map.addOverlay(pointCollection);
        map.setViewport(pointArr);
    }
    //获取快递信息
    getExpress = () => {
        let send = this.state.sends[this.state.nowClientIndex];
        console.log(send);
        let url = Global.PATHNAME + "common.do?express";
        let params = {
            code: send.send_memo.split(",")[1],
            shipper: send.send_memo.split(",")[4],
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
                if (json.data !== null) {
                    this.setState({
                        expressdata: json.data.traces
                    })
                } else {
                    this.setState({
                        expressdata: []
                    })
                }
            } else {
                Toast.fail(json.message);
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    //获取轨迹
    getTrack = () => {

        let url = Global.PATHNAME + "comp/order/send.do.do?track";
        let params = {
            oid: orderid,
            isl: 1,
            userid: this.state.sends[this.state.nowClientIndex].send_uid
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
                if (json.data !== null) {
                    this.setState({
                        locactions: json.data.locactions
                    })
                }
            } else {
                Toast.fail(json.message);
            }
        }).then(() => {
            this.createBMapTract();
        }).catch((err) => {
            console.log(err);
        })
    }
    //地图拖动改变事件
    onChange = (from, to) => {
        let locaction = this.state.locactions[to];
        if (locaction) {
            let BMap = window.BMap;
            // 创建点坐标
            let initPoint = new BMap.Point(locaction.bd_longitude, locaction.bd_latitude);
            console.log(map);
            map.centerAndZoom(initPoint, map.getViewport().zoom);
        }
    }
    //获取订单详情
    getorderinfo = () => {
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
                let order = json.data.order ? json.data.order : {};
                if (order.sends !== null && order.sends.length > 0) {
                    let queryType = order.sends[this.state.nowClientIndex].send_type;
                    this.setState({
                        sends: order.sends,
                    })

                    if (queryType === 2) {
                        setTimeout(() => {
                            this.getExpress();
                        }, 300);

                    } else if (queryType === 1) {
                        setTimeout(() => {
                            this.getTrack();
                        }, 300);
                    }
                } else {
                    this.setState({
                        sends: []
                    })
                }
            } else {
                Toast.fail(json.message);
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    changeSend = (nowClientIndex) => {
        this.setState({
            nowClientIndex: nowClientIndex,
            visible: false,
            locactions: [],
            "expressdata": [],//快递信息
        })
        if (this.state.sends[nowClientIndex]) {
            let send = this.state.sends[nowClientIndex];
            if (send.send_type === 1) {
                setTimeout(() => {
                    this.getTrack();
                }, 300);
            } else if (send.send_type === 2) {
                setTimeout(() => {
                    this.getExpress();
                }, 300);
            }
        }
    }
    render() {
        let expressdata = this.state.expressdata ? this.state.expressdata : [];
        const createStep = () => {
            let items = [];
            let len = expressdata.length;
            for (let i = len - 1; i >= 0; i--) {
                items.push(
                    <Step title={expressdata[i].info} description={expressdata[i].time} />
                )
            }
            return items;
        }
        const createContent = () => {
            let send = this.state.sends[this.state.nowClientIndex];
            if (send) {
                let send_type = send.send_type; //1我司送货 2-快递 3-第三方个人
                if (send_type === 1) {
                    let len = this.state.locactions ? this.state.locactions.length : 0;
                    let locactions = this.state.locactions ? this.state.locactions : [];
                    return (<div className="trackPage">
                        <div className="title" onClick={this.showModal}>公司送货人：{send.sendUName} <Icon type="right" style={{ "float": "right", "marginTop": "15px" }} /></div>
                        <div className="trackInfo">
                            共计{len}个轨迹点
                        </div>
                        <div className="map_wrap">
                            <div className="map_canvas" ref="map_canvas" id="map_canvas">

                            </div>
                            <div className="swiper">
                                <Carousel className="space-carousel"
                                    frameOverflow="visible"
                                    cellSpacing={10}
                                    slideWidth={0.7}
                                    infinite
                                    beforeChange={this.onChange}
                                        dots={false}
                                >
                                    {
                                        locactions.map((e, i) => {
                                            return (<div style={{ "background": "#fff", "height": "100%", "overflow": "hidden" }}
                                                onLoad={() => {
                                                    // fire window resize event to change height
                                                    window.dispatchEvent(new Event('resize'));
                                                }}
                                            >
                                                <p>轨迹：{i + 1}  送货</p>
                                                <p className="locationinfo">{e.locationinfo}</p>
                                            </div>)
                                        })
                                    }
                                </Carousel>
                            </div>
                        </div>

                    </div>)
                } else if (send_type === 2) {
                    let expressdata = this.state.expressdata ? this.state.expressdata : [];
                    return (<div className="trackPage">
                        <div className="title" onClick={this.showModal}>{send.send_memo.split(",")[0]}<Icon type="right" style={{ "float": "right", "marginTop": "0.1rem" }} /></div>
                        <div style={{"paddingLeft":"0.3rem"}}>单号：{this.state.sends[this.state.nowClientIndex].send_memo.split(",")[1]}</div>
                        <div className="expressWrap">
                            <div>
                           
                            </div>
                            <Steps size="small" current={expressdata.length}>
                                {
                                    createStep()
                                }
                            </Steps >
                        </div>
                    </div>)
                } else if (send_type === 3) {
                    return (<div className="trackPage">
                        <div className="title" onClick={this.showModal} >第三方个人：{send.send_memo.split(",")[0]}{send.send_memo.split(",")[2]}<Icon type="right" style={{ "float": "right", "marginTop": "0.1rem" }} /></div>
                        <div className="none-info">暂无信息</div>
                    </div>)
                }
            } else {
                return (<div>
                    <div className="trackPage none-info">
                        暂无物流跟踪信息
                    </div>
                </div>)
            }

        }

        return (<div>
            {
                createContent()
            }
            <Modal
                popup
                visible={this.state.visible}
                onClose={this.handleCancel}
                animationType="slide-up"
            >
                <List renderHeader={() => <div>选择送货选项</div>} className="popup-list">
                    {this.state.sends.map((item, index) => (
                        <List.Item style={{ "textAlign": "center" }} onClick={this.changeSend.bind(this, this.state.sends.indexOf(item))}>{
                            item.send_type === 1 ? "公司送货人：" + item.sendUName : (item.send_type === 2 ? item.send_memo.split(",")[0] : "第三方个人：" + item.send_memo.split(",")[0])
                        }</List.Item>
                    ))}
                    <List.Item style={{ "textAlign": "center" }} onClick={this.handleCancel}>
                        取消
                    </List.Item>
                </List>
            </Modal>
        </div>)
    }
}

export default LogInfo;