# html5_file_uploader
基于前端的文件分片传输

A better way to send big file to server. 

纯前端实现的大文件分片传输，使用file api，blob等，0依赖

###使用步骤
1、clone或者下载项目后，运行node server.js启动服务器

2、打开test.html, 选择文件即可上传（建议选择大文件已查看效果)

3、初始化：
   
    var uploader = new Uploader({
		fileInput: 'iptFile',
		uploadUrl: 'http://localhost:3004/upload',
		// chunkSize: 100000
	});
	
	uploader.onUploadDone = function() {
		alert('上传完成');
	};

	uploader.onUploadBegin = function() {
		console.log('文件上传开始:', uploader.getFiles());
	}

	uploader.onUploading = function(percent) {
		console.log('已上传：' + percent + '%');
	}
	
具体请参照：test.html


###开源策略
个人作品，可下载后随意更改，可用于任何途径
