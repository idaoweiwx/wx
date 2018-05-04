import React, { Component } from "react";
import "./index.less";
//计算根节点HTML的字体大小
const resizeRoot = () => {
    var deviceWidth = document.documentElement.clientWidth,
        num = 750,
        num1 = num / 100;
    if (deviceWidth > num) {
        deviceWidth = num;
    }
    document.documentElement.style.fontSize = deviceWidth / num1 + "px";
}
//根节点HTML的字体大小初始化
resizeRoot();

window.onresize = function () {
    resizeRoot();
};

class ScrollWrapSwipeout extends Component {
    state = {

    }
    componentDidMount() {
        let scrollWrap = this.refs["scrollWrap"];
        let swipeX = false;
        let swipeY = false;
        let X = 0;
        let x = 0;
        let Y = 0;
        let y = 0;
        scrollWrap.addEventListener('touchstart', function (event) {
            x = event.changedTouches[0].pageX;
            y = event.changedTouches[0].pageY;
            swipeX = true;
            swipeY = true;
        })
        scrollWrap.addEventListener('touchmove', (event) => {
            X = event.changedTouches[0].pageX;
            Y = event.changedTouches[0].pageY;
            // 左右滑动
            if (swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0) {
                // 阻止事件冒泡
                event.stopPropagation();
                if (X - x > 10) {   //右滑
                    event.preventDefault();
                    scrollWrap.className = "scrollWrap";    //右滑收起
                }
                if (x - X > 10) {   //左滑
                    event.preventDefault();
                    let swipeleft = getclass("swipeleft");
                    let len = swipeleft.length;
                    for (let i = 0; i < len; i++) {
                        swipeleft[i].className = "scrollWrap";
                    }
                    scrollWrap.className = "scrollWrap swipeleft";   //左滑展开
                }
                swipeY = false;
            }
            // 上下滑动
            if (swipeY && Math.abs(X - x) - Math.abs(Y - y) < 0) {
                swipeX = false;
            }
        });

        //计算删除按钮的高度
        let height = this.refs["scrollconnect"].offsetHeight;
        this.refs["scrolldel"].style.height = height + "px";
        this.refs["scrolldel"].style.lineHeight = height + "px";
    }
    delCallback = () => {
        let params = this.props.arguments ? this.props.arguments : null;
        if (typeof (this.props.del) === "function") {
            this.props.del(...params);
        }
        //所有归原
        let swipeleft = getclass("swipeleft");
        let len = swipeleft.length;
        for (let i = 0; i < len; i++) {
            swipeleft[i].className = "scrollWrap";
        }
    }
    render() {
        return (<div style={{ "overflow": "hidden" }}>
            <div ref="scrollWrap" className="scrollWrap">
                <div className="scrollitem">
                    <div ref="scrollconnect" className="scrollconnect">
                        <div>
                            {
                                this.props.children
                            }
                        </div>
                        <i ref="scrolldel" className="scrolldel" onClick={this.delCallback}>删除</i>
                    </div>
                </div>
            </div></div>)
    }
}
const getclass = (classn) => {//创建函数 传入形参
    if (!document.getElementsByClassName) {//判断document.getElementsByClassName方法是否支持
        var list = document.getElementsByTagName("*");//先取得所有的dom标签元素
        //              alert(list.length)
        var temp = [];//创建临时数组
        for (var i = 0; i < list.length; i++) {//循环每一个dom元素
            if (list[i].className === classn) {//判断当前这个元素的class名称是否等于box
                temp.push(list[i])//如果等于，将该元素添加到数组中去
            }

        }
        return temp;//；返回给函数
    }
    else {

        return document.getElementsByClassName(classn);
    }
}


export { ScrollWrapSwipeout };