const http = require('http');

const hostname = '127.0.0.1';
const port = 8080;
const { parse } = require('querystring');
var formidable = require('formidable');
var accessKey = "LTAIuYFM3COHyshm";
var secretKey = "F9Uddh0NNtbukhS6bPn7VnvXanbUAD";
var aliUri = "http://imagesearch.ap-southeast-1.aliyuncs.com/";

const server = http.createServer((req, res) => {
  req.setTimeout(600000);
  var url = require('url') ;
  var queryObject = url.parse(req.url,true).query;
  var imageId = queryObject.image;
  var imageId2 = queryObject.img;
  if (imageId) {
    return searchImage(res, imageId);
  }
  if(imageId2) {
    return searchImage2(res, imageId2);
  }
  else {    
    res.end("No image found...");
  }
});

server.timeout = 600000;

server.listen(process.env.PORT || 3000, function() {
  console.log('Listening on http://localhost:' + (process.env.PORT || 3000));
});

function searchImage2 (res, imageId) {
  /*ohzDISz7GWPqSiOonArnWmbeXV5NWvgDVteCVSeTSM*/
  var path = "http://amblique10-alliance-prtnr-hk02-dw.demandware.net/on/demandware.static/-/Sites-apparel-catalog/default/dw23ff9d7c/images/ali/" + imageId;
  
  var request = http.get(path, function(response) {
    var buffers = [];
    response.on('data', function(buffer) {
      buffers.push(buffer);
    });

    response.on('end', function() {
      var buffer = Buffer.concat(buffers);
      var fileContent = buffer.toString("base64");
      callAlibabaSearchImage2(fileContent, res);     
    });
  });
  request.setTimeout(600000);
}

function searchImage (res, imageId) {
  /*ohzDISz7GWPqSiOonArnWmbeXV5NWvgDVteCVSeTSM*/
  var path = "http://amblique10-alliance-prtnr-hk02-dw.demandware.net/on/demandware.static/-/Sites-apparel-catalog/default/dw23ff9d7c/images/ali/" + imageId;
  
  var request = http.get(path, function(response) {
    var buffers = [];
    response.on('data', function(buffer) {
      buffers.push(buffer);
    });

    response.on('end', function() {
      var buffer = Buffer.concat(buffers);
      var fileContent = buffer.toString("base64");
      callAlibabaSearchImage(fileContent, res);     
    });
  });
  request.setTimeout(600000);
}

function callAlibabaSearchImage(fileContent, res) {

	var Client = require("@alicloud/imagesearch-2018-01-20");
	var client = new Client({
  		accessKeyId: "LTAIuYFM3COHyshm",
  		accessKeySecret: "F9Uddh0NNtbukhS6bPn7VnvXanbUAD",
  		endpoint: "http://imagesearch.ap-southeast-1.aliyuncs.com/",
  		apiVersion: "2018-01-20"
	});

	var requestBody = buildRequestBody(fileContent);
	client.searchItem({
  		instanceName: "demo",
	}, requestBody, {}, {timeout:600000}).then(function (value) {
  		var html = parseResult(value);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  		res.end(html);
	}).catch(function (err) {
  		console.log("Error Message: ", err);
      res.end(err);
	});

}

function callAlibabaSearchImage2(fileContent, res) {

	var Client = require("@alicloud/imagesearch-2018-01-20");
	var client = new Client({
  		accessKeyId: "LTAIuYFM3COHyshm",
  		accessKeySecret: "F9Uddh0NNtbukhS6bPn7VnvXanbUAD",
  		endpoint: "http://imagesearch.ap-southeast-1.aliyuncs.com/",
  		apiVersion: "2018-01-20"
	});

	var requestBody = buildRequestBody(fileContent);
	client.searchItem({
  		instanceName: "demo",
	}, requestBody, {}, {timeout:600000}).then(function (value) {
  		var html = parseResult2(value);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  		res.end(html);
	}).catch(function (err) {
  		console.log("Error Message: ", err);
      res.end(err);
	});

}

function parseResult2(result) {
	var util = require( "util" );
	
  var html = [];
  
  if (!result.Auctions || !result.Auctions.Auction)
    return JSON.stringify(html);
  
  var auctions = result.Auctions.Auction;
	

	for(var i = 0; i < auctions.length; i++) {
		var auction = auctions[i];
		
		html.push(auction.PicName.replace('.jpg', ''));
	
	}
	
  return JSON.stringify(html);
}

function parseResult(result) {
	var util = require( "util" );
	var src = "<img src='http://sits-pod43.demandware.net/dw/image/v2/AANC_STG/on/demandware.static/-/Sites-MHJ_Master/default/dw06e2ea14/hi-res/%s?sw=224&sh=224&sm=fit' />";
	
  var html = [];
  html.push("<html>");
  if (!result.Auctions || !result.Auctions.Auction)
    return "<p>No image found.</p>";
  
  var auctions = result.Auctions.Auction;
	html.push("<ul>");

	for(var i = 0; i < auctions.length; i++) {
		var auction = auctions[i];
		html.push("<li>");
		html.push(util.format(src, auction.PicName));
		html.push("</li>");
	}
	
  html.push("</ul>");
  html.push("</html>");
	return html.join("");
}

function buildRequestBody(fileContent) {
	var instanceName = "demo";
	var start = 0; 
	var num = 10;
	var catId = "88888888";

	var picContent = fileContent;



	var params = {};
	params.s = start + "";
	params.n = num + "";
	if (!!catId) {
	params.cat_id = catId + "";
	}
	var picName = new Buffer("searchPic").toString("base64");
	params.pic_list = picName;
	params[picName] = picContent;
	var result = buildContent(params);
	return result;
  	
}

var buildContent = function (params) {
  var meta = "";
  var body = "";
  var start = 0;
  Object.keys(params).forEach(function (key) {
    if (meta.length > 0) {
      meta += "#";
    }
    meta += key +"," + start + "," + (start + params[key].toString().length);
    body += params[key];
    start += params[key].length;
  })
  return meta + "^" + body;
}





