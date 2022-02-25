 //===============================================================
 //  画面表示部分のJS
 //===============================================================

let localSheetObject;

 //===============================================================
 //  ShadowDOM生成
 //===============================================================
class LocalSheet extends HTMLElement {
  constructor() {
    super();
    //HTMLから分離されたノード(ShadowDOM)を作成（親のドキュメントのCSSなどに影響されない）
    const shadowRoot = this.attachShadow({ mode: 'open' });
    localSheetObject = this;
    shadowRoot.innerHTML = `

<!-- ShadowDOM用css読み込み -->
<link rel="stylesheet" href="./css/local-sheet.css">
<link rel="stylesheet" href="./css/filter.css">

<!-- table構造 -->
<table id="localSheet" style="table-layout:fixed;"">
  <thead id="localSheetThead">
  </thead>
  <tbody id="localSheetTbody">
  </tbody>
</table>

<div id="conmenu" style="display:none">
  <ul>
<!--    <li><a href="#" target="_blank">マニュアルを開く</a></li> -->
    <li onclick="lineInsert()">行挿入</li>
    <li onclick="lineDelete()">行削除</li>
  </ul>
</div>

<p><button id="submit_btn" onclick="submit()">登録</button></p>

<!-- 登録時のモーダルウィンドウ -->
<div id="easyModal" class="modal" style="display:none">
  <div class="modal-content">
    <div class="modal-header">
      <h1>以下の内容で更新します。宜しいですか？</h1>
      <span id="modalClose">×</span>
    </div>
    <div class="modal-body">
      <p>【新規】</p>
      <p id="newResult">【新規】</p>
      <p>【更新】</p>
      <p id="updateResult">【更新】</p>
      <p>【削除】</p>
      <p id="deleteResult">【削除】</p>
      <p id="deleteTable"></p>
      <p><button style="float: right" id="submit_btn2" onclick="sendAPI()">登録</button></p>
      <br>
    </div>
  </div>
</div>

<div id="tableFilter"></div>
`;

  }
}

 //===============================================================
 //  タグで呼び出せるように設定 + 基幹関数実行
 //===============================================================
(function main() {
  // local-sheetという名前でLocalSheetクラスを登録する
  customElements.define("local-sheet", LocalSheet);

  import ("./local-sheet-function.js")
      .then((obj) => {
          // 各モジュールには、引数objのプロパティからアクセスできる。
          obj.localSheetFunction();
      });

})();

