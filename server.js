// 为了搭建服务器 要使用http模块
var http = require("http");
// 为了读取文件 要使用fs模块
var fs = require("fs");
// 为了解决路径问题 使用URL模块
var url = require("url");
// 格式化query数据
var qs = require("querystring");
// 定义MimeType对象
var MT = {
	css: "text/css",
	html: "text/html",
	js: "application/x-javascript",
	jpg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	json: "text/plain",
	svg: "image/svg+xml"
}
// 定义一个数组 充当临时数据库 
var database = [
	{username: "王老五", password: "wanglaowu"}, 
	{username: "张三", password: "zhangsan"}, 
	{username: "李四", password: "lisi"}, 
	{username: "赵六", password: "zhaoliu"}, 
	{username: "罗志祥", password: "xiaozhupeiqi"}
];
// 创建服务器
var server = http.createServer(function(req, res) {
	var obj = url.parse(req.url, true);
	// 配置检测用户名 /checkName接口
	if (obj.pathname === "/checkName" && req.method.toUpperCase() === "GET") {
		// 获取前端提交过来的数据 
		var username = obj.query.username;
		// 设置响应头 给予正确的mimetype和字符集
		res.setHeader("content-type", "text/plain;charset=utf-8");
		// 拿着username去database中检测是否存在
		// 通过some方法判定内部是否有用户名称是username的
		var result = database.some(function(value) {
			return value.username === username;
		})
		if (result) {
			res.end(JSON.stringify({error: 1, data: "抱歉，已经被占用"}));
		} else {
			res.end(JSON.stringify({error: 0, data: "恭喜，可以使用"}));
		}
		return;
	}

	// 匹配登录接口 /login接口
	if (obj.pathname === "/login" && req.method.toUpperCase() === "POST") {
		console.log("这里是post请求，登录接口")
		// 定义变量 用于接收data_chunk
		var str = "";
		// 在这里获取前端AJAX提交过来的数据
		// NodeJS设置了两个事件 用于监听post请求的数据传输
		req.on("data", function(data_chunk) {
			// data事件表示每运输过一段来，就执行一次
			str += data_chunk;
		})
		req.on("end", function() {
			// end事件表示所有数据传输完毕之后执行一次
			var obj = qs.parse(str);
			// 拿着obj.username和obj.password到database中查询数据 如果有就登录成功 如果没有就登录失败
			var result = database.some(function(value) {
				return value.username === obj.username && value.password === obj.password;
			});
			res.setHeader("content-type", "text/plain;charset=utf-8");
			if (result) {
				// 说明有 说明用户名和密码都对 
				res.end(JSON.stringify({
					error: 0,
					data: "登录成功"
				}));
			} else {
				res.end(JSON.stringify({
					error: 1,
					data: "登录失败"
				}));
			}
		})
		return;
	}
	// 确定后缀名称
	// 通过split方法将obj.pathname分割成数组 得到数组的最后意向就得到了后缀名称
	var extName = obj.pathname.split(".").pop();
	// 根据后缀名称生成一个mimetype字符串 
	var pathname = obj.pathname;
	fs.readFile("." + pathname, function(err, data) {
		if (err) {
			res.setHeader("content-type", "text/plain;charset=utf-8");
			res.end("抱歉，您读取的文件" + req.url + "不存在");
			return;
		}
		// 最后 拼接到这里
		res.setHeader("content-type", MT[extName] + ";charset=utf-8");
		res.end(data);
	});
});

// 监听端口号
server.listen(3000);