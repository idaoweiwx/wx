import React, { Component } from 'react';
import { Switch, Route} from 'react-router-dom'
import { HashRouter as Router } from 'react-router-dom'
import getHashParameter from "./components/util/getParams"
import Login from "./components/login/index"
import IndexPage from "./components/homepage/index"
import ShopDetail from "./components/homepage/shopDetail"
import Cart from "./components/cart/index.js"
import OrderList from "./components/order/orderList/index"
import OrderDetail from "./components/order/orderDetail/index"
import LogisticsInfo from "./components/LogisticsInfo/index.js"
import Refund from "./components/order/refund/index"

if (getHashParameter("open_id")){
  window.open_id = getHashParameter("open_id");
  window.token = getHashParameter("token");
  window.history.pushState(null, null, `/core/view/wechat/?#/index`);
}

class App extends Component {
  render() {
    return (
      <Router>
        <div style={{height:"100%"}}>
          <Switch>
            <Route path='/cart/index' component={Cart} />
            <Route path='/shop/shopdetail' component={ShopDetail} />
            <Route path='/index' component={IndexPage} />
            <Route path='/order/list' component={OrderList} />
            <Route path='/order/detail' component={OrderDetail} />
            <Route path='/order/logInfo' component={LogisticsInfo} />
            <Route path='/order/refund' component={Refund} />
            <Route path='/' component={Login} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;





