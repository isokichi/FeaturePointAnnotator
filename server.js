var http = require('http');
var ejs  = require('ejs');
var fs   = require('fs');
var path = require('path');
var mime = {
  ".html": "text/html",
  ".ejs":  "text/html",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg"
  // 読み取りたいMIMEタイプはここに追記
};
var image;
var images;
var imgpath;


var http_server = new http.createServer(function(req, res) {

  if (req.method === 'POST') {
    req.data = "";
    // フォームからのデータを受信
    req.on("readable", function() {
        // read()はnullが来る場合もあるので空文字にする
        req.data += req.read() || '';
        // console.log(req.data);
    });
    req.on("end", function() {
      var points = req.data.split(',');
      console.log(points);
      var imgtitle = imgpath.split('.')[0];
      try {
        fs.writeFileSync('./annotation/'+imgtitle+'.txt', imgtitle+'\n', 'utf-8');
      } catch (err) {
        console.log(err);
      }
      for (var i = 0; i < points.length; i++) {
        if (i % 2 == 0) {
          try {
            fs.appendFileSync('./annotation/'+imgtitle+'.txt', points[i]+' , ', 'utf-8');
          } catch (err) {
            console.log(err);
          }
        }else {
          try {
            fs.appendFileSync('./annotation/'+imgtitle+'.txt', points[i]+'\n', 'utf-8');
          } catch (err) {
            console.log(err);
          }
        }
      }
      //アノテーションしたファイルをコピー
      try {
        fs.copyFileSync('./UnannotatedImage/'+imgpath, './AnnotatedImage/'+imgpath);
        console.log('copyed');
      } catch (err) {
        console.log(err);
      }
      // デリート
      try {
        fs.unlinkSync('./UnannotatedImage/'+imgpath);
        console.log('deleted');
      } catch (err) {
        console.log(err);
      }


    });
  }else if (req.url == '/') {
    filePath = '/main.ejs';
    var fullPath = __dirname + filePath;
    try {
      var template = fs.readFileSync(fullPath, 'utf-8');
    } catch (err) {
      console.log(err);
    }
    try {
      var images = fs.readdirSync('./UnannotatedImage');
    } catch (err) {
      console.log(err);
    }
    imgpath = images[Math.floor(Math.random() * images.length)];
    console.log(imgpath);

    var data = ejs.render(template, {
      imgpath : "UnannotatedImage/" + imgpath
    });
    res.writeHead(200, {"Content-Type": mime[path.extname(fullPath)] || "text/plain"});
    res.write(data);
    res.end();

  } else if (req.url.match(/[^.]+$/) == "jpeg" || req.url.match(/[^.]+$/) == "jpg") {
    filePath = req.url;
    var fullPath = __dirname + filePath;
    res.writeHead(200, {'Content-Type': 'image/jpeg; charset=utf-8'});
    try {
      var image = fs.readFileSync(fullPath, "binary"); // ← ファイルpathはその環境に合わせてください
      res.end(image, "binary");
    } catch (err) {
      console.log(err);
    }

  } else {
    filePath = req.url;
    var fullPath = __dirname + filePath;
    try {
      var template = fs.readFileSync(fullPath, 'utf-8');
      var data = ejs.render(template, {
        imgpath : "UnannotatedImage/" + imgpath
      });
      res.writeHead(200, {"Content-Type": mime[path.extname(fullPath)] || "text/plain"});
      res.write(data);
      res.end();
    } catch (err) {
      // console.log(err);
    }
  }
}).listen(3000);
console.log('Server running at http://localhost:3000/');
