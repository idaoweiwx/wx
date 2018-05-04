import React, { Component } from "react";
import "./common.less";
import {TabBar} from "antd-mobile"
class Content extends Component {
    render() {
        let className = this.props.hasFooter ? "page-content hasFooter" : "page-content"
        return (<div className={className}>
            {this.props.children}
        </div>)
    }
}

class Footer extends Component {

    render() {
        if (this.props.children) {
            return <div className="page-footer">
                {this.props.children}
            </div>
        } else {
            let active = this.props.active ? this.props.active:0;
            return (<div className="page-footer">
                <TabBar
                    unselectedTintColor="#949494"
                    tintColor="#33A3F4"
                    barTintColor="white"
                >
                    {
                        this.props.data.map((e, i) => {
                            let isChecked = active===i?true:false;
                            return <TabBar.Item
                                title={e.text}
                                key={e.text}
                                icon={<i style={{"fontSize":"23px"}} className={e.type}></i>}
                                selectedIcon={<i className={e.type} style={{ "color": "#38b1d4", "fontSize": "23px"}}></i>}
                                data-seed="logId" 
                                selected={isChecked}
                                onPress={()=>{
                                    window.location.href = window.location.origin + window.location.pathname + "#"+e.link
                                }}
                                />
                                // <Link key={"link" + i} to={e.link} ></Link>
                        })
                    }
                </TabBar>
            </div>)
        }
    }
}
Footer.defaultProps = {
    data: [{
        "text": "首页",
        "link": "/index",
        "type": "iconfont icon-home",
    }, {
        "text": "购物车",
        "link": "/cart/index",
        "type": "iconfont icon-gouwuche"
    }, {
        "text": "我的订单",
        "link": "/order/list",
        "type": "iconfont icon-order"
    }],
    active: 0
}

class Row extends Component{
    render(){
        let className = this.props.className ? this.props.className:"";
        let onClick = this.props.onClick ? this.props.onClick:()=>{};
        return (<div className={"ant-row " + className} style={this.props.style} onClick={onClick}>
            {this.props.children}
        </div>)
    }
}

class Col extends Component{
    render(){
        let className = this.props.className ? this.props.className:"";
        let span = this.props.span ? this.props.span:"";
        let offset = this.props.offset ? this.props.offset:"";
        let align = this.props.align ? this.props.align:"";
        let onClick = this.props.onClick ? this.props.onClick:()=>{};
        let classNameStr = className + " ant-col-" + span +" ant-col-offset-"+offset;
        let style = this.props.style ? this.props.style:{};
        style["textAlign"]=align;
        return (<div id={this.props.id} className={classNameStr} onClick={onClick} style={style}>
            {this.props.children}
        </div>)
    }
}

export { Content, Footer,Row,Col };
