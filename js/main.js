
const dir = [
  [0, 1], //右
  [1, 0], //下
  [1, 1], //右下
  [1, -1] //左下
];
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

var playerFirstConfi=false;
//var ChessSet = new Array();

var suspectChess = new Chess(canvas.width / 2, canvas.height/2,"black");

const blank=10
const standard=15;
const length = canvas.width - blank*2;
const divi = length / standard;
const left_from = (canvas.width - length)/2
const up_from = (canvas.height - length)/2
const chessr=divi/2-1
const playertag=1;
const aitag=2;
const button_length = 50;
const button_width = 50;
const white_string = "rgb(237, 238, 233)"
const black_string = "rgb(88, 96, 109)"
const ChessSet = new Gomoku(standard, standard);
//var testflag=1;

var step;
var endgame = false;
var prepos=[-1,-1]


class Main {
  constructor() {
    this.Init();
    this.DrawBoard();
    this.ActOnTouch();
    //this.WriteWord(0);
  }
  DrawBoard(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.createButton(left_from, up_from - button_width - blank, button_length, button_width, 3,"重")
    this.createButton(left_from + button_length+blank, up_from -  button_width - blank, button_length, button_width, 3, "悔", "gray")
    ctx.fillStyle = "rgba(250,236,201,1)"; 
    ctx.fillRect(left_from, up_from, length, length);
    ctx.strokeStyle = 'rgba(206,187,154,1)'; 
    ctx.beginPath();
    ctx.lineWidth = 2;
    for (var i = 0; i < standard; i = i + 1) {//竖线
      ctx.moveTo(left_from + divi / 2 + divi * i, up_from + divi / 2)
      ctx.lineTo(left_from + divi / 2 + divi * i, up_from + length - divi / 2)
    }
    ctx.closePath();
    ctx.stroke();  
    ctx.beginPath();
    for (var i = 0; i < standard; i = i + 1) {//横线
      ctx.moveTo(left_from + divi / 2, up_from + divi / 2 + divi * i)
      ctx.lineTo(left_from + length - divi / 2, up_from + divi / 2 + divi * i)
    }
    ctx.closePath();
    ctx.stroke();
    this.WriteStep(step, left_from, up_from-button_width/2+blank/2)
    this.DrawOriginalChess();

  }



  ActOnTouch(){//row=y,col=x
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()
      this.touch = true;
      let player_x = e.touches[0].clientX;
      let player_y = e.touches[0].clientY;
      console.log("x=" + player_x + ",y=" + player_y);
      if (!endgame&&player_x >= left_from && player_x <= left_from + length && player_y >= up_from && player_y <= up_from +length){
        var index = this.Exact(player_x, player_y);
        var temp = this.ChessPostion(index[0], index[1]);
        this.DrawBoard();
        if (!ChessSet.available(index[0], index[1])) return;
        if (!playerFirstConfi || !temp.Equal(suspectChess)){
          this.DrawTempChess(temp);
          playerFirstConfi=true;
          suspectChess = temp;
        }else {
          requestAnimationFrame(() => {

          ChessSet.userPlay(index[0], index[1])
          prepos = index
          console.log("wwwwww"+prepos)
          playerFirstConfi=false;
          this.DrawBoard();
          if (ChessSet.result ===1) {
            //console.log("Write")
            this.WriteWord(1);
            endgame=true;
          }
          console.log("row=" + index[0] + "col=" + index[1]);
          //this.music.playplayer();
          requestAnimationFrame(() => {

          if (!endgame) {
            //var pos = ChessSet.airandomPlay();
            var pos = ChessSet.aiPlay();
            prepos=pos;
            //this.music.playai();
          // console.log("ai::row=" + pos[0] + "col=" + pos[1]);
          var temp = this.ChessPostion(pos[0], pos[1]);
          temp.col = black_string;
          //this.DrawChess(temp);
          step++;
          this.DrawBoard();
          }

          console.log("result=" + ChessSet.result);
          if (ChessSet.result===2){
            //console("Write")
            this.WriteWord(2);
            endgame=true;
          }
          })
        })
        }
      } else if (player_x >= left_from && player_x <= left_from + button_length && player_y >= up_from - button_width - blank && player_y <= up_from - blank){
        //console.log("in");
        step=1;
        ChessSet.reset();
        this.DrawBoard();
        playerFirstConfi=false;
        endgame=false;
        suspectChess = new Chess(canvas.width / 2, canvas.height / 2, black_string);
      } else if (player_x >= left_from + button_length + blank && player_x <= left_from +2* button_length + blank && player_y >= up_from - button_width - blank && player_y <= up_from - blank){
        if(ChessSet.retry()) step--;
        prepos=ChessSet.lastai();
        endgame=false
        this.DrawBoard();
      }
    }))
  }
  Init() {
    step = 1;
    // for (var i = 0; i < 10; i++) {      
    //   ChessSet[i] = new Array(i);
    //   for (var j = 0; j < 10; j++) {
    //     ChessSet[i][j] = 0;
    //   }
    //}
    //this.music = new Music()
  }

  DrawTempChess(che){
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#8F8F8F";
    ctx.arc(che.x, che.y, chessr, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 0;
    ctx.strokeStyle = "white";
  }
  createButton(x1, y1, width, height, radius, word, col = "rgb(177,102,70)") {
    //console.log("draw")
    ctx.lineWidth = 3;
    ctx.strokeStyle = col;
  // 移动到左上角
    ctx.moveTo(x1 + radius, y1);
  // 添加一条连接到右上角的线段
    ctx.lineTo(x1 + width - radius, y1);
  // 添加一段圆弧
    ctx.arcTo(x1 + width, y1, x1 + width, y1 + radius, radius);
  // 添加一条连接到右下角的线段
    ctx.lineTo(x1 + width, y1 + height - radius);
  // 添加一段圆弧
    ctx.arcTo(x1 + width, y1 + height, x1 + width - radius, y1 + height, radius);
  // 添加一条连接到左下角的线段
    ctx.lineTo(x1 + radius, y1 + height);
  // 添加一段圆弧
    ctx.arcTo(x1, y1 + height, x1, y1 + height - radius, radius);
  // 添加一条连接到左上角的线段
    ctx.lineTo(x1, y1 + radius);
  // 添加一段圆弧
    ctx.arcTo(x1, y1, x1 + radius, y1, radius);
    //ctx.fillStyle ="#98FB98";
    //ctx.fill();
    ctx.fillStyle = "rgb(130,187,255)"
    ctx.font = "40px normal"
    ctx.fillText(
      word,
      x1 + width/2-20,
      y1 + height/2+13
    )
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 0;
}
  DrawChess(che){
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.arc(che.x, che.y, chessr, 0, 2 * Math.PI);
    ctx.fillStyle = che.col;
    ctx.strokestyle ="#8F8F8F";
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.strokestyle="#000000";
    ctx.lineWidth = 0;
  }
  Exact(x,y){
    var col=0;
    for (var i = 0; i < standard; i = i + 1) {
      if (Math.abs(x - (left_from + divi / 2 + divi * i)) <= Math.abs(x - (left_from + divi / 2 + divi * col))) {
        col = i;
      }
    }
    var row=0;
    for (var j = 0; j < standard; j = j + 1) {
      if (Math.abs(y - (up_from + divi / 2 + divi * j)) <= Math.abs(y - (up_from + divi / 2 + divi * row))) {
        row=j;
      }
    }
    //  console.log("row="+row+"col="+col);
    return [row,col];
  }
  ChessPostion(i,j){
    return new Chess(left_from + divi / 2 + divi * j, up_from + divi / 2 + divi * i, white_string);
  }
  DrawOriginalChess(){
    for(var i=0;i<standard;i++){
      for (var j = 0; j < standard;j++){
        if (ChessSet._board[i][j] === playertag){
          var temp = this.ChessPostion(i, j);
          temp.col = white_string;
          this.DrawChess(temp);
          if (i == prepos[0] && j == prepos[1]) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(temp.x - chessr / 2, temp.y)
            ctx.lineTo(temp.x + chessr / 2, temp.y)
            ctx.moveTo(temp.x, temp.y - chessr / 2)
            ctx.lineTo(temp.x, temp.y + chessr / 2)
            ctx.stroke();
            ctx.closepath
          }
        } else if (ChessSet._board[i][j] === aitag){
          var temp = this.ChessPostion(i, j);
          temp.col = black_string;
          this.DrawChess(temp);
          if(i==prepos[0]&&j==prepos[1]){
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(temp.x - chessr/2, temp.y)
            ctx.lineTo(temp.x + chessr/2, temp.y)
            ctx.moveTo(temp.x, temp.y - chessr/2)
            ctx.lineTo(temp.x, temp.y + chessr/2)
            ctx.stroke();
            ctx.closepath
          }
        }
      }
    }
  }
  WriteStep(num,x,y){
    ctx.fillStyle="black"
    ctx.font = "40px normal"
    if(num<10){
      ctx.fillText(
      "第" + num + "枚",
        x+length-120,
        y
      )
    }
    else if(num<100){
      ctx.fillText(
        "第" + num + "枚",
        x + length - 140,
        y
      )
    }else {
      ctx.fillText(
        "第" + num + "枚",
        x + length - 160,
        y
      )
    }
  }
  WriteWord(res){
    //ctx.fillStyle = "black"
    ctx.font = "40px normal"
    if(res===1){
      ctx.fillStyle = "#EEEE00"
      ctx.fillText(
        "胜利",
        left_from+length/2-30,
        up_from+length+50
      )
    }
    else if(res===3){
      ctx.fillStyle = "#0000FF"
      ctx.fillText(
        "平局",
        left_from + length / 2 - 30,
        up_from + length + 50
      )
    }else if(res===2){
      ctx.fillStyle = "#696969"
      ctx.fillText(
        "失败",
        left_from + length / 2 - 30,
        up_from + length + 50
      )
    }
    ctx.fillStyle="white"
  }



}