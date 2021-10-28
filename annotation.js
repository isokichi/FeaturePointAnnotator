let wrapper;
let canvas;
let ctx;
let img = new Image();
// IMG_PASS = "UnannotatedImage/dogface20211028-1.jpeg"
IMG_PASS = "<%= imgpath %>"

let originX;
let originY;
let mouceX;
let mouseY;
let pointX;
let pointY;
let imgMagnification;

let numOfPoint;
let pointList = [];
let displayListDiv = [];
let displayListX = [];
let displayListY = [];

let targetPoint = 0;

wrapper = document.getElementById("canvas-div");
canvas = document.getElementById("canvas");
displayListDiv = document.getElementsByClassName("points");
displayListX = document.getElementsByClassName("pointvalue-x");
displayListY = document.getElementsByClassName("pointvalue-y");

//イベントリスナーの登録
canvas.addEventListener("mousedown", mouseDownHandler, false);
//キャンバスクリック時の関数
function mouseDownHandler(e) {
  if (targetPoint < numOfPoint) {
    var rect = e.target.getBoundingClientRect();
    mouseX =  e.clientX - originX;
    mouseY =  e.clientY - originY;
    console.log(mouseX+', '+mouseY);
    pointX = mouseX/imgMagnification;
    pointY = mouseY/imgMagnification;
    console.log(pointX+', '+pointY);
    pointList[targetPoint] = [pointX, pointY];
    displayListX[targetPoint].value = pointX;
    displayListY[targetPoint].value = pointY;

    targetPoint++;
    displayImg();
    drowPoints();
    divColorChange();
  }
}
//リストクリックした時の関数
$(document).on('click', 'div.points', function () {
  var index = $('div.points').index(this);
  targetPoint = index;
  // alert(index);
  displayImg();
  drowPoints();
  divColorChange();
});
document.addEventListener("keydown", function (e) {
  if (e.keyCode == 38) {
    if (targetPoint > 0) {
      targetPoint--;
      displayImg();
      drowPoints();
      divColorChange();
    }
  }else if (e.keyCode == 40) {
    if (targetPoint < numOfPoint-1) {
      targetPoint++;
      displayImg();
      drowPoints();
      divColorChange();
    }
  }
});

function changePoint() {
  pointX = displayListX[targetPoint].value
  pointY = displayListY[targetPoint].value
  pointList[targetPoint] = [pointX, pointY];
  displayImg();
  drowPoints();
}

//点を描画する関数
function drowPoints() {
  for (var i = 0; i < pointList.length; i++) {
    if (pointList[i] === undefined || pointList[i] === null) {
      console.log("point"+i+"is undifined")
    }else{
      var x = originX + pointList[i][0] * imgMagnification;
      var y = originY + pointList[i][1] * imgMagnification;

      if (i == targetPoint) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
        ctx.fill() ;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }else{
        ctx.beginPath();
        ctx.arc(x, y, 2, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
        ctx.fill();
      }
    }
  }
}

//リストの色変える関数
function divColorChange() {
  for (var i = 0; i < displayListDiv.length; i++) {
    displayListDiv[i].style.backgroundColor = 'white'
  }
  if (targetPoint < numOfPoint) {
    displayListDiv[targetPoint].style.backgroundColor = 'silver'
  }
}

// サイズ変更時
window.addEventListener("resize", function(){
  changeCanvasSize();
});
//キャンバスサイズを変更して画像を表示する関数
function changeCanvasSize(){
    canvas.width = wrapper.offsetWidth;
    canvas.height =  wrapper.offsetHeight;
    displayImg();
    drowPoints();

}
//画像の描画
function displayImg() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (canvas.width/img.width < canvas.height/img.height) {
    imgMagnification = canvas.width/img.width;
    var imgh = img.height*imgMagnification;
    ctx.drawImage(img, 0, (canvas.height-imgh)/2, canvas.width, imgh);
    originX = 0;
    originY = (canvas.height-imgh)/2;
  }else{
    imgMagnification = canvas.height/img.height;
    var imgw = img.width*imgMagnification;
    ctx.drawImage(img, (canvas.width-imgw)/2, 0, imgw, canvas.height);
    originX = (canvas.width-imgw)/2;
    originY = 0;
  }
}

//point数変更時
function createPointList() {
  numOfPoint = document.getElementById('numOfPoint').value;
  document.getElementById('pointList').innerHTML = "";
  for (var i = 0; i < numOfPoint; i++) {
    document.getElementById('pointList').innerHTML = document.getElementById('pointList').innerHTML + '<div class="points" id="point-'+i+'"><p class="pointlistitem"><input type="text" value="point '+i+'"></p><p class="pointlistitem">x:<input type="number" step="0.01" id ="point-x-'+i+'" class="pointvalue-x" onchange="changePoint()">  y:<input type="number" step="0.01" id ="point-y-'+i+'" class="pointvalue-y" onchange="changePoint()"></p></div>'
  }
  targetPoint = 0;
  divColorChange();
}

// 起動処理
window.addEventListener("load", function(){
  createPointList()
  ctx = canvas.getContext("2d");
  // キャンバスをウインドウサイズにする・画像生成
  img.src = IMG_PASS;
  console.log(img.src)
  img.onload = function(){
    // console.log("imgload")
    changeCanvasSize();
  };
  // console.log("ok")
});

function skipImage() {
  location.reload();
}

function submitPoints() {
  for (var i = 0; i < pointList.length; i++) {
    for (var j = 0; j < pointList[i].length; j++) {
      pointList[i][j] = Math.round(pointList[i][j] * 100) / 100;
    }
  }
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000');
  xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
  var data = pointList;
  xhr.onreadystatechange = function() {
    if(xhr.readyState === 4 && xhr.status === 200) {
      alert( xhr.responseText + "を受け取りました。" );
    }
  }
  xhr.send(data);

  location.reload();
}
