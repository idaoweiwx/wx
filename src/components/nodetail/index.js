import React, { Component } from "react"
import { Button } from "antd-mobile"
import { Content, Footer } from "./../common/common"
class NoDetail extends Component {
    state = {
        "mobile": false
    }
    componentDidMount() {

    }
    render() {
        if (this.state.mobile) {
            return (<div>手机端的东西</div>)
        } else {
            return (<div>pc的东西</div>)
        }

    }
}

export default NoDetail;