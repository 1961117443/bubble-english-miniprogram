import Vue from 'vue'
import api from './common/request/http'
import App from './App'

Vue.config.productionTip = false

Vue.prototype.$api = api;
Vue.prototype.$site = 1;

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
