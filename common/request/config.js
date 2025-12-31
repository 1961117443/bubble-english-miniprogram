export default {
	config: {
		baseUrl: process.env.NODE_ENV === "production"? '/api' : 'http://localhost:5200',
		header: {
			'Content-Type':'application/json;charset=UTF-8'
		},  
		data: {},
		method: "get",
		loading: false,
		dataType: "json",
		responseType: "text",
		success() {},
		fail() {},
		complete() {}
	},
	interceptor: {
		request: null,
		response: null
	},
	request(options) {
		if (!options) {
			options = {}
		}
		options.baseUrl = options.baseUrl || this.config.baseUrl
		options.dataType = options.dataType || this.config.dataType
		options.url = options.baseUrl + options.url
		options.data = options.data || {}
		options.loading = options.loading || this.config.loading
		options.method = options.method || this.config.method

		return new Promise((resolve, reject) => {
			let _config = null
			options.complete = (response) => {
				let statusCode = response.statusCode
				response.config = _config
				if (this.interceptor.response) {
					let newResponse = this.interceptor.response(response)
					if (newResponse) {
						response = newResponse
					}
				}
				if (statusCode === 200 || statusCode === 204 || statusCode === 401) {
					resolve(response);
				} else {
					reject(response);
				}
			}
			_config = Object.assign({}, this.config, options)
			_config.requestId = new Date().getTime()
			if (this.interceptor.request) {
				this.interceptor.request(_config)
			}
			//如果是下载则调用下载请求
			if(options.method=='file'){
				delete _config.header['Content-Type'];//删除默认属性
				_config.name="file";
				_config.filePath=options.data.filePath;
				uni.uploadFile(_config);
			}else if(options.method=='download'){
				uni.downloadFile(_config);
			}else{
				uni.request(_config);
			}
		});
	},
	get(url, data, options) {
		if (!options) {
			options = {}
		}
		options.url = url
		options.data = data
		options.method = 'get'  
		return this.request(options)
	},
	post(url, data, options) {
		if (!options) {
			options = {}
		}
		options.url = url
		options.data = data
		options.method = 'post'
		return this.request(options)
	},
	put(url, data, options) {
		if (!options) {
			options = {}
		}
		options.url = url
		options.data = data
		options.method = 'put'
		return this.request(options)
	},
	delete(url, data, options) {
		if (!options) {
			options = {}
		}
		options.url = url
		options.data = data
		options.method = 'delete'
		return this.request(options)
	},
	download(url, options) {
		if (!options) {
			options = {}
		}
		options.url = url
		options.method = 'download'
		return this.request(options)
	},
	file(url, data, options) {
		if (!options) {
			options = {}
		}
		options.url = url
		options.method = 'file'
		return this.request(options)
	}
}