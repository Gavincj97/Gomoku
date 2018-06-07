

class Chess{
  constructor(x,y,col) {
    // this.x = window.innerWidth/2;
    // this.y = window.innerHeight/2;
    // this.col = "black";
    this.x = x;
    this.y = y;
    this.col = col;
  }
  Equal(chess){
    if (this.x === chess.x && this.y === chess.y && this.col ===chess.col) return true;
    else return false;
  }
}