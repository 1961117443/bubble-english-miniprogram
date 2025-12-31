import http from './config'

// 是否正在刷新的标记
let isRefreshing = false;
// 重试队列，每一项将是一个待执行的函数形式
let requests = [];

module.exports = {
	//统一提示
	msg: (title, duration=1500, mask=false, icon='none') => {
		if(Boolean(title) === false){
			return;
		}
		uni.showToast({
			title,
			duration,
			mask,
			icon
		});
	},
	//返回上一页
	prePage: () => {
		let pages = getCurrentPages();
		let prePage = pages[pages.length - 2];
		// #ifdef H5
		return prePage;
		// #endif
		return prePage.$vm;
	},
	//文件地址拼接
	loadFile: (url) => {
		if(!url) return;
		if(!url.startsWith("/")) return url;
		return http.config.baseUrl + url;
	},
	//保存文件
	saveFile: (url, fileName, success) => {
		//#ifdef H5
	    const dA = document.createElement("a");
	    dA.download = fileName; // 设置下载的文件名，默认是'下载'
	    dA.href = url;
	    document.body.appendChild(dA);
	    dA.click();
	    dA.remove(); // 下载之后把创建的元素删除
		success(); //运行回调
		//#endif
		
		//#ifndef H5
		uni.saveFile({
			tempFilePath: url,
			success: (res) => {
				success(res); //运行回调
			}
		});
		//#endif
	},
	//替换HTML
	replaceHtml: (val) =>{
		if(!val) return;
		let newContent = val.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
			if (capture.substring(0, 4).toLowerCase() != 'http') {
				match = match.replace(capture, http.config.baseUrl + capture);
			}
			//return match.replace('<img','<image')+'</image>';
			return match.replace(/\<img/gi, '<img style="width:100%;" ');
		});
		return newContent;
	},
	//请求API
	request: (params) => {
		let url = params.url;
		//设置请求前拦截器
		http.interceptor.request = (config) => {
			let token = uni.getStorageSync("qtmall_client_token");
			//显示加载动画
			if (params.loading) {
				uni.showLoading({
					title:'加载中'
				})
			}
			if (token.accessToken) {
				config.header.Authorization = 'Bearer ' + token.accessToken
			}
		}
		//设置请求结束后拦截器
		http.interceptor.response = async (response) => {
			if (params.loading) uni.hideLoading(); //关闭加载效果
			const statusCode = response.statusCode;
			//401:accessToken过期需要刷新
			if(statusCode === 401 && (!response.data || response.header['token-expired'])){
				return response.data = await doRequest(response, url)
			}
			//401:没有权限
			else if(statusCode === 401 && response.data.code === 10001){
				uni.showToast({
					title: '没有操作权限',
					icon: 'none',
					duration: 2000
				})
				return
			}
			//403:失效需重新登录
			else if(statusCode === 403 || statusCode === 401){
				//清除store的token
				//uni.removeStorageSync('qtmall_client_token');
				uni.showModal({
					title: "登录过期",
					content: '请重新登录账户',
					showCancel: false,
					success(e) {
						uni.navigateTo({
							url: '/pages/account/login'
						})
					}
				});
				return
			}
			else if(statusCode === 405){
				uni.showModal({
					title: "温馨提示",
					content: "请求与接口要求不一致，请检查重试",
					showCancel: false
				});
				return
			}
			//422:数据验证未通过
			else if(statusCode === 422){
				uni.showToast({
					title: response.data.message[0][0],
					icon: 'none',
					duration: 2000
				})
				return
			}
			//成功状态
			else if (statusCode === 200 || statusCode === 204 || statusCode === 404) {
				return response
			}
			//其它错误
			else {
				uni.showModal({
					title: "温馨提示",
					content: typeof (response.data) != "undefined" ? response.data.message : response,
					showCancel: false
				});
				return
			}
		}
		return http.request(params);
	},
}

//刷新token并继续之前请求
async function doRequest(response, url) {
	console.log('开始刷新Token'+url)
	let token = uni.getStorageSync("qtmall_client_token");
	const res = await module.exports.request({
		url: '/auth/retoken',
		method: 'post',
		data: {'refreshToken': token.refreshToken?token.refreshToken:''}
	});
	if(res && res.data.accessToken) {
		let config = response.config;
		let newToken = { 'accessToken' : res.data.accessToken, 'refreshToken' : res.data.refreshToken };
		uni.setStorageSync('qtmall_client_token', newToken);
		config.header.Authorization = 'Bearer ' + res.data.accessToken;
		var postData = {
			url: url,
			data: config.data,
			method: config.method
		}
		const resold = await module.exports.request(postData);
		return resold;
	}
}