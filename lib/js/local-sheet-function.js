 //===============================================================
 //  利用者編集領域
 //===============================================================
//テーブルヘッダの値設定（DBから取得する場合は宣言だけでOK）
let arrayThData = ['種別','名称','貫数','値段','シャリの大きさ','シャリの種類','お気に入り数','注文履歴','備考'];
//行数の変更を検知するかの判定(0:OFF / 1:ON)
let lineNumberFlg = 1;
//DBからJSON形式でテーブル値をやりとりするかのON/OFF(0:OFF / 1:ON)
let dbUseFlg = 0;
//DB参照APIのURL（DBから取得しない場合は宣言だけでOK）
let uriParam = 'http://localhost:8001/master_table';
//DB変更APIのURL（DBから取得しない場合は宣言だけでOK）
let uriParamCUD = 'http://localhost:8001/master_table_cud';
/*
テーブルの中身設定（DBから取得する場合は宣言だけでOK）
入力値： ID, 行数, value1, value2,...
*/
let arrayTdData = [
  ['001','1', 'にぎり', '大トロ','1貫','￥620','変更可能','赤酢','8','有','本マグロ使用'],
  ['002','2', '軍艦', 'ウニ','1貫','￥550','変更不可','米酢','5','有',''],
  ['003','3', '軍艦', '白エビ','1貫','￥470','変更不可','米酢','3','無','【期間限定】'],
  ['004','4', 'にぎり', 'イカ','1貫','￥220','変更可能','米酢','3','有',''],
  ['005','5', 'にぎり', 'さわら','1貫','￥550','変更可能','米酢','1','無',''],
  ['006','6', 'にぎり', 'こはだ','1貫','￥220','変更可能','米酢','7','有',''],
  ['007','7', 'にぎり', '車エビ','1貫','￥550','変更可能','赤酢','5','有',''],
  ['008','8', '軍艦', 'いくら','1貫','￥470','変更不可','米酢','3','有',''],
  ['009','9', 'にぎり', 'カツオ','1貫','￥350','変更可能','米酢','2','有','薬味：辛子'],
  ['010','10', 'にぎり', 'マグロ','1貫','￥350','変更可能','赤酢','11','有','本マグロ使用'],
  ['011','11', 'にぎり', '赤貝','1貫','￥550','変更可能','米酢','13','有','【閖上】特別入荷'],
  ['012','12', '巻物', 'カワハギ','1本','￥550','変更不可','米酢','5','有',''],
  ['013','13', '巻物', '鉄火巻き','1本','￥470','変更不可','米酢','6','無','本マグロ使用'],
  ['014','14', 'にぎり', '穴子','1貫','￥470','変更可能','米酢','6','無',''],
  ['015','15', 'にぎり', 'づけマグロ','1貫','￥470','変更可能','赤酢','16','有','本マグロ使用'],
  ['016','16', '巻物', 'トロたく巻','1本','￥550','変更不可','米酢','1','無','本マグロ使用']
];
//入力中に表示される文字数
let inputSize = 30;
//フィルタ機能のON/OFF(0:OFF / 1:ON)
let filterFlg = 1;
//編集不可列の設定(例：[1,3,4])
let disableCell = [1,4,5];

 //===============================================================
 //  リクエストするURIを作成する関数(ユーザ作成用) ※dbUaseFlg = 0 の場合は不要
 //===============================================================
export function getUri(){
  //getパラメタ取得
  let paramValue;
  let queryString = window.location.search;
  let uri = uriParam + queryString;

  let queryString2 = queryString.substring(1);
  let parameters = queryString2.split('&');
  for (let i = 0; i < parameters.length; i++) {
    let element = parameters[i].split('=');
    let paramName = decodeURIComponent(element[0]);
    //get値のMasterIdの値を取得
    if(paramName == "MasterId"){
      paramValue = decodeURIComponent(element[1]);
      break;
    }
  }
  //引数によって、列の値をdisableに設定
  if(!paramValue){
    return "";
  } else if(paramValue == 1){
    //MasterId = 1 の場合、1列目をdisableにする
    disableCell = [1];
  } else if(paramValue == 2){
    //MasterId = 2 の場合、4列目をdisableにする
    disableCell = [4];
  } else if(paramValue == 3){
    //MasterId = 3 の場合、1列目をdisableにする
    disableCell = [1];
  }
  dbTableId = paramValue;
  return uri;
}

 //===============================================================
 //  グローバル変数宣言
 //===============================================================
//tableのtheadObject
let theadObject = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('localSheetThead');
//tableのtbodyObject
let tbodyObject = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('localSheetTbody');
//右クリックメニューのObject
let rightClickObject = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('conmenu');
//tableのObject
let tableObject = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('localSheet');
//右クリックした場所のTDオブジェクト
let rightClickCell;
//右クリックした場所の行番号
let rightClickVal;
//右クリックした場所の行
let rightClickLine;
//クリック中(ドラッグ)かの判定
let clickStatus = 0;
//キーを押しているかの判定
let ctrlFlg = 0;
//操作中のカラム
let opeCol;
//操作中の行
let opeRow;
//DBへのCRUD配列
let newArray = [];
let updateArray = [];
let deleteArray = [];
//table指定ID
let dbTableId;
//lineNumberFlg = 1 の場合は、disableCell全てに＋１する処理を追加が必要
if(lineNumberFlg == 1){
  for(let i = 0; i < disableCell.length; i++) {
    disableCell[i] = disableCell[i] + 1;
  }
}

 //===============================================================
 //  TABLEに値を入力 + 右クリック設定する関数
 //===============================================================
export function setTableInfo(){
//thを生成
  let j = 0;
  let tr = document.createElement('tr');
  let trFrame = document.createElement('tr');
  for(let i=0; i<=arrayThData.length; i++){
    let thFrame = document.createElement('th');
    thFrame.classList.add('table-frame');
    trFrame.appendChild(thFrame);
    if(i == 0){
      thFrame.classList.add('table-frame-left');
    }
  }
  theadObject.appendChild(trFrame);

  arrayThData.forEach(function(element){
    j++;
    let th = document.createElement('th');
    //左端のグレーのところ
    if(j == 1){
      let thFrame = document.createElement('th');
      thFrame.classList.add('table-frame');
      tr.appendChild(thFrame);
    }
    th.innerHTML = element;

    //Filter追加
    th.classList.add('filter');

    //thをtrに追加
    tr.appendChild(th);
  });
  theadObject.appendChild(tr);

  //trループ
  arrayTdData.forEach(function(array_value,index_i){
    let tr = document.createElement('tr');
    //tdループ
    array_value.forEach(function(element,index_j){
      let td = document.createElement('td');
      //左端のグレーのところ
      if(index_j == 0){
        //行番号記載ありの場合
        tr.dataset.lineId = element;
        return;
      } else if(index_j == 1){
        td.classList.add('table-frame');
      }
      if(index_j == 1 && lineNumberFlg == 0){
        td.innerHTML = index_i + 1;
        tr.appendChild(td);
        td = document.createElement('td');
      }
      td.innerHTML = element;
      //disableCell列にdisableクラスを追加
      if(disableCell.includes(index_j)){
        td.classList.add('disable');
      }
      //tdをtrに追加
      tr.appendChild(td);
    });
    tbodyObject.appendChild(tr);

  });

  // 右クリック表示
  tableObject.oncontextmenu = function (e) {
    let clientRect = rightClickCell.getBoundingClientRect() ;
    rightClickObject.style.left = clientRect.left+"px";
    rightClickObject.style.top = clientRect.top+"px";
    rightClickObject.style.display = "block";
    return false;
  };
  //左クリックで右クリックウィンドウを非表示に変更
  document.body.addEventListener('click', function () {
    rightClickObject.style.display ="none";
  });

  //FilterのON/OFF
  if(filterFlg == 1){
    import("./filter.js")
      .then((obj) => {
          // 各モジュールには、引数objのプロパティからアクセスできる。
          obj.tFilterInit();
      });
  }
  getCELL();
}

 //===============================================================
 //  テーブル構築をする基幹となる関数
 //===============================================================
export function localSheetFunction() {
  if (dbUseFlg == 1){
    let uri = getUri();
    const encodeUri = encodeURI(uri);
    fetch(encodeUri)
      //KAGRA API実行
      .then(function(res){
        return(res.json());
      })
      .then(function(json){
        let arrayData = JSON.stringify(json["return"]);
        arrayData = JSON.parse(arrayData);
        //th入力
        arrayThData = arrayData[0];
        //thを削除
        let exe = [0];
        for(let i=0; i<exe.length; i++){
          arrayData.splice(exe[i]-i, 1);
        }
        //tdを入力
        arrayTdData = arrayData;
        setTableInfo();
        return(json.setDisable);
      })
      .catch(function(err){
        console.log(err);
      });
  } else{
    setTableInfo();
  }
}


 //===============================================================
 //  行挿入する関数
 //===============================================================
export function lineInsert(){
  let newRow = tableObject.insertRow(rightClickLine);
  let newCell = newRow.insertCell();

  //行番号を追加
  newCell.appendChild(document.createTextNode(rightClickVal));
  newCell.classList.add('table-frame');
  //空のtdを生成
  for (let j=1; j<rightClickCell.parentNode.cells.length; j++) {
    let newCell = newRow.insertCell();
    newCell.appendChild(document.createTextNode(""));
  }
  //trをループして挿入行以降の行番号変更
  for (let i = rightClickLine + 1; i<tableObject.rows.length; i++) {
    tableObject.rows[i].cells[0].innerHTML = Number(tableObject.rows[i].cells[0].innerHTML) + 1;
  }
  //追加行も編集できるようにする
  getCELL();
}


 //===============================================================
 //  行削除する関数
 //===============================================================
export function lineDelete(){
  tableObject.deleteRow(rightClickLine);

  //trをループして挿入行以降の行番号変更
  for (let i = rightClickLine; i<tableObject.rows.length; i++) {
    tableObject.rows[i].cells[0].innerHTML = Number(tableObject.rows[i].cells[0].innerHTML) - 1;
  }
}

 //===============================================================
 //  右クリック時に、情報を保存する関数：【引数】Cell 右クリック時の位置に存在するTDオブジェクト
 //===============================================================
export function setRightClick(Cell){
  //グローバル変数に値代入
  rightClickCell = Cell;
  //挿入位置記憶
  rightClickLine = rightClickCell.parentNode.rowIndex;
  if(rightClickLine < 2){
    rightClickLine = 2;
  }
  //行番号数字記憶
  rightClickVal = rightClickCell.parentNode.cells[0].innerHTML;
  if(rightClickVal < 1){
    rightClickVal = 1;
  }

}

 //===============================================================
 //  テーブル操作検知関数
 //===============================================================
export function getCELL() {
  //ドラッグで選択
  tableObject.onmouseover = handler;
  tableObject.onmousedown = handler;
  tableObject.onmouseup = handler;

  //trをループして行取得
  for (let i=0; i<tableObject.rows.length; i++) {
    //tdをループ。列取得
    for (let j=0; j<tableObject.rows[i].cells.length; j++) {
      let Cells = tableObject.rows[i].cells[j]; 
        //クリック検知(thisはクリックしたセル"td"のオブジェクトを返却)
        Cells.onclick = function(){click(this);};
        //右クリック検知
        Cells.oncontextmenu = function(){setRightClick(this);};
      if(i > 1 && j > 0){
        //ダブルクリック検知(thisはクリックしたセル"td"のオブジェクトを返却)
        Cells.ondblclick =function(){dblClick(this);};
      }
    }
  }
}

 //===============================================================
 //  ドラッグ処理関数
 //===============================================================
export function handler(event) {
  if (event.type == 'mousedown') {
    clickStatus = 1;
    removeFocus();
    //Cellでのみ動作（tableとかrowで反応させない）
    if(event.target == '[object HTMLTableCellElement]'){
      event.target.classList.add("cell-focus");
      if(event.target.parentNode.rowIndex == 0){
        selectRow(event.target.cellIndex);
      }
      if(event.target.cellIndex == 0){
        selectCol(event.target.parentNode.rowIndex);
      }
    }
    opeRow = event.target.parentNode.rowIndex;
    opeCol = event.target.cellIndex;
  } else if (event.type == 'mouseup'){
    clickStatus = 0;
    opeCol = "";
    opeRow = "";
  }

  if (event.type == 'mouseover' && clickStatus == 1 && event.target == '[object HTMLTableCellElement]'){
    //ドラッグしたセル以外も正方形で選択済とする
    let selectRows = event.target.parentNode.rowIndex;
    let selectCols = event.target.cellIndex;
    let maxCol;
    let minCol;
    let maxRow;
    let minRow;
    if(selectRows > opeRow){
      maxRow = selectRows;
      minRow = opeRow;
    } else{
      maxRow = opeRow;
      minRow = selectRows;
    }
    if(selectCols > opeCol){
      maxCol = selectCols;
      minCol = opeCol;
    } else{
      maxCol = opeCol;
      minCol = selectCols;
    }
    removeFocus();

    if(event.target.parentNode.rowIndex == 0){
      selectRow(event.target.cellIndex);
      maxRow = tableObject.rows.length - 1;
    }
    if(event.target.cellIndex == 0){
      selectCol(event.target.parentNode.rowIndex);
      maxCol = tableObject.rows[event.target.parentNode.rowIndex].cells.length - 1;
    }
    //trをループして行取得
    for (let i=minRow; i<=maxRow; i++) {
      //tdをループ。列取得
      for (let j=minCol; j<=maxCol; j++) {
        let Cells=tableObject.rows[i].cells[j];
        //対象範囲にcell-focusクラス追加
        Cells.classList.add("cell-focus");
      }
    }
  }
}

 //===============================================================
 //  ダブルクリック時のセル内編集関数：【引数】Cell TDオブジェクト
 //===============================================================
export function dblClick(Cell) {
  //cellのタイプをinputに変更
  if(document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById("inputId") != null){
    return;
  }

  if(Cell.classList.contains('disable') == true){
    return;
  }

  let values = Cell.innerHTML;
  Cell.innerHTML="";
  let input1 = document.createElement("input");
  //inputタイプのパラメタ編集
  input1.setAttribute("type", "text");
  input1.setAttribute("size", inputSize);
  input1.setAttribute("value", values);
  input1.id="inputId";
  input1.classList.add("border-less") ;
  input1.addEventListener("blur", {Cell: Cell, handleEvent: blurEvent});
  input1.addEventListener('keypress', {Cell: Cell, handleEvent: test_ivent});
  Cell.appendChild(input1);

  let input1Length = input1.value.length;
  input1.focus();
  input1.setSelectionRange(input1Length, input1Length);
  let th = document.createElement('th');
  let row = Cell.parentNode.rowIndex;
  let cell = Cell.cellIndex;
  let cellVal = Cell.innerHTML;
  //console.log("row:"+row +",cell:" + cell + ",cellVal:" + cellVal);
}

 //===============================================================
 //  セル入力後のEnter検知関数
 //===============================================================
export function test_ivent(e) {
  if (e.keyCode === 13) {
    document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById("inputId").blur();
  }
}


 //===============================================================
 //  セル内入力後にフォーカスを外した際の処理(input削除)関数
 //===============================================================
export function blurEvent(e){
  //console.log(this.Cell);
  let values = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById("inputId").value;
  this.Cell.removeChild(document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById("inputId"));
  this.Cell.innerHTML = values;
}

 //===============================================================
 //  セルクリック時に枠で囲う関数：【引数】Cell TDオブジェクト
 //===============================================================
export function click(Cell) {
  removeFocus();
  let row = Cell.parentNode.rowIndex;
  let col = Cell.cellIndex;
  //外枠クリック時（縦横一列選択）
  if(row == 0 && col == 0) {
    selectAll();
  } else if(row == 0){
    selectRow(col);
  } else if(col == 0){
    selectCol(row);
  } else{
    Cell.classList.add("cell-focus");
  }
}

 //===============================================================
 //  テーブル内のフォーカスを全て外す関数
 //===============================================================
export function removeFocus(){
  //trをループして行取得
  for (let i=0; i<tableObject.rows.length; i++) {
    //tdをループ。列取得
    for (let j=0; j<tableObject.rows[i].cells.length; j++) {
      let Cells=tableObject.rows[i].cells[j];
      //フォーカスを外す
      Cells.classList.remove("cell-focus");
    }
  }
}

 //===============================================================
 //  全選択をする関数
 //===============================================================
export function selectAll(){
  //trをループして行取得
  for (let i=1; i<tableObject.rows.length; i++) {
    //tdをループ。列取得
    for (let j=1; j<tableObject.rows[i].cells.length; j++) {
      let Cells=tableObject.rows[i].cells[j];
      Cells.classList.add("cell-focus");
    }
  }
}

 //===============================================================
 //  列選択をする関数：【引数】colの選択列番号
 //===============================================================
export function selectRow(col){
  //trをループして行取得
  for (let i=0; i<tableObject.rows.length; i++) {
    let Cells=tableObject.rows[i].cells[col];
    Cells.classList.add("cell-focus");
  }
}

 //===============================================================
 //  行選択をする関数：【引数】rowの選択行番号
 //===============================================================
export function selectCol(row){
    //tdをループ。列取得
    for (let j=0; j<tableObject.rows[row].cells.length; j++) {
      let Cells=tableObject.rows[row].cells[j];
      Cells.classList.add("cell-focus");
    }
}

 //===============================================================
 //  テーブル内でのキー操作イベント
 //===============================================================
document.addEventListener("keyup", event => {
  if (event.keyCode === 17){
    ctrlFlg = 0;
  }
});
document.addEventListener("keydown", event => {
  if (event.keyCode === 17){
    ctrlFlg = 1;
  }
  let selectCells = document.getElementsByTagName('local-sheet')[0].shadowRoot.querySelectorAll(".cell-focus");
  let editFlg = document.getElementsByTagName('local-sheet')[0].shadowRoot.querySelectorAll(".border-less");
  //1つ以上選択されている場合
  if(selectCells.length >= 1){
    let cell = selectCells[0];
    //DELETE or BACKSPACEで中身削除して編集モードへ(既に編集モードでない場合)
    if ((event.keyCode === 46 || event.keyCode === 8) && editFlg.length == 0) {
      if(selectCells[0].cellIndex != 0 && selectCells[0].parentNode.rowIndex > 1){
        for(let i = 0; i < selectCells.length; i++){
          selectCells[i].innerHTML = "";
          selectCells[i].classList.remove("cell-focus");
        }
        dblClick(selectCells[0]);
      }
    //上下左右+Enterで移動
    //上
    } else if(event.keyCode === 38 && editFlg.length == 0){
        //上に行が存在する場合のみ移動
        if(cell.parentNode.rowIndex > 1){
          //focus外す
          for(let i = 0; i < selectCells.length; i++){
            selectCells[i].classList.remove("cell-focus");
          }
          //focusつける
          let row = cell.parentNode.rowIndex - 1;
          let newFocusCell = tableObject.rows[row].cells[cell.cellIndex];
          newFocusCell.classList.add("cell-focus");
        }
    //下
    } else if((event.keyCode === 40 && editFlg.length == 0) || (event.keyCode === 13 && editFlg.length == 0)){
        //下に行が存在する場合のみ移動
        let myTbl = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('localSheet');
        let maxRows = myTbl.rows.length;
        
        if(cell.parentNode.rowIndex < maxRows - 1){
          //focus外す
          for(let i = 0; i < selectCells.length; i++){
            selectCells[i].classList.remove("cell-focus");
          }
          //focusつける
          let row = cell.parentNode.rowIndex + 1;
          let newFocusCell = tableObject.rows[row].cells[cell.cellIndex];
          newFocusCell.classList.add("cell-focus");
      }
    //左
    } else if(event.keyCode === 37 && editFlg.length == 0){
        //左に列が存在する場合のみ移動
        if(cell.cellIndex > 1){
          //focus外す
          for(let i = 0; i < selectCells.length; i++){
            selectCells[i].classList.remove("cell-focus");
          }
          //focusつける
          let col = cell.cellIndex - 1;
          let newFocusCell = tableObject.rows[cell.parentNode.rowIndex].cells[col];
          newFocusCell.classList.add("cell-focus");
      }
    //右
    } else if(event.keyCode === 39 && editFlg.length == 0){
        //右に列が存在する場合のみ移動
        let maxCols = tableObject.rows[cell.parentNode.rowIndex].cells.length;
        if(cell.cellIndex < maxCols - 1){
          //focus外す
          for(let i = 0; i < selectCells.length; i++){
            selectCells[i].classList.remove("cell-focus");
          }
          //focusつける
          let col = cell.cellIndex + 1;
          let newFocusCell = tableObject.rows[cell.parentNode.rowIndex].cells[col];
          newFocusCell.classList.add("cell-focus");
      }
      //ctrlは無視
    } else if (ctrlFlg == 1 || selectCells[0].parentNode.rowIndex < 2){
      //上記以外の場合は編集モードへ
    } else{
      for (let cell of selectCells) {
        dblClick(cell);
      }
    }

  //2つ以上選択されている場合
  } else if (selectCells.length > 1){
    //DELETEで中身削除
    if (event.keyCode === 46) {
      for (let cell of selectCells) {
        if(cell.cellIndex != 0 && cell.parentNode.rowIndex > 1){
          cell.innerHTML = "";
        }
      }
    }
  }
});

 //===============================================================
 //  選択されているカラムをコピーする関数
 //===============================================================
document.addEventListener("copy", function (e) {
  let selectCells = document.getElementsByTagName('local-sheet')[0].shadowRoot.querySelectorAll(".cell-focus");
  let text = "";
  //1つでも選択されている場合
  if(selectCells.length > 0){
    let befRow;
    for (let cell of selectCells) {
      if(befRow && befRow != cell.parentNode.rowIndex){
        text = text + "\r\n";
      } else if(cell.cellIndex == 1){
      } else if(text != ""){
        text = text + "\t";
      }
      befRow = cell.parentNode.rowIndex;
      if(cell.cellIndex != 0 && cell.parentNode.rowIndex != 0){
        text = text + cell.innerHTML;
      }
    }
  }
  //httpでは使えない
  //navigator.clipboard.writeText(text);
  e.clipboardData.setData("text/plain" , text);
  e.preventDefault();
});

 //===============================================================
 //  カラムを貼り付ける関数
 //===============================================================
document.addEventListener("paste", function (e) {
  let selectCells = document.getElementsByTagName('local-sheet')[0].shadowRoot.querySelectorAll(".cell-focus");
  //1つでも選択されている場合
  if(selectCells.length > 0){
    let pasteAll = (event.clipboardData || window.clipboardData).getData('text');
    let i = 0;
    let j = 0;
    //行選択の場合、行番号は飛ばす
    if(selectCells[0].cellIndex == 0){
      i++;
    //列選択の場合、列番号は飛ばす
    }
    if(selectCells[0].parentNode.rowIndex == 0){
      j++;
    }
    
    let strAll = pasteAll.split(/\r\n/);
    strAll.forEach(function(paste){
      let str = paste.split(/\t/);
      let loop = i;
      str.forEach(function(element){
        let cellIndex = selectCells[0].cellIndex + loop;
        let rowIndex = selectCells[0].parentNode.rowIndex + j;
        if(cellIndex < selectCells[0].parentNode.cells.length && rowIndex < tableObject.rows.length){
          //disableCellの列値は変更させない
          if(tableObject.rows[rowIndex].cells[cellIndex].classList.contains('disable') != true && rowIndex != 1){
            tableObject.rows[rowIndex].cells[cellIndex].innerHTML = element;
          }
        }
        loop++;
      });
      j++;
    });
  }
});

 //===============================================================
 //  登録ボタン押下時に、新規/変更/削除をそれぞれ配列に格納してモーダル表示する関数
 //===============================================================
export function submit(){
  newArray = [];
  updateArray = [];
  deleteArray = [];
  //arrayTdDataのコピー
  let arrayDeleteData = arrayTdData.map(function(arr) {
    return arr.slice();
  });

  newArray.push(arrayThData);
  updateArray.push(arrayThData);
  deleteArray.push(arrayThData);
  
  //現在入力されている値を配列変換
  let array = [];
  //trをループして行取得
  for (let i=2; i<tableObject.rows.length; i++) {
    let arrayRow = [];
    //tdをループ。列取得
    for (let j=0; j<tableObject.rows[i].cells.length; j++) {
      //ID設定
      if(j == 0){
        arrayRow.push(tableObject.rows[i].cells[j].parentNode.dataset.lineId);
      }
      //ID以外設定
      //行番号無しの場合、行番号は無視(lineNumberFlg = 0)
      if(lineNumberFlg == 0 && j == 0){
        continue;
      } else{
        arrayRow.push(tableObject.rows[i].cells[j].innerHTML);
      }
    }
    array.push(arrayRow);
  }

  //arrayのコピー
  let arrayCpy = array.map(function(arr) {
    return arr.slice();
  });


  //更新後が、更新前にあるか確認
  for(let i=0; i<array.length; i++){
    //新規(IDが付与されていない)
    if(array[i][0] == undefined){
      array[i].shift();
      if(lineNumberFlg == 1){
        array[i].shift();
      }
      newArray.push(array[i]);
      continue;
    }
    //更新（初期状態と一致しない）
    let updateFlg = 1;
    for(let j=0; j<arrayTdData.length; j++){
      if(array[i].toString() == arrayTdData[j].toString()){
        updateFlg = 0;
        break;
      }
    }
    if(updateFlg == 1){
      array[i].shift();
      if(lineNumberFlg == 1){
        array[i].shift();
      }
      updateArray.push(array[i]);
    }
  }

  //削除（更新前レコードのIDが更新後に存在しない場合）
  for(let i=0; i<arrayDeleteData.length; i++){
    let deleteFlg = 1;
    for(let j=0; j<arrayCpy.length; j++){
      if(arrayDeleteData[i][0] == arrayCpy[j][0]){
        deleteFlg = 0;
        break;
      }
    }
    if(deleteFlg == 1){
      arrayDeleteData[i].shift();
      if(lineNumberFlg == 1){
        arrayDeleteData[i].shift();
      }
      deleteArray.push(arrayDeleteData[i]);
    }
  }

  //画面描画
  document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('newResult').innerHTML = "";
  document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('updateResult').innerHTML = "";
  document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('deleteResult').innerHTML = "";
  
  if(newArray.length > 1){
    //TABLE描画
    makeTable(newArray,"newResult");
  }
  if(updateArray.length > 1){
    //TABLE描画
    makeTable(updateArray,"updateResult");
  }
  if(deleteArray.length > 1){
    //TABLE描画
    makeTable(deleteArray,"deleteResult");
  }
  //HEADER削除
  newArray.shift();
  updateArray.shift();
  deleteArray.shift();
  let submit_btn2 = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('submit_btn2');
  if(newArray.length == 0 && updateArray.length == 0 && deleteArray.length == 0){
    submit_btn2.disabled = true;
  } else{
    submit_btn2.disabled = false;
  }
  //モーダル表示
  const modal = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('easyModal');
  const buttonClose = document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById('modalClose');
  modal.style.display = 'block';

  //バツ印がクリックされた時
  buttonClose.addEventListener('click', modalClose);
  function modalClose() {
    modal.style.display = 'none';
  }
}

 //===============================================================
 //  DBに変更箇所の情報を送信する関数
 //===============================================================
export function sendAPI(){
  let data = new FormData();
  data.append('MasterId',dbTableId);
  data.append('newArray',JSON.stringify(newArray));
  data.append('updateArray',JSON.stringify(updateArray));
  data.append('deleteArray',JSON.stringify(deleteArray));
  //console.log(...data.entries());

  fetch(uriParamCUD, {
    method: 'POST',
    body: data
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    location.reload();
  })
  .catch((error) => {
    alert("値の投入に失敗しました。正しい値で再度お試しください。");
  });

}

 //===============================================================
 //  登録内容確認画面にて表示するテーブルを構築する関数
 //===============================================================
export function makeTable(data, tableId){
    // 表の作成開始
    var rows=[];
    var table = document.createElement("table");

    // 表に2次元配列の要素を格納
    for(let i = 0; i < data.length; i++){
        rows.push(table.insertRow(-1));  // 行の追加
        for(let j = 0; j < data[0].length; j++){
            let cell = rows[i].insertCell(-1);
            cell.appendChild(document.createTextNode(data[i][j]));
            // 背景色の設定
            if(i==0){
                cell.style.backgroundColor = "#aaffcc"; // ヘッダ行
            }else{
                //cell.style.backgroundColor = "#ddd"; // ヘッダ行以外
            }
        }
    }
    // 指定したdiv要素に表を加える
    document.getElementsByTagName('local-sheet')[0].shadowRoot.getElementById(tableId).appendChild(table);
}

window.lineInsert = lineInsert;
window.lineDelete = lineDelete;
window.submit = submit;
window.sendAPI = sendAPI;
