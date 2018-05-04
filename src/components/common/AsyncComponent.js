import React, { Component } from 'react'
import { Spin } from 'antd';
class PageLoading extends Component {
    render() {
        return (<div className="pageLoading">
            {this.props.children}
        </div>)
    }
}
export default function asyncComponent(importComponent) {
    class AsyncComponent extends Component {
        constructor(props) {
            super(props)

            this.state = {
                component: null
            }
        }

        async componentDidMount() {
            const { default: component } = await importComponent()

            this.setState({
                component: component
            })
        }

        render() {
            const C = this.state.component

            return C ? <C {...this.props} /> : <PageLoading ><Spin size="large" /><br /><span style={{"fontSize":"0.32rem"}}>页面正在加载中,请稍等...</span></PageLoading>
        }
    }

    return AsyncComponent
}