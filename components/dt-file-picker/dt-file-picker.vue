<template>
	<view class="dt-file-picker">
		<uni-file-picker 
			ref="files"
			:value="fileData" 
			:limit="limit" 
			:file-mediatype="mediaType" 
			:file-extname="exts"
			:auto-upload="true"
			@select="handleBefore"
			@progress="handleProgress"
			@success="handleSuccess"
			@fail="handleFail"
			@delete="handleDelete">
		</uni-file-picker>
	</view>
</template>

<script>
	export default {
		name: 'dt-file-picker',
		props: {
			//绑定值
			value: {
				type: [Array, String],
				default: [],
			},
			//上传地址
			action: {
				type: String,
				default: '/upload',
			},
			//上传类型：image/album/attach/file
			type: {
				type: String,
				default: 'image',
			},
			//文件大小
			size: {
				type: Number,
				default: 2048,
			},
			//最多件数
			limit: {
				type: Number,
				default: 1,
			},
			//限制扩展名
			exts: {
				type: String,
				default: 'jpg,jpeg,png,gif,bmp',
			},
			//是否水印
			water: {
				type: Number,
				default: 0,
			},
			//是否生成缩略图
			thumb: {
				type: Number,
				default: 0,
			},
		},
		data() {
			return {
				mediaType: "image",
				fileData: [],
			};
		},
		watch: {
			value(newVal) {
				let _this = this;
				_this.fileData = [];
				if(Array.isArray(newVal)){
					newVal.map(file => {
						if(_this.type=='album'){
							file.name = file.originalPath.substring(file.originalPath.lastIndexOf("/")+1);
							file.extname = file.originalPath.substring(file.originalPath.lastIndexOf(".")+1);
							file.url = _this.$api.loadFile(file.thumbPath);;
						}else{
							file.name = file.fileName;
							file.extname = file.fileExt;
							file.url = _this.$api.loadFile(file.filePath);
						}
						_this.fileData.push(file);
					});
				}else{
					_this.fileData.push({
						name: newVal.substring(newVal.lastIndexOf("/")+1),
						extname: newVal.substring(newVal.lastIndexOf(".")+1),
						url: _this.$api.loadFile(newVal)
					});
				}
			},
		},
		created() {
			if(this.type=="attach"||this.type=="file"){
				this.mediaType="all";
			}else if(this.type=="image"||this.type=="album"){
				this.mediaType="image";
			}else{
				this.mediaType=this.type;
			}
		},
		methods: {
			handleBefore(e){
				let _this = this;
				//检查文件大小
				/*let fileSize = e.tempFiles.find(val => val.size>_this.size*1024);
				if(fileSize){
					_this.$api.msg(`文件超过了${_this.size}KB`,1500,false,'error');
					_this.$refs.files.clearFiles();
					return;
				}*/
				//console.log(_this.$refs.files.files)
				//开始上传
				e.tempFiles.map(async file => {
					await _this.$api.request({
						url: `${_this.action}?thumb=${_this.thumb}&water=${_this.water}`,
						method: "file",
						data:{filePath: file.path},
					}).then(res=>{
						const fileList = JSON.parse(res.data);
						if(_this.type=='album'){
							let albumList=_this.value;
							albumList.push({
								thumbPath: fileList[0].thumbPath[0],
								originalPath: fileList[0].filePath
							});
							_this.$emit("input", albumList);
						}else if(_this.type=='attach'){
							let attachList=_this.value;
							attachList.push({
								fileName: fileList[0].fileName,
								filePath: fileList[0].filePath,
								fileSize: fileList[0].fileSize,
								fileExt: fileList[0].fileExt,
								downCount: 0
							});
							_this.$emit("input", attachList);
						}else{
							_this.$emit("input", fileList[0].filePath);
						}
					});
				});
				
			},
			handleProgress(e){
				console.log('上传进度:');
				console.log(e);
			},
			handleSuccess(e){
				console.log('上传成功:');
				console.log(e);
			},
			handleFail(e){
				console.log('上传失败:');
				console.log(e);
			},
			handleDelete(e){
				let _this = this;
				//console.log(e);
				let index = _this.fileData.indexOf(e.tempFile);
				if(index>=0){
					_this.fileData.splice(index, 1);
					_this.$emit("input", _this.fileData);
				}
				
			},
		}
	}
</script>

<style lang="scss">
	
</style>