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
    [50000, [1, 1, 1, 1, 1]],
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
];

const MAX = shapeScore[0][0] * 10;
const MIN = -1 * MAX;

let [xAI, yAI] = [0, 0]; //should move
let [xPos, yPos] = [0, 0]; //next move

let totalSearch = 0; //总搜索数
let ABcut = 0; //alpha-beta剪枝数

class Gomoku {
    constructor(xSize, ySize) {
        this.xSize = xSize;
        this.ySize = ySize;

        this._checkExist = new Array(xSize);
        for (let i = 0; i < xSize; ++i) {
            this._checkExist[i] = new Array(ySize);
        }
        this._step = 0;
        this._value = 0;
        this._result = 0;
        this._board = new Array(xSize);
        for (let i = 0; i < xSize; ++i) {
            this._board[i] = new Array(ySize);
        }
        this._human = [];
        this._ai = [];
        this._record_num = 0;
        this.reset();
        this._done = false;
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
        this._check_all();
        return true;
    }

    // AI play
    // return AI's choice as [x, y]
    // note: make sure result===0 before calling aiPlay()
    aiPlay() {
        totalSearch = ABcut = 0;
        this._done = false;
        this._value = this._negamax(AI, DEPTH, MIN, MAX);
        this._step = this._ai.length;
        this._board[xAI][yAI] = 2;
        this._ai.push([xAI, yAI]);

        this._check_all();

        console.log("result=", this._result);
        console.log("this._value=", this._value);
        console.log('总搜索数:' + totalSearch + ',剪枝数:' + ABcut); //注意，减掉的节点数实际远远不止 ABcut 个，因为减掉的节点的子节点都没算进去。
        console.log("xAI=", xAI, "yAI=", yAI);
        console.log("_ai=", this._ai);
        console.log("_human=", this._human);
        //xAI = yAI = -1;
        return this._ai[this._ai.length - 1];
    }
    
    retry() {
        if(this._result === 1)
            return false;
        let _h = this._human.pop();
        let _a = this._ai.pop();
        if (_h === undefined || _a === undefined)
            return false;
        this._board[_h[0]][_h[1]] = 0;
        this._board[_a[0]][_a[1]] = 0;
        this._result = 0;
        return true;
    }

    lastai() {
        if (this._ai.length === 0)
            return [-1, -1]
        else 
            return this._ai[this._ai.length - 1];
    }

    // return evaluate_value
    // state : AI or HUMAN
    //
    _negamax(state, depth, alpha, beta) {
        totalSearch++;
        if (depth === 0 || this._gameOver(xPos, yPos)) {
            // console.log("depth="+depth);
            // console.log("gameOver="+this._gameOver(xPos,yPos));
            return this._evaluation(state); //评估函数
        }
        let moveList = this._findNextPoint(); //搜索可执行操作

        if (this._step > 0) {
            if (this._value < 0) //人优势，防守
                this._reOrder(state, moveList, this._human[this._human.length - 1]); //可执行操作排序 TODO
            else //进攻
                this._reOrder(state, moveList, this._ai[this._ai.length - 1]);
        }

        let bestValue = MIN;
        for (let nextMove of moveList) {
            // console.log("moveList=" + moveList);
            [xPos, yPos] = nextMove;
            if (this._done !== true)
                [xAI, yAI] = nextMove;

            if (state === AI) {
                this._board[nextMove[0]][nextMove[1]] = 2; //makemove
                this._ai.push(nextMove);
            } else { //human
                this._board[nextMove[0]][nextMove[1]] = 1; //makemove
                this._human.push(nextMove);
            }

            let value = -this._negamax(!state, depth - 1, -beta, -alpha);

            this._board[nextMove[0]][nextMove[1]] = 0; //unmakemove
            if (state === AI)
                this._ai.pop();
            else //human
                this._human.pop();

            bestValue = bestValue > value ? bestValue : value;
            if (value > alpha) {
                if (depth === DEPTH) //target position
                    [xAI, yAI] = nextMove;
                this._done = true;
                alpha = value;
            }
            if (alpha >= beta) {
                ABcut++;
                break;
            }
        }
        return alpha;
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

    // 查找点的位置
    _pointIndexOf(ptList, pt) {
        let cnt = -1;
        for (let _elem of ptList) {
            cnt++;
            if (_elem[0] === pt[0] && _elem[1] === pt[1])
                return cnt;
        }
        return -1;
    }

    // 交换两个点元素的位置
    _pointExchange(ptList, ind1) {
        // why some points not in thi list? 
        // TODO
        // if (ind1 >= 0 && ind1 < ptList.length && ind2 >= 0 && ind2 < ptList.length) {
        let ind2 = this._record_num - 1;
        let temp = ptList[ind1];
        ptList[ind1] = ptList[ind2];
        ptList[ind2] = temp;
        // }
    }

    // 交换（仅为节省代码）
    _doneExchange(moveList, pt) {
        this._record_num++; //增加不动点数目
        //由于此点一定位于moveList中，可以直接获取元素位置
        let ind = this._pointIndexOf(moveList, pt);
        this._pointExchange(moveList, ind); //交换第一个非不动点和当前best点的内容
    }

    //当前的状态的查找和交换
    _findAndExchange(moveList, curStatusPoint, ptNum) {
        let anotherValue = this._board[curStatusPoint[0]][curStatusPoint[1]] === 1 ? 2 : 1;
        for (let dir of direction) {
            let curLine = 1;
            let recPt = [-1, -1]; //临时记录点位
            let bestPt = [-1, -1]; //最终记录点位
            let rtag = true; //空
            let btag = true; //空
            for (let op of [-1, 1]) {
                let isBlock = false; //有阻碍
                for (let i = 1; i < ptNum; ++i) {
                    //当前位置
                    let curPt = [curStatusPoint[0] + (dir[0] * op) * i, curStatusPoint[1] + (dir[1] * op) * i];
                    if (!this._checkRange(curPt))
                        break; //此处不可能则外面更不可能
                    //不相连则外面更不可能相连
                    if (this._board[curPt[0]][curPt[1]] === anotherValue) {
                        isBlock = true;
                        if (curLine < ptNum) //控制xx10111xx型
                            break;
                        //xx1111x0型 TODO
                    }
                    if (this._board[curPt[0]][curPt[1]] === 0) { //目前半个方向尚未凑够数目，但是可能为best点
                        if (isBlock === true) //此方向上(8dir)遇到过阻碍，则直接跳过
                            break;
                        if (op === -1 && rtag === false)
                            break;
                        if (op === 1 && btag === false)
                            break;
                        if (op === -1)
                            [recPt, rtag] = [curPt, false];
                        if (op === 1)
                            [bestPt, btag] = [curPt, false];
                    } else // === curStatusValue
                        curLine++;
                    if (curLine < ptNum)
                        continue;

                    if (btag === false) //有暂存
                        this._doneExchange(moveList, bestPt);
                    if (rtag === false) //有暂存
                        this._doneExchange(moveList, recPt);
                }
            }
        }
    }

    // 将已和最终位置连成线的点提到前面去
    // ptNum 成线点数
    // offset 倒数第几个点
    _findPointNum(state, moveList, ptNum = 4, offset = 1) {
        if (this._ai.length - offset < 0 || this._human.length - offset < 0)
            return 0;
        this._record_num = 0; //优先点的数目
        let myPt = state === AI ? this._ai[this._ai.length - offset] : this._human[this._human.length - offset];
        let myValue = this._board[myPt[0]][myPt[1]];
        let enemyPt = state === AI ? this._human[this._human.length - offset] : this._ai[this._ai.length - offset];
        let enemyValue = this._board[enemyPt[0]][enemyPt[1]];

        this._findAndExchange(moveList, myPt, ptNum); //进攻性，自己的优先位置放在前面
        this._findAndExchange(moveList, enemyPt, ptNum);

        return this._record_num; //总的优先点数
    }

    _reOrder(status, moveList, cur) {
        let totalPriNum = 0;
        //这一坨以后再说。。。看看怎么效率才会最高

        // //成二
        // totalPriNum += this._findPointNum(status, moveList, 2, 4);
        // //成二
        // totalPriNum += this._findPointNum(status, moveList, 2, 3);
        // //成二
        // totalPriNum += this._findPointNum(status, moveList, 2, 2);
        // //成二
        // totalPriNum += this._findPointNum(status, moveList, 2, 1);

        // //成三
        // totalPriNum += this._findPointNum(status, moveList, 3, 4);
        // //成三
        // totalPriNum += this._findPointNum(status, moveList, 3, 3);
        // //成三
        // totalPriNum += this._findPointNum(status, moveList, 3, 2); //BUG??
        // //成三
        // totalPriNum += this._findPointNum(status, moveList, 3, 1);

        // //成四
        // totalPriNum += this._findPointNum(status, moveList, 4, 4);
        // //成四
        // totalPriNum += this._findPointNum(status, moveList, 4, 3);
        // //成四
        // totalPriNum += this._findPointNum(status, moveList, 4, 2);
        // //成四
        // totalPriNum += this._findPointNum(status, moveList, 4, 1);

        //let j = Math.ceil(this._ai.length / 2);
        let j = Math.ceil(this._ai.length / 2);

        for (let i = 2; i < 5; ++i) { //成几
            for (; j > 0; --j) { //倒数第几部
                totalPriNum += this._findPointNum(status, moveList, i, j);
            }
        }

        // console.log("totalPriNum=" + totalPriNum);
        // console.log("curPoint=" + cur);

        let tempList = moveList.slice(totalPriNum);
        // console.log("tempList1=" + tempList);
        function sortDistence(pt1, pt2) { //其余点按距离从小到大排序
            let ds1 = [pt1[0] - cur[0], pt1[1] - cur[1]];
            let ds2 = [pt2[0] - cur[0], pt2[1] - cur[1]];
            return (ds1[0] * ds1[0] + ds1[1] * ds1[1]) - (ds2[0] * ds2[0] + ds2[1] * ds2[1]);
        }
        tempList.sort(sortDistence);
        // console.log("moveList.slice(0, totalPriNum)=" + moveList.slice(0, totalPriNum));
        moveList = moveList.slice(0, totalPriNum).concat(tempList);
        // console.log("tempList2=" + tempList);
        console.log("moveList=" + moveList);
    }

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

    _checkRange(pos) {
        if (pos[0] < 0 || pos[0] >= this.xSize) //下（temp[0] >= this.ySize is enough）
            return false;
        if (pos[1] < 0 || pos[1] >= this.ySize) //右
            return false;
        return true;
    }

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
    // put this._board[i][j] to this._result
    _check_all() {
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

    // return: 0, if game's not over
    //         1, if user wins
    //         2, if AI wins
    get result() {
        return this._result;
    }

};
