const AI = true;
const HUMAN = false;
const DEPTH = 2;
const direction = [
    [0, 1], //右
    [1, 0], //下
    [1, 1], //右下
    [1, -1] //左下
];
const shapeScore = [
    [99999999, [1, 1, 1, 1, 1]],
    [4320, [0, 1, 1, 1, 1, 0]],
    [720, [0, 1, 1, 1, 0, 0]],
    [720, [0, 0, 1, 1, 1, 0]],
    [720, [0, 1, 1, 0, 1, 0]],
    [720, [0, 1, 0, 1, 1, 0]],
    [720, [1, 1, 1, 1, 0]],
    [720, [0, 1, 1, 1, 1]],
    [720, [1, 1, 0, 1, 1]],
    [720, [1, 0, 1, 1, 1]],
    [720, [1, 1, 1, 0, 1]],
    [120, [0, 0, 1, 1, 0, 0]],
    [120, [0, 0, 1, 0, 1, 0]],
    [120, [0, 1, 0, 1, 0, 0]],
    [20, [0, 0, 0, 1, 0, 0]],
    [20, [0, 0, 1, 0, 0, 0]]
]

const MAX = shapeScore[0][0];
const MIN = -1 * MAX;

let totalSearch = 0; //总搜索数
let ABcut = 0; //alpha-beta剪枝数

let [xAI, yAI] = [0, 0]; //should move
let [xPos, yPos] = [0, 0]; //next move
let bestScore = MIN;

class Gomoku {
    constructor(xSize, ySize) {
        this.xSize = xSize;
        this.ySize = ySize;

        this._result = 0;
        this._board = new Array(xSize);
        for (let i = 0; i < xSize; ++i) {
            this._board[i] = new Array(ySize);
        }

        this._checkExist = new Array(xSize);
        for (let i = 0; i < xSize; ++i) {
            this._checkExist[i] = new Array(ySize);
        }

        this._human = [];
        this._ai = [];
        this.reset();
    }

    // reset game
    reset() {
        for (let i = 0; i < this.xSize; ++i) {
            for (let j = 0; j < this.ySize; ++j) {
                this._board[i][j] = 0;
            }
        }
        this._result = 0;
    }

    // check if (x, y) is available
    available(x, y) {
        return this._board[x][y] === 0;
    }

    // user play at (x,y)
    // return false if (x,y) has stone
    // note: make sure result===0 before calling userPlay()
    userPlay(x, y) {
        if (!this.available(x, y))
            return false;

        this._board[x][y] = 1;
        [xPos, yPos] = [x, y];
        this._human.push([x, y]);
        return true;
    }

    // AI play
    // return AI's choice as [x, y]
    // note: make sure result===0 before calling aiPlay()
    aiPlay() {
        // let value = this._negamax(AI, DEPTH, MIN, MAX);
        [xAI, yAI] = this._maxmin(DEPTH);
        this._board[xAI][yAI] = 2;
        this._ai.push([xAI, yAI]);

        if (bestScore >= MAX)
            this._result = 2;
        else if (bestScore <= MIN)
            this._result = 1;
        else
            this._result = 0;
        console.log("result=", this._result);
        console.log("bestScore=", bestScore);
        console.log("xAI=", xAI, "yAI=", yAI);
        return [xAI, yAI];
    }
  
    // max min search
    // white is max, black is min
    _maxmin(depth = 3) {
        // initial 
        bestScore = MIN;
        let bestPoints = [];
        totalSearch = ABcut = 0;

        // let moveList = gen(board, depth);
        let moveList = this._findNextPoint(); //搜索可执行操作
        this._reOrder(moveList, [xPos, yPos]); //可执行操作排序

        for (let nextMove of moveList) {
            [xPos, yPos] = nextMove; //record next move to decrease searching
            this._board[nextMove[0]][nextMove[1]] = 2; //AI

            // alpha = MAX, beta = bestScore > MIN ? bestScore : MIN
            let v = this._min(depth - 1, MAX, bestScore > MIN ? bestScore : MIN);

            //console.log(v, nextMove);
            //如果跟之前的一个好，则把当前位子加入待选位子
            if (v == bestScore) 
                bestPoints.push(nextMove);

            //找到一个更好的分，就把以前存的位子全部清除
            if (v > bestScore) {
                bestScore = v;
                bestPoints = [];
                bestPoints.push(nextMove);
            }
            this._board[nextMove[0]][nextMove[1]] = 0; //clear, 回溯
        }

        let result = bestPoints[Math.floor(bestPoints.length * Math.random())]; //从最佳点位中随机取一个
        console.log('当前分数：' + bestScore);
        console.log('总搜索数:' + totalSearch + ',剪枝数:' + ABcut); //注意，减掉的节点数实际远远不止 ABcut 个，因为减掉的节点的子节点都没算进去。
        return result;
    }

    _min(depth, alpha, beta) {
        let ev = this._evaluation(AI);
        totalSearch++;

        if (depth <= 0 || this._gameOver(xPos, yPos)) 
            return ev;

        let best = MAX;
        // let moveList = gen(board, depth);
        let moveList = this._findNextPoint(); //搜索可执行操作
        this._reOrder(moveList, [xPos, yPos]); //可执行操作排序

        for (let nextMove of moveList) {
            this._board[nextMove[0]][nextMove[1]] = 1; //HUMAN

            // alpha = best < alpha ? best : alpha, beta = beta
            let v = this._max(depth - 1, best < alpha ? best : alpha, beta);

            this._board[nextMove[0]][nextMove[1]] = 0; //clear，回溯

            best = v < best ? v: best; //min

            if (v < beta) { //剪枝
                ABcut++;
                break;
            }
        }
        return best;
    }

    _max(depth, alpha, beta) {
        let ev = this._evaluation(AI);
        totalSearch++;

        if (depth <= 0 || this._gameOver(xPos, yPos)) 
            return ev;

        let best = MIN;
        // let moveList = gen(board, depth);
        let moveList = this._findNextPoint(); //搜索可执行操作
        this._reOrder(moveList, [xPos, yPos]); //可执行操作排序

        for (let nextMove of moveList) {
            this._board[nextMove[0]][nextMove[1]] = 2; //AI

            // alpha = alpha, beta = best > beta ? best : beta
            let v = this._min(depth - 1, alpha, best > beta ? best : beta);

            this._board[nextMove[0]][nextMove[1]] = 0; //clear，回溯

            best = v > best ? v: best; //max

            if (v > alpha) { //剪枝
                ABcut++;
                break;
            }
        }
        return best;
    }



    // TODO: find better algorithms to reorder the move list
    _reOrder(moveList, cur) {
        function sortDistence(pt1, pt2) { //按距离从小到大排序
            let ds1 = [pt1[0] - cur[0], pt1[1] - cur[1]];
            let ds2 = [pt2[0] - cur[0], pt2[1] - cur[1]];
            return (ds1[0] * ds1[0] + ds1[1] * ds1[1]) - (ds2[0] * ds2[0] + ds2[1] * ds2[1]);
        }
        moveList.sort(sortDistence);
    }

    //  return: prob move [list]
    _findNextPoint() {
        let moveList = [];
        for (let i = 0; i < this.xSize; ++i) {
            for (let j = 0; j < this.ySize; ++j) {
                this._checkExist[i][j] = false;
            }
        }

        for (let i = 0; i < this.xSize; i++) {
            for (let j = 0; j < this.ySize; j++) {
                if (this._board[i][j] === 0)
                    continue;
                for (let m = -2; m <= 2; m++) {
                    if (!(i + m >= 0 && i + m < this.xSize))
                        continue;
                    for (let n = -2; n <= 2; n++) {
                        if (j + n < 0 || j + n >= this.ySize || this._board[i + m][j + n] !== 0)
                            continue;
                        //列表将已经确认的点除外，避免重复，将去重时间复杂度缩小到O(1)
                        if (this._checkExist[i + m][j + n] === true)
                            continue;
                        this._checkExist[i + m][j + n] = true
                        moveList.push([i + m, j + n]);
                    } //end of n
                } //end of m
            } //end of j
        } //end of i
        return moveList;
    }

    //  if curPos is in range 
    //      return true    
    _checkRange(pos) {
        if (pos[0] < 0 || pos[0] >= this.xSize) //下（temp[0] >= this.ySize is enough）
            return false;
        if (pos[1] < 0 || pos[1] >= this.ySize) //右
            return false;
        return true;
    }

    // return: 0, if game's not over
    //         1, if user wins
    //         2, if AI wins
    _gameOver(px, py) {
        let myValue = this._board[px][py];

        for (let dir of direction) {
            for (let i = -5; i < 0; ++i) {
                let count = 0;
                for (let j = 0; j < 5; ++j) {
                    let pos = [px + (i + j) * dir[0], py + (i + j) * dir[1]];
                    if (!this._checkRange(pos))
                        continue;
                    let curValue = this._board[pos[0]][pos[1]];
                    if (curValue === myValue)
                        ++count;
                    if (count === 5)
                        return true;
                }
            }
        }
        return false;
    }

    // return : evaluation all board value
    // TODO
    _evaluation(state) {
        let [totalScore, myScore, enemyScore] = [0, 0, 0];
        let myValue = state == AI ? 2 : 1;
        let myScoreList = [];
        let enemyScoreList = [];

        for (let i = 0; i < this.xSize; ++i) {
            for (let j = 0; j < this.ySize; ++j) {
                if (this._board[i][j] === 0) //none
                    continue;
                if (this._board[i][j] === myValue) //my
                    for (let _direction of direction) {
                        myScore += this._dirScore(i, j, _direction, myScoreList);
                    }
                else //enemy
                    for (let _direction of direction) {
                        enemyScore += this._dirScore(i, j, _direction, enemyScoreList);
                    }
            }
        }
        totalScore = myScore - enemyScore; //TODO
        return totalScore;
    }

    // list1 == list2 return true
    _compareList(list1, list2) {
        if (list1.length !== list2.length)
            return false;
        for (let i = 0; i < list1.length; ++i) {
            if (list1[i] !== list2[i])
                return false;
        }
        return true;
    }

    // calculate current direction's value
    // TODO ??
    _dirScore(i, j, dir, curList) {
        let myValue = this._board[i][j];
        let maxScoreShape = [0, //score
            [], //position
            [] //direction
        ];

        for (let offset = -5; offset <= 0; ++offset) { //偏移总量为6
            let record = [];
            for (let m = 0; m <= 5; ++m) { //record最大长度为6
                let pos = [i + (offset + m) * dir[0], j + (offset + m) * dir[1]];
                if (!this._checkRange(pos))
                    continue;
                let curValue = this._board[pos[0]][pos[1]];
                if (curValue === 0)
                    record.push(0);
                else if (curValue === myValue)
                    record.push(1);
                else
                    record.push(2); //enemyValue
            }

            let shape5 = [record[0], record[1], record[2], record[3], record[4]];
            let shape6 = [record[0], record[1], record[2], record[3], record[4], record[5]];

            for (let _elem of shapeScore) {
                if (this._compareList(shape5, _elem[1]) || this._compareList(shape6, _elem[1])) {
                    if (this._compareList(shape5, [1, 1, 1, 1, 1]))
                        console.log("win");
                    if (_elem[0] > maxScoreShape[0]) {
                        maxScoreShape = [_elem[0],
                            [], dir
                        ];
                        for (let m = 0; m <= 4; ++m)
                            maxScoreShape[1][m] = [i + (offset + m) * dir[0], j + (offset + m) * dir[1]];
                    }
                }
            }

        } //end of for offset

        let addScore = 0;
        if (!maxScoreShape[1].length)
            return addScore + maxScoreShape[0];

        for (let _elem of curList) {
            for (let pt1 of _elem[1]) {
                for (let pt2 of maxScoreShape[1]) {
                    if (!this._compareList(pt1, pt2) || !_elem[0] || !maxScoreShape[0])
                        continue;
                    addScore += _elem[0] + maxScoreShape[0];
                } //pt2
            } //pt1
        } //_elem

        curList.push(maxScoreShape); //add new shape

        return addScore + maxScoreShape[0];
    }

    // return: 0, if game's not over
    //         1, if user wins
    //         2, if AI wins
    get result() {
        return this._result;
    }

    // gameOver()
    /*
        // return: 0, if game's not over
        //         1, if user wins
        //         2, if AI wins
        // put this._board[i][j] to this._result
        _gameOver() {
            for (let i = 0; i < this.xSize; i++) {
                for (let j = 0; j < this.ySize; j++) {
                    if (this._board[i][j] !== 0) {
                        if (
                            (
                                i < this.xSize - 4 && this._board[i][j] === this._board[i + 1][j] &&
                                this._board[i][j] === this._board[i + 2][j] &&
                                this._board[i][j] === this._board[i + 3][j] &&
                                this._board[i][j] === this._board[i + 4][j]) ||
                            (
                                j < this.ySize - 4 && this._board[i][j] === this._board[i][j + 1] &&
                                this._board[i][j] === this._board[i][j + 2] &&
                                this._board[i][j] === this._board[i][j + 3] &&
                                this._board[i][j] === this._board[i][j + 4]) ||
                            (
                                j < this.ySize - 4 && i < this.xSize - 4 &&
                                this._board[i][j] === this._board[i + 1][j + 1] &&
                                this._board[i][j] === this._board[i + 2][j + 2] &&
                                this._board[i][j] === this._board[i + 3][j + 3] &&
                                this._board[i][j] === this._board[i + 4][j + 4]) ||
                            (
                                j >= 4 && i < this.xSize - 4 &&
                                this._board[i][j] === this._board[i + 1][j - 1] &&
                                this._board[i][j] === this._board[i + 2][j - 2] &&
                                this._board[i][j] === this._board[i + 3][j - 3] &&
                                this._board[i][j] === this._board[i + 4][j - 4])
                        ) {
                            this._result = this._board[i][j];
                            return this._result;
                        } //end if 
                    } //end of if
                } //end of j
            } // end of i
            return 0;
        }
    */

};

// Usage
const game = new Gomoku(10, 10);

// for (x,y) read from screen
let [x, y] = [1, 2];
if (!game.available(x, y)) {
    //continue
}
game.userPlay(x, y);
// draw(x, y, user);
if (game.result !== 0) {
    // win or lose
}
[x, y] = game.aiPlay();
// draw(x, y, ai);
if (game.result !== 0) {
    // win or lose
}

// reset
game.reset();