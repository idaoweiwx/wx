import React, { Component } from "react";
import Img from "./404.svg";
import "./common.less";
class NotMatch extends Component{
    render(){
        return (<div className="error-cont">
            <img src={Img} /><br />
            <span className="tip">页面未找到</span>
        </div>)
    }
}
export default NotMatch;
