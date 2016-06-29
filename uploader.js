var _ = function(options) {
	var files = [];
	var maxSize = 10;
	var fileInput = null;
	var uploadUrl = null;
	var httpRequest = null;
	this.chunkSize = 100000;
	this.onUploadDone;
	this.onUploadBegin;
	this.onUploading;

    this.support = ( (typeof(File) !== 'undefined') && 
    	(typeof(Blob) !== 'undefined') && 
    	(typeof(FileList) !== 'undefined') && 
    	(!!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice || !!Blob.prototype.slice || false) );

    if(!this.support) {
    	alert('Browser not support blob file upload');
    	return(false);
    }

	if(!options.uploadUrl) {
		alert('Upload url is required');
		return;
	}
	uploadUrl = options.uploadUrl.trim();

	if(!options.fileInput) {
		alert('File input is required');
		return;
	}
	if(options.chunkSize && typeof options.chunkSize === 'number') {
		this.chunkSize = options.chunkSize;
	}

	fileInput = typeof options.fileInput === 'string'? document.getElementById(options.fileInput) : fileInput;
	var parentNode = fileInput.parentNode;
	var newNode = document.createElement('label');
	newNode.setAttribute('class', 'iptFile');
	parentNode.replaceChild(newNode, fileInput);
	newNode.appendChild(fileInput);
	newNode.appendChild(document.createTextNode('Upload file'));

	this.getFiles = function() {
		return files;
	};

	this.getMaxSize = function() {
		return maxSize;
	};

	this.getFileInput = function() {
		return fileInput;
	};

	this.setFileInput = function(node) {
		fileInput.parentNode.replaceChild(node, fileInput);
		fileInput = node;
	};

	this.getUploadUrl = function() {
		return uploadUrl;
	};

	this.getHttpRequest = function() {
		if(this.httpRequest) {
			return httpRequest;
		}
		return new XMLHttpRequest();
	};

	this.getFileInput().parentNode.addEventListener('change', (e) => {
		files = (e.target || e.srcElement).files;
		var  ele = this.getFileInput();
		ele.nextSibling.nodeValue = files[0].name;
		ele.parentNode.removeAttribute('title');
		ele.parentNode.classList.remove('failed');
		this._uploading();
		this.readFile();
	});

	return this;
};

//获取唯一的文件id---
_.prototype.getFileId = function() {
	var S4 = function() {
		return ((( 1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);   
	};
	return ( S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());   
};

//发送文件到服务器----
_.prototype.upload = function(blob, options, cb) {
	var xhr = this.getHttpRequest();
  	xhr.open('POST', this.getUploadUrl(), true);
	xhr.setRequestHeader('myheader', encodeURIComponent(options.fileName + ';' + options.endFlag));
  	xhr.onload = (e) => {
  		// console.log('\n upload complete:', e);
  		cb();
  	};
  	xhr.onerror = (e) => {
  		this._setFailed(xhr.statusText || 'Something error on server.');
  	};
  	xhr.ontimeout = (e) => {
  		this._setFailed('Request time out');
  	};

  	xhr.send(blob);
};

_.prototype._setFailed = function(reason) {
	var ele = this.getFileInput();
	ele.nextSibling.nodeValue = this.getFiles()[0].name;
	var parentNode = ele.parentNode;
	parentNode.classList.add('failed');
	parentNode.classList.remove('on');
	parentNode.setAttribute('title', reason);
	//重置input，可以重新选择相同文件，触发change事件---
	this.setFileInput(ele.cloneNode());
};

//上传过程中，设置百分比
_.prototype._setPercent = function(percent) {
	this.getFileInput().nextSibling.nodeValue = percent? percent + '%' : this.getFiles()[0].name;
	percent && this.onUploading && this.onUploading(percent);
};

//上传开始
_.prototype._uploading = function() {
	this.getFileInput().parentNode.classList.add('on');
	this.onUploadBegin && this.onUploadBegin();
};

//上传完成时----
_.prototype._uploadDone = function() {
	this._setPercent();
	this.getFileInput().parentNode.classList.remove('on');
    this.onUploadDone && this.onUploadDone(this.getFiles()[0]);
};

//分片读取文件----
_.prototype.readFile = function() {
	var files = this.getFiles();
	if(!files || !files.length) {
		return;
	}

	var url = this.getUploadUrl();
	if(!url) {
		return;
	}

	var chunkSize = this.chunkSize;
    var reader = new FileReader();
    var file = files[0];

    var size = file.size;
    var start = 0;
    if(chunkSize > size) {
    	chunkSize = size;
    }
    var fileId = this.getFileId() + '_' + new Date().getTime() + '_';
    var options = {
    	fileName: fileId + file.name
    }

    ;(function(self) {
    	if(start >= size) {
    		self._uploadDone();
    		return;
    	}
    	var blob = file.slice(start, start + chunkSize);
    	var callee = arguments.callee;
    	start += chunkSize;
    	if(start >= size) {
    		options.endFlag = true;
    	}
    	var percent = Math.floor((start - chunkSize / 2.0) * 100 / size);
    	self._setPercent(percent);
    	self.upload(blob, options, function() {
    		percent = parseInt(start * 100 / size);
    		self._setPercent(percent);
    		callee.call(self, self);
    	});
    })(this);
};

var Uploader = _;
