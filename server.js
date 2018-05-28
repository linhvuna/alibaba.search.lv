const http = require('http');

const hostname = '127.0.0.1';
const port = 8080;
const { parse } = require('querystring');
var formidable = require('formidable');
var accessKey = "LTAIuYFM3COHyshm";
var secretKey = "F9Uddh0NNtbukhS6bPn7VnvXanbUAD";
var aliUri = "http://imagesearch.ap-southeast-1.aliyuncs.com/";

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
        var form = new formidable.IncomingForm();
    	form.parse(req, function (err, fields, files) {
    		searchImage(files.photo, res);
    	});
    } 
    else {
        res.end(`
            <!doctype html>
            <html>
            <body>
                <form action="fileupload" method="post" enctype="multipart/form-data">
                    <input type="file" name="photo" /><br />
                    <button>Search</button>
                </form>
            </body>
            </html>
        `);
    }

});

server.listen(process.env.PORT || 3000, function() {
  console.log('Listening on http://localhost:' + (process.env.PORT || 3000));
});


function searchImage(file, res) {

	var Client = require("@alicloud/imagesearch-2018-01-20");
	var client = new Client({
  		accessKeyId: "LTAIuYFM3COHyshm",
  		accessKeySecret: "F9Uddh0NNtbukhS6bPn7VnvXanbUAD",
  		endpoint: "http://imagesearch.ap-southeast-1.aliyuncs.com/",
  		apiVersion: "2018-01-20"
	});

	var fs = require('fs');
	var fileContent = fs.readFileSync(file.path).toString("base64");
	var requestBody = buildRequestBody(fileContent);
	client.searchItem({
  		instanceName: "demo",
	}, requestBody).then(function (value) {
  		var html = parseResult(value);
  		res.end(html);
	}).catch(function (err) {
  		console.log("Error Message: ", err);
	});

}

function parseResult(result) {
	var util = require( "util" );
	var src = "<img src='http://sits-pod43.demandware.net/dw/image/v2/AANC_STG/on/demandware.static/-/Sites-MHJ_Master/default/dw06e2ea14/hi-res/%s?sw=224&sh=224&sm=fit' />";
	var auctions = result.Auctions.Auction;
	var html = [];
	html.push("<ul>");

	for(var i = 0; i < auctions.length; i++) {
		var auction = auctions[i];
		html.push("<li>");
		html.push(util.format(src, auction.PicName));
		html.push("</li>");
	}
	
	html.push("</ul>");
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





