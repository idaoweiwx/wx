import * as React from "react"
import "./index.less"
import { Toast, Button,InputItem,WingBlank} from 'antd-mobile';
import logo from "./logo.png";
import { fetchObjToString } from "./../fetch/index"
import Global from "./../config/globla"
import CheckImg from "./checkImg"
class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            password: ""
        };
    }
    loginIn = () => {
        let url = Global.PATHNAME + "comp/user.do?login";
        console.log(url);
        console.log(this.refs);
        let params = {
            "username": this.refs.username.state.value,
            "password": this.refs.password.state.value
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
            console.log(JSON.parse(res));
            let json = JSON.parse(res);
            if (json.result === 3) {
                let firstActionUrlPath = json.data.firstActionUrl;
                document.cookie = ("firstUrl=" + escape(firstActionUrlPath));
                Toast.success(json.message);
                window.location.href  = window.location.origin + window.location.pathname + "#/index"
            } else {
                Toast.error(json.message);
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    render() {
        return (
            <div className="loginPage">
                <WingBlank size='md'>
                    <ul className="login-list">
                        <li className="logo">
                            <img alt="logo" src={logo} />
                            <span>智能数字化运营</span>
                        </li>
                        <li>
                            <InputItem
                                placeholder="Enter your username"
                                clear="true"
                                ref="username"
                                style={{ "width": "100%" }}
                            />
                        </li>
                        <li>
                            <InputItem
                                type="password"
                                clear="true"
                                placeholder="Enter your password"
                                ref="password"
                                style={{ "width": "100%" }}
                            />
                        </li>
                        <li>
                            <CheckImg />
                        </li>
                        <li className="login-in">
                            <Button type="primary" style={{ width: "100%" }} onClick={this.loginIn}>
                                登录
                            </Button>
                        </li>
                    </ul>
                </WingBlank>
            </div>
        );
    }
}

export default LoginPage;