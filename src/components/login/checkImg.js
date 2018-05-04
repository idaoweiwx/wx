import * as React from 'react'
import right from './right-o.svg'
import {Toast} from 'antd-mobile'
import wBg from './w.jpeg'
import "./checkImg.less"
let width = document.body.clientWidth || document.documentElement.clientWidth;

class CheckImg extends React.Component {
  state = {
    leftS: 0,
    canvasBlockLeft: -2000,
    leftWidth: 0
  };

  componentDidMount () {
    this.init();
  }

  init () {
    let a = Math.random() * width;
    a = a > width - 100 ? width - 100 : a < 100 ? 100 : a;
    let x = a, y = 40, w = 42, r = 10, PI = Math.PI;
    let canvas = document.getElementById('canvas');
    let block = document.getElementById('block');
    let canvas_ctx = canvas.getContext('2d');
    let block_ctx = block.getContext('2d');
    let img = document.createElement('img');
    img.src = wBg;
    img.onload = () => {
      canvas_ctx.drawImage(img, 0, 0, width, 200);
      block_ctx.drawImage(img, 0, 0, width, 200);
    };


    draw(canvas_ctx, 'fill');
    draw(block_ctx, 'clip');

    function draw (ctx, option) {
      ctx.beginPath();
      ctx.strokeStyle = '#999';
      ctx.moveTo(x, y);
      ctx.lineTo(x + w / 2, y);

      ctx.lineTo(x + w / 2, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + w / 2);
      ctx.arc(x + w + r - 2, y + w / 2, r, 0, 2 * PI);

      ctx.lineTo(x + w, y + w / 2);
      ctx.lineTo(x + w, y + w);
      ctx.lineTo(x, y + w);
      ctx.lineTo(x, y);
      ctx.arc(x + w / 2, y - r + 2, r, 0, 2 * PI);
      ctx.fillStyle = '#fff';

      ctx[option]();
      ctx.beginPath();
      ctx.arc(x, y + w / 2, r, 1.5 * PI, 0.5 * PI); // 只需要画正方形内的半圆就行，方便背景图片的裁剪
      ctx.globalCompositeOperation = "xor";
      ctx.fill();
      ctx.stroke();

    }

    this.setState({canvasBlockLeft: -a, leftWidth: a})
  }

  moveStart = (e) => {
    this.pageX = e.touches[0].pageX;
  };
  move = (e) => {
    let {leftWidth} = this.state;
    let pageX = e.touches[0].pageX;
    let long = pageX - this.pageX;
    let leftS = long < 0 ? 0 : long > width - 50 ? width - 50 : long;
    this.setState({leftS, canvasBlockLeft: leftS - leftWidth});
  };
  moveEnd = () => {
    let {leftS, leftWidth} = this.state;
    const flag = leftS - leftWidth;
    if (1 > flag && flag > -1) {
      Toast.success('验证通过', 1.5);
    } else {
      Toast.fail('验证失败', 1.5);
      this.setState({leftS: 0, canvasBlockLeft: -leftWidth});
      this.pageX = 0;
    }
  };

  render () {
    const {leftS, canvasBlockLeft} = this.state;
    return (
      <div className={'check_img'}>
        <div className="content_">
          <canvas width={width} height="155" id="canvas">

          </canvas>
          <canvas
            style={{left: canvasBlockLeft}}
            width={width} height="155" id="block">

          </canvas>
        </div>

        <div className="btn_move">
          <div
            style={{left: leftS}}
            onTouchStart={this.moveStart}
            onTouchMove={this.move}
            onTouchEnd={this.moveEnd}
          >
            <img src={right} alt=""/>
          </div>
        </div>
      </div>
    )

  }
}

export default CheckImg