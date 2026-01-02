<script>
	import {
		mapMutations
	} from 'vuex';
	
	export default {
		methods: {
			/*...mapMutations(['login'])*/
		},
		onLaunch: function() {
			/*let userInfo = uni.getStorageSync('userInfo') || '';
			if(userInfo.id){
				//更新登陆状态
				uni.getStorage({
					key: 'userInfo',
					success: (res) => {
						this.login(res.data);
					}
				});
			}*/
		},
		onShow: function() {
			//console.log('App Show')
		},
		onHide: function() {
			//console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import "/common/css/iconfont.css";
	page{
		background: #f5f5f5;
	}
</style>
<style lang="scss">
	/*每个页面公共scss */
	@import "/common/scss/common.scss";
	@import "@/styles/index.scss";
</style>