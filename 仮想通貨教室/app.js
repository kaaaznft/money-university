/**
 * CoinGecko API から時価総額 TOP10 を取得して表に描画
 * 取得対象: bitcoin, ethereum, tether, ripple, binancecoin,
 *           solana, usd-coin, tron, dogecoin, cardano
 * 通貨は JPY
 */
const fmtMarketCap   = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 });
const fmtPrice = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:2 });
const ids = [
  'bitcoin','ethereum','tether','ripple','binancecoin',
  'solana','usd-coin','tron','dogecoin','cardano'
];
// sparkline=true で 7 日間の 1h ごとの価格、price_change_percentage=1h,24h を取得
const endpointBase = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=1h,24h`;

let prevRanks = {};
let rankChanges = {};
let cachedData = [];
let currentPeriod = 24; // 1,4,24

async function loadTable(){
  const endpoint = endpointBase;

  try {
    const res  = await fetch(endpoint);
    const data = await res.json();

    // 時価総額順に並んでくるが念のためソート
    data.sort((a,b) => b.market_cap - a.market_cap);

    const tbody = document.getElementById('crypto-table-body');
    tbody.innerHTML = '';
    

    const updatedText = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    document.getElementById('last-updated').textContent = `取得日時: ${updatedText}`;
    // 保存
    const newRanks = Object.fromEntries(data.map((c,i)=>[c.id,i+1]));
    rankChanges = getRankChanges(prevRanks, newRanks);
    prevRanks = newRanks;

    cachedData = data;
renderRows();
  } catch(err){
    console.error('CoinGecko API Error:',err);
    document.getElementById('crypto-table-body').innerHTML = `<tr><td colspan="6">データ取得失敗</td></tr>`;
  }
}

// ---------------- テーブル描画 ----------------
function renderRows(){
  const tbody = document.getElementById('crypto-table-body');
  tbody.innerHTML='';
  cachedData.forEach((coin, idx)=>{
    const row=document.createElement('tr');
    const nameCell=`<img src="${coin.image}" alt="${coin.symbol}" class="icon"> ${coin.name}`;
    const rankChange=rankChanges[coin.id];
    const pct=getPercentChange(coin);
    row.innerHTML=`
      <td>${idx+1} ${getTrendIcon(coin.id,idx+1,rankChange)}</td>
      <td>${nameCell}</td>
      <td>${coin.symbol.toUpperCase()}</td>
      <td>${fmtMarketCap.format(coin.market_cap)}</td>
      <td>${fmtPrice.format(coin.current_price)}</td>
      <td><span class="change-badge ${pct>=0?'up':'down'}">${pct.toFixed(2)}%</span></td>
      <td><button class="explain-btn" data-name="${coin.name}">解説</button></td>`;
    tbody.appendChild(row);
  });
}

// 期間別パーセンテージ取得
function getPercentChange(coin){
  if(currentPeriod===1){
    const val = coin.price_change_percentage_1h_in_currency;
    return (typeof val === 'number' ? val : (coin.price_change_percentage_1h??0));
  }
  if(currentPeriod===24){
    const val = coin.price_change_percentage_24h_in_currency;
    return (typeof val === 'number' ? val : (coin.price_change_percentage_24h??0));
  }
  // 4h 計算
  const prices=coin.sparkline_in_7d?.price;
  if(Array.isArray(prices)&&prices.length>5){
    const latest=prices[prices.length-1];
    const earlier=prices[prices.length-5]; // 4h 前
    return (latest-earlier)/earlier*100;
  }
  return 0;
}
        


function getRankChanges(prevRanks, newRanks) {
  const rankChanges = {};
  Object.keys(newRanks).forEach(id => {
    const prevRank = prevRanks[id];
    const newRank = newRanks[id];
    if (prevRank !== newRank) {
      rankChanges[id] = newRank - prevRank;
    }
  });
  return rankChanges;
}

function getTrendIcon(id, rank, rankChange) {
  if (rankChange > 0) {
    return `<span class="rank-up">↑${rankChange}</span>`;
  } else if (rankChange < 0) {
    return `<span class="rank-down">↓${-rankChange}</span>`;
  } else {
    return '';
  }
}


// 期間選択ボタン
document.getElementById('period-select').addEventListener('click',e=>{
  if(e.target.classList.contains('period-btn')){
    document.querySelectorAll('.period-btn').forEach(btn=>btn.classList.remove('active'));
    e.target.classList.add('active');
    currentPeriod=parseInt(e.target.dataset.period,10);
    const header=document.getElementById('period-header');
    header.textContent=`${currentPeriod}h%`;
    if(cachedData.length) renderRows();
  }
});

// 初回ロード
loadTable();
// 5 分ごとに更新
setInterval(loadTable, 300000);

// ---------------- ネットワーク手数料 ----------------
async function loadFees(){
  try{
    // Etherscan Gas Oracle API (no key needed for basic):
    const r = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
    const j = await r.json();
    if(j.status==='1'){
      const fast = j.result.FastGasPrice;
      const propose = j.result.ProposeGasPrice;
      const safe = j.result.SafeGasPrice;
      document.getElementById('fees').innerHTML = `Ethereum Gas &nbsp; <span class="gas fast">Fast ${fast}</span><span class="gas normal">Normal ${propose}</span><span class="gas safe">Safe ${safe}</span>`;
    }
  }catch(e){console.error('Fee fetch error',e);}
}
loadFees();
setInterval(loadFees, 300000);

// ---------------- モーダル処理 ----------------
const explanations = {
  'Bitcoin': `
    <h3>1. ビットコイン（BTC）とは</h3>
    <ul>
      <li><strong>完全にインターネット上だけに存在する通貨</strong>で、紙幣や硬貨はありません。</li>
      <li>国家や企業が管理しない<strong>分散型システム</strong>で、世界中のノードが取引履歴を共同保管します。</li>
      <li>2008 年に “Satoshi Nakamoto” 名義の論文、2009 年に稼働開始。</li>
    </ul>
    <h3>2. 技術のしくみ（超要約）</h3>
    <table>
      <thead><tr><th>概念</th><th>役割</th><th>初心者向けイメージ</th></tr></thead>
      <tbody>
        <tr><td>ブロックチェーン</td><td>10 分ごとにまとめた取引帳簿</td><td><strong>時系列で改ざんできない会計ソフト</strong></td></tr>
        <tr><td>マイニング</td><td>新しいブロックを作る計算競争</td><td><strong>クイズに正解したら報酬がもらえる</strong></td></tr>
        <tr><td>半減期</td><td>21 万ブロックごとに報酬が半分</td><td><strong>4 年ごとに給料が半分になる仕組み</strong></td></tr>
      </tbody></table>
    <p>最新の半減期は <strong>2024-04-20</strong> 頃に発生し、報酬は <strong>6.25 BTC → 3.125 BTC</strong> に。</p>
    <h3>3. いまの基礎データ（2025-06-28 時点）</h3>
    <ul>
      <li>発行済み枚数：約 <strong>1,988 万 BTC</strong>（総上限 2,100 万 BTC の約 95 %）</li>
      <li>時価総額：<strong>約 2.13 兆 USD</strong></li>
      <li><strong>1,437 万 BTC</strong> は長期保有者が保有し流通しにくい</li>
    </ul>
    <h3>4. 主な特徴</h3>
    <ul>
      <li>希少性 – 発行上限 2,100 万 BTC で増刷なし</li>
      <li>パーミッションレス – 誰でも送受金可</li>
      <li>オープン台帳 – 改ざん困難な公開取引履歴</li>
      <li>24 時間グローバル – 休場無しで取引</li>
      <li>プログラマビリティ – 多重署名や時間指定送金等が可能</li>
    </ul>
    <h3>5. 取得と保管の流れ</h3>
    <ol>
      <li>取引所で購入（例: コインチェック, bitFlyer）</li>
      <li>ウォレットに送金（オンライン型 / ハードウェア型）</li>
      <li>秘密鍵を絶対に他人に教えない</li>
    </ol>
    <h3>6. ユースケース例</h3>
    <ul>
      <li>デジタルゴールドとして長期保有（HODL）</li>
      <li>海外送金</li>
      <li>寄付・クラウドファンディング</li>
      <li>Lightning Network による少額即時決済</li>
    </ul>
    <h3>7. リスクと注意点</h3>
    <ul>
      <li>価格変動が極端</li>
      <li>秘密鍵の紛失・漏洩</li>
      <li>規制の変化</li>
      <li>詐欺・フィッシング</li>
    </ul>
    <h3>8. 初心者への 3 つのアドバイス</h3>
    <ol>
      <li>少額から始め取引所操作に慣れる</li>
      <li>ウォレット → 送受金 → 取引 の順で学習</li>
      <li>ニュースやアップデートは一次情報で確認</li>
    </ol>
  `,
  'Ethereum': `
    <h3>1. イーサリアム（ETH）とは</h3>
    <ul>
      <li><strong>スマートコントラクト</strong>という“自動で実行されるプログラム”をブロックチェーン上で動かせる、世界初の <strong>汎用プラットフォーム</strong>。</li>
      <li>通貨単位 <strong>Ether（ETH）</strong> は、ガス支払い・ステーク・担保など多用途。</li>
      <li>2015 年公開。現在は DeFi、NFT、ゲームなど数万の dApp が稼働。</li>
    </ul>
    <h3>2. しくみ（超要約）</h3>
    <table>
      <thead><tr><th>概念</th><th>役割</th><th>初心者向けイメージ</th></tr></thead>
      <tbody>
        <tr><td><strong>EVM</strong></td><td>スマートコントラクトを実行する仮想マシン</td><td>“世界共通のクラウド PC”</td></tr>
        <tr><td><strong>Gas</strong></td><td>EVM を動かす手数料（ETH で支払い）</td><td>“電気料金”</td></tr>
        <tr><td><strong>Proof-of-Stake</strong></td><td>コインを預けたバリデータが取引を承認</td><td>“預金額が多い順で検針”</td></tr>
        <tr><td><strong>Layer-2</strong></td><td>取引を束ねて L1 に戻す拡張策</td><td>“高速道路で渋滞回避”</td></tr>
      </tbody>
    </table>
    <h3>3. 基礎データ（2025-06-29）</h3>
    <ul>
      <li>循環供給量: <strong>約 1.207 億 ETH</strong></li>
      <li>時価総額: <strong>約 2,970 億 USD</strong></li>
      <li>価格: <strong>2,430 USD／ETH</strong></li>
    </ul>
    <h3>4. 主なアップグレード年表</h3>
    <table>
      <thead><tr><th>年月</th><th>名称</th><th>影響</th></tr></thead>
      <tbody>
        <tr><td>2022-09-15</td><td><strong>The Merge</strong></td><td>PoW → PoS、電力消費▲99 %</td></tr>
        <tr><td>2023-04-12</td><td><strong>Shanghai / Shapella</strong></td><td>ステーク ETH の出金解禁</td></tr>
        <tr><td>2024-03-13</td><td><strong>Dencun</strong></td><td>手数料大幅削減（proto-danksharding）</td></tr>
      </tbody>
    </table>
    <h3>5. ETH の特徴</h3>
    <ul>
      <li><strong>プログラマビリティ</strong> – Solidity で独自トークンやアプリを発行</li>
      <li><strong>DeFi 基盤</strong> – Aave, Uniswap など主要プロトコルが稼働</li>
      <li><strong>NFT 標準</strong> – ERC-721/1155 によるデジタル所有権</li>
      <li><strong>ステーキング利回り</strong> – APR 3-4 % 程度</li>
      <li><strong>L2 エコシステム</strong> – Arbitrum, Optimism でガスが 1/100 以下</li>
    </ul>
    <h3>6. 取得・活用の流れ</h3>
    <ol>
      <li>国内取引所で少額購入 → 自己管理ウォレットへ送金</li>
      <li>保有 / ステーク / dApp 利用を選択</li>
    </ol>
    <h3>7. リスクと注意点</h3>
    <ul>
      <li>手数料変動 – 混雑時は数十 USD</li>
      <li>スマートコントラクトの脆弱性</li>
      <li>規制動向 – ステーキング課税や証券扱い議論</li>
      <li>鍵管理 – 秘密鍵流出は資産即失</li>
    </ul>
    <h3>8. 初心者への 3 ステップ</h3>
    <ol>
      <li>ウォレット作成 → 少額入金 → 送受信テスト</li>
      <li>L2 へブリッジして dApp 体験</li>
      <li>アップグレード情報やガス代を一次情報で確認</li>
    </ol>
  `,
  'Tether': `
    <h3>1. USDT（Tether）とは</h3>
    <ul>
      <li><strong>米ドルと 1:1 で価値を連動</strong>させる法定通貨担保型ステーブルコイン。</li>
      <li>発行体 <strong>Tether Holdings Ltd.</strong> が保有する準備資産と引き換えに発行・償還。</li>
      <li>流通量・シェアともに最大級のステーブルコイン。</li>
    </ul>
    <h3>2. 仕組み：どのように「1ドル」を保つのか</h3>
    <table>
      <thead><tr><th>概念</th><th>初心者向けイメージ</th><th>補足</th></tr></thead>
      <tbody>
        <tr><td><strong>発行・償還</strong></td><td>預けたドルと引き換えに USDT を発行 / 返却</td><td>個人は主に取引所経由で売買</td></tr>
        <tr><td><strong>準備資産</strong></td><td>“金庫にあるドル建て資産”</td><td>2025 Q1 時点で資産 149.3B USD・負債 143.6B USD</td></tr>
        <tr><td><strong>主要保有先</strong></td><td>米国短期国債が約 8 割</td><td>保有額は独立国上位並み</td></tr>
        <tr><td><strong>マルチチェーン発行</strong></td><td>Tron・Ethereum など複数ネット</td><td>手数料や速度を重視して選択可能</td></tr>
      </tbody>
    </table>
    <h3>3. 最新の基礎データ（2025-06-29）</h3>
    <ul>
      <li>総発行量: <strong>約 156.1 B USDT</strong></li>
      <li>市場シェア: <strong>約 62 %</strong>（ステーブル市場 253B USD）</li>
      <li>チェーン別内訳: Tron ≥ 80B / Ethereum ≈ 73B</li>
    </ul>
    <h3>4. 主な特徴</h3>
    <ul>
      <li><strong>価格安定性</strong> – 取引所や DeFi で基軸通貨として機能</li>
      <li><strong>マルチチェーン</strong> – Tron は低手数料、Ethereum は DeFi 接続性</li>
      <li><strong>流動性</strong> – 厚いオーダーブックで約定しやすい</li>
      <li><strong>裏付け資産の利回り</strong> – 米国債利息が Tether 社収益に</li>
    </ul>
    <h3>5. 取得と利用の流れ</h3>
    <ol>
      <li>国内/海外取引所で購入</li>
      <li>ウォレットへ送金（TRC20 / ERC20）</li>
      <li>トレード待避先・海外送金・DeFi 運用などに活用</li>
    </ol>
    <h3>6. リスクと議論点</h3>
    <ul>
      <li><strong>規制強化</strong> – GENIUS Act などの動向</li>
      <li><strong>信用リスク</strong> – 償還ラッシュで 1USDT &lt; 1USD の乖離懸念</li>
      <li><strong>透明性への批判</strong> – リアルタイム監査ではない</li>
      <li><strong>チェーン依存</strong> – Tron/Ethereum の障害影響</li>
      <li><strong>アドレス凍結</strong> – 法執行要請によるブラックリスト事例</li>
    </ul>
    <h3>7. 初心者への 3 ステップ</h3>
    <ol>
      <li>少額で購入し送受金テスト</li>
      <li>DeFi のセービング商品で利回り体験</li>
      <li>準備資産報告や規制ニュースを定期チェック</li>
    </ol>
  `,
  'XRP': `
    <h3>1. XRP（エックスアールピー）とは</h3>
    <ul>
      <li><strong>国際送金に特化</strong>した XRP Ledger (XRPL) のネイティブ通貨。</li>
      <li>平均 3–5 秒で確定、手数料 0.0002 USD 相当で高速・低コスト送金。</li>
      <li>SWIFT よりも迅速かつ安価なブリッジ通貨として機能。</li>
    </ul>
    <h3>2. 技術のしくみ（かみ砕きイメージ）</h3>
    <table>
      <thead><tr><th>概念</th><th>役割</th><th>初心者向けイメージ</th></tr></thead>
      <tbody>
        <tr><td><strong>XRPL</strong></td><td>取引台帳 + 分散合意</td><td>“世界中で同期する家計簿”</td></tr>
        <tr><td><strong>RPCA</strong></td><td>3–5 秒ごとに取引承認</td><td>“毎数秒の多数決”</td></tr>
        <tr><td><strong>Escrow</strong></td><td>Ripple 保有 XRP を月次ロック解除</td><td>“分割払いで市場に出る仕組み”</td></tr>
        <tr><td><strong>ODL</strong></td><td>銀行間の即時 FX 決済</td><td>“両替をワンプッシュで完了”</td></tr>
      </tbody>
    </table>
    <h3>3. 基礎データ（2025-06-29）</h3>
    <ul>
      <li>価格: <strong>2.18 USD / XRP</strong></li>
      <li>時価総額: <strong>約 1,290 億 USD</strong></li>
      <li>循環供給量: <strong>約 590 億 XRP</strong></li>
      <li>時価総額ランキング: <strong>4 位</strong></li>
    </ul>
    <h3>4. 主なユースケース</h3>
    <ul>
      <li><strong>国際送金 (ODL)</strong> – XRP をブリッジに 3 秒決済、ノストロ口座不要。</li>
      <li><strong>マイクロペイメント</strong> – 秒課金型動画・ゲーム等。</li>
      <li><strong>トークン化</strong> – 金融資産のトークン発行基盤。</li>
      <li><strong>DeFi / dNFT</strong> – AMM・オラクル・dNFT が整備。</li>
    </ul>
    <h3>5. 最近のニュース</h3>
    <ul>
      <li><strong>XRPL v2.5.0（2025-06-24）</strong> – dNFT 対応など複数改良。</li>
      <li><strong>SEC 訴訟終局へ前進（2025-06-27）</strong> – 双方の控訴断念報道。</li>
    </ul>
    <h3>6. メリットとリスク</h3>
    <table>
      <thead><tr><th>観点</th><th>ポジティブ</th><th>リスク</th></tr></thead>
      <tbody>
        <tr><td>スピード・コスト</td><td>3–5 秒決済・低コスト</td><td>—</td></tr>
        <tr><td>環境負荷</td><td>PoW 不要で省電力</td><td>—</td></tr>
        <tr><td>価格安定性</td><td>BTC や ETH よりボラ小</td><td>市場全体下落時は連動</td></tr>
        <tr><td>中央集権性</td><td>企業連携が進みやすい</td><td>Ripple の大量保有が売り圧懸念</td></tr>
        <tr><td>規制面</td><td>訴訟終結で米リスク軽減</td><td>完全決着までは変更リスク</td></tr>
      </tbody>
    </table>
    <h3>7. 初心者への 3 ステップ</h3>
    <ol>
      <li>国内取引所で少額購入（ビットバンク等）。</li>
      <li>ウォレットに送金して操作確認（Xumm 等）。</li>
      <li>ODL 送金や XRPL DEX を体験。</li>
    </ol>
    <p>&nbsp;</p>
    <p><strong>まとめ:</strong> XRP は速さ・低コスト・エコを武器に国際送金を刷新する資産です。エスクローと訴訟動向を理解し、必要額を安全管理しながら活用してみましょう。</p>
  `,
  'BNB': `
    <h3>1. BNB（旧称：Binance Coin）とは</h3>
    <ul>
      <li>大手取引所 <strong>Binance</strong> が 2017 年に発行したユーティリティ／ガバナンストークン。</li>
      <li><strong>BNB Chain</strong>（EVM 互換 L1）でのガス通貨として数千 dApp を支える。</li>
    </ul>
    <h3>2. 基礎データ（2025-06-29）</h3>
    <ul>
      <li>価格: <strong>649 USD／BNB</strong></li>
      <li>時価総額: <strong>約 914 億 USD</strong></li>
      <li>循環供給量: <strong>140,885,526 BNB</strong></li>
      <li>総供給上限: 自動バーンで <strong>1 億 BNB</strong> まで減少予定</li>
    </ul>
    <h3>3. トークノミクス &amp; バーン</h3>
    <table>
      <thead><tr><th>メカニズム</th><th>仕組み</th><th>初心者向けポイント</th></tr></thead>
      <tbody>
        <tr><td><strong>Auto-Burn</strong></td><td>四半期ごとに価格とブロック数で焼却量を自動計算</td><td>“売上連動の自社株買い”</td></tr>
        <tr><td><strong>Pioneer Burn</strong></td><td>誤送金補填と同額を追加バーン</td><td>ユーザー保護とバーンを両立</td></tr>
        <tr><td><strong>目標供給</strong></td><td>最終的に 1 億 BNB で固定</td><td>希少性アップ</td></tr>
      </tbody>
    </table>
    <p>直近 29 回目（2024-11-01）に <strong>1.77M BNB ≈ 10.7 億 USD</strong> を焼却。</p>
    <h3>4. BNB Chain エコシステム</h3>
    <table>
      <thead><tr><th>レイヤー</th><th>説明</th><th>2024-25 年の動き</th></tr></thead>
      <tbody>
        <tr><td><strong>BNB Smart Chain</strong></td><td>EVM L1（PoSA 21 バリデータ）</td><td>月間 dApp アクティブ 160 万超</td></tr>
        <tr><td><strong>opBNB</strong></td><td>Optimistic Rollup L2</td><td>最大 10 万 TPS、ガス数円で急成長</td></tr>
        <tr><td><strong>BNB Greenfield</strong></td><td>分散型ストレージ L1</td><td>2025-06 メインネット稼働</td></tr>
        <tr><td><strong>Beacon Chain</strong></td><td>旧ガバナンス用チェーン</td><td>2024-11-19 サンセット</td></tr>
      </tbody>
    </table>
    <h3>5. ユースケース例</h3>
    <ul>
      <li><strong>取引所手数料割引</strong> – Binance で最大 25% OFF</li>
      <li><strong>ガス支払い</strong> – BSC/opBNB で送金や DeFi が数円</li>
      <li><strong>ステーキング</strong> – 年率 4–7% （目安）</li>
      <li><strong>参加チケット</strong> – IEO や NFT ミント参加</li>
      <li><strong>バーン連動の資産性</strong> – 焼却で希少性向上</li>
    </ul>
    <h3>6. 最近のトピック（2025 上期）</h3>
    <ul>
      <li>2024-11-19 – Beacon Chain サンセット（Fusion 完了）</li>
      <li>2025-04-21 – 30 回目 Auto-Burn 実施（約 1.6M BNB）</li>
      <li>2025-05-29 – RWA インセンティブプログラム開始</li>
      <li>2025-06-24 – Nano Labs が 10 億 USD 相当 BNB 買付表明</li>
    </ul>
    <h3>7. リスクと留意点</h3>
    <ul>
      <li><strong>中央集権リスク</strong> – Binance の規制問題が価格に直結</li>
      <li><strong>セキュリティ</strong> – 過去に大型ハッキング例</li>
      <li><strong>バリデータ数</strong> – PoSA 21 ノードで検閲耐性は低め</li>
      <li><strong>規制動向</strong> – 取引所ライセンスや証券判断が流動的</li>
    </ul>
    <h3>8. 初心者向け 3 ステップ</h3>
    <ol>
      <li>ウォレットを用意（Trust Wallet / Ledger 等）</li>
      <li>国内取引所で少額購入 → 自己保管 → 送受金テスト</li>
      <li>BSC → opBNB を体験（PancakeSwap など）</li>
    </ol>
  `,
  'Solana': `
    <h3>1. SOL（ソラナ）とは</h3>
    <ul>
      <li><strong>超高速・低コスト</strong>の L1 ブロックチェーンのネイティブ通貨。</li>
      <li>独自 <strong>PoH + PoS</strong> と並列実行エンジン Sealevel で高性能。</li>
      <li>DeFi・NFT・ゲーム・決済・RWA など用途が拡大。</li>
    </ul>
    <h3>2. 基礎データ（2025-06-29）</h3>
    <ul>
      <li>価格: <strong>151.29 USD／SOL</strong></li>
      <li>時価総額: <strong>約 80.95 B USD</strong></li>
      <li>循環供給量: <strong>約 534.48 M SOL</strong></li>
      <li>取引確定: ≈0.4 秒（ブロック）</li>
      <li>平均手数料: &lt;0.0002 USD</li>
    </ul>
    <h3>3. ネットワーク仕組み（超要約）</h3>
    <table>
      <thead><tr><th>概念</th><th>役割</th><th>イメージ</th></tr></thead>
      <tbody>
        <tr><td>PoH タイムスタンプ</td><td>順序固定・高スループット</td><td>時刻入り伝票</td></tr>
        <tr><td>PoS バリデータ</td><td>ブロック提案・投票</td><td>株主議決権</td></tr>
        <tr><td>Sealevel</td><td>並列スマコン実行</td><td>マルチコア CPU</td></tr>
      </tbody>
    </table>
    <h3>4. ネットワークヘルス</h3>
    <ul>
      <li>連続稼働 <strong>16 か月無停止</strong></li>
      <li>バリデータ 1,295、ナカモト係数 20</li>
      <li>復旧時間 &lt;5 時間（標準化後）</li>
    </ul>
    <h3>5. 主要アップグレード（2024-25）</h3>
    <ul>
      <li>2024-12 – <strong>Token Extensions</strong> で高機能トークン</li>
      <li>2025-04 – <strong>Frankendancer</strong> C++ クライアント稼働</li>
      <li>2025 内 – <strong>Firedancer</strong> 本番、1M TPS テスト達成</li>
    </ul>
    <h3>6. エコシステム例</h3>
    <ul>
      <li>DEX: Jupiter, Orca</li>
      <li>NFT: Magic Eden（圧縮 NFT ≈1¢）</li>
      <li>RWA: PYUSD など米ドルステーブル</li>
      <li>GameFi / DePIN: Star Atlas, Helium</li>
    </ul>
    <h3>7. トークノミクス</h3>
    <ul>
      <li>インフレ率 5% → 段階的に 1.5% へ</li>
      <li>約 75% の SOL がステーク済み（報酬 ≈7%）</li>
    </ul>
    <h3>8. 入手と利用フロー</h3>
    <ol>
      <li>国内取引所で少額購入 → ウォレット（Phantom 等）へ移動</li>
      <li>DEX スワップ / NFT ミントで速度・手数料体験</li>
      <li>ウォレットでステーキング委任（0.01 SOL〜）</li>
    </ol>
    <h3>9. リスクと注意点</h3>
    <ul>
      <li>大量トラフィック時の遅延リスク</li>
      <li>バリデータ地理集中 → DoubleZero 構想で改善予定</li>
      <li>規制動向（RWA・ステーブル発行）に注意</li>
    </ul>
    <h3>10. 3 ステップまとめ</h3>
    <ol>
      <li>ウォレット作成 → 0.1 SOL 送金</li>
      <li>DEX / NFT で“速さと安さ”体感</li>
      <li>Health Report と Firedancer 進捗を定期確認</li>
    </ol>
  `,
  'USD Coin': `
    <h3>1. USDC（USD Coin）とは</h3>
    <ul>
      <li><strong>米ドルと常に 1:1 で価値連動</strong>する、Circle 発行の法定通貨担保型ステーブルコイン。</li>
      <li>発行・償還は <strong>1 USDC ⇄ 1 USD</strong> で Circle Mint 口座を介して行われ、同額の現金・米国短期国債を準備資産に計上。</li>
    </ul>
    <h3>2. しくみと準備資産</h3>
    <table>
      <thead><tr><th>仕組み</th><th>初心者向けイメージ</th></tr></thead>
      <tbody>
        <tr><td>Mint / Burn</td><td>ドル ↔︎ USDC の自動両替所</td></tr>
        <tr><td>100 % 裏付け</td><td>キャッシュ &lt;3 ヵ月米国債のみ、Deloitte 月次アテステ</td></tr>
        <tr><td>マルチチェーン</td><td>23 の L1/L2 でネイティブ発行、CCTP で安全ブリッジ</td></tr>
      </tbody>
    </table>
    <h3>3. 最新指標（2025-06-29）</h3>
    <ul>
      <li>流通量: <strong>約 61.6 B USDC</strong></li>
      <li>時価総額: <strong>≈ 61.7 B USD</strong></li>
      <li>24h 出来高: <strong>≈ 3.9 B USD</strong></li>
      <li>対応チェーン数: <strong>23</strong></li>
    </ul>
    <h3>4. マルチチェーン展開ポイント</h3>
    <ul>
      <li>主要残高: Ethereum / Solana / Base</li>
      <li>2025-06-12 – XRP Ledger でネイティブ発行開始</li>
      <li>CCTP でネイティブ同士を焼却・再発行しブリッジリスク低減</li>
    </ul>
    <h3>5. 主なユースケース</h3>
    <ul>
      <li>取引所の基軸通貨で建値が分かりやすい</li>
      <li>ドル建て送金 – 手数料は数十円、規制面で安心感</li>
      <li>DeFi / GameFi のレンディング・LP・決済原資</li>
      <li>法人決済 – Stripe / Visa 連携で 24/7 即時決済</li>
    </ul>
    <h3>6. 規制・コンプライアンス動向</h3>
    <table>
      <thead><tr><th>地域</th><th>状況</th><th>影響</th></tr></thead>
      <tbody>
        <tr><td>EU</td><td>MiCA 要件クリアし登録完了</td><td>USDT 退場で USDC 採用加速</td></tr>
        <tr><td>米国</td><td>GENIUS Act で準備資産米金融機関保管を義務化予定</td><td>USDC は要件をほぼ充足</td></tr>
        <tr><td>IPO</td><td>Circle が NYSE 上場準備</td><td>公開企業化で透明性強化</td></tr>
      </tbody>
    </table>
    <h3>7. メリットまとめ</h3>
    <ul>
      <li><strong>完全準備 &amp; 月次監査</strong> で高い透明性</li>
      <li><strong>規制順守</strong> – MiCA / Covered Stablecoin 認定</li>
      <li><strong>クロスチェーン低リスク</strong> – ネイティブ発行 + CCTP</li>
    </ul>
    <h3>8. リスクと注意点</h3>
    <ul>
      <li>中央集権 – Circle にブラックリスト権限</li>
      <li>金利依存 – 利息収入が主収益、金利低下リスク</li>
      <li>償還ラッシュ時の一時乖離リスク</li>
    </ul>
    <h3>9. 初心者への 3 ステップ</h3>
    <ol>
      <li>取引所で 50 USDC を購入しウォレット送金</li>
      <li>DeFi セービングに小額預け利回りとリスクを学習</li>
      <li>規制ニュースと Circle 月次報告を定点チェック</li>
    </ol>
  `,
  'USDC': `
    <h3>1. USDC（USD Coin）とは</h3>
    <ul>
      <li><strong>米ドルと常に 1:1 で価値連動</strong>する、Circle 発行の法定通貨担保型ステーブルコイン。</li>
      <li>発行・償還は <strong>1 USDC ⇄ 1 USD</strong> で Circle Mint 口座を介して行われ、同額の現金・米国短期国債を準備資産に計上。</li>
    </ul>
    <h3>2. しくみと準備資産</h3>
    <table>
      <thead><tr><th>仕組み</th><th>初心者向けイメージ</th></tr></thead>
      <tbody>
        <tr><td>Mint / Burn</td><td>ドル ↔︎ USDC の自動両替所</td></tr>
        <tr><td>100 % 裏付け</td><td>キャッシュ &lt;3 ヵ月米国債のみ、Deloitte 月次アテステ</td></tr>
        <tr><td>マルチチェーン</td><td>23 の L1/L2 でネイティブ発行、CCTP で安全ブリッジ</td></tr>
      </tbody>
    </table>
    <h3>3. 最新指標（2025-06-29）</h3>
    <ul>
      <li>流通量: <strong>約 61.6 B USDC</strong></li>
      <li>時価総額: <strong>≈ 61.7 B USD</strong></li>
      <li>24h 出来高: <strong>≈ 3.9 B USD</strong></li>
      <li>対応チェーン数: <strong>23</strong></li>
    </ul>
    <h3>4. マルチチェーン展開ポイント</h3>
    <ul>
      <li>主要残高: Ethereum / Solana / Base</li>
      <li>2025-06-12 – XRP Ledger でネイティブ発行開始</li>
      <li>CCTP でネイティブ同士を焼却・再発行しブリッジリスク低減</li>
    </ul>
    <h3>5. 主なユースケース</h3>
    <ul>
      <li>取引所の基軸通貨で建値が分かりやすい</li>
      <li>ドル建て送金 – 手数料は数十円、規制面で安心感</li>
      <li>DeFi / GameFi のレンディング・LP・決済原資</li>
      <li>法人決済 – Stripe / Visa 連携で 24/7 即時決済</li>
    </ul>
    <h3>6. 規制・コンプライアンス動向</h3>
    <table>
      <thead><tr><th>地域</th><th>状況</th><th>影響</th></tr></thead>
      <tbody>
        <tr><td>EU</td><td>MiCA 要件クリアし登録完了</td><td>USDT 退場で USDC 採用加速</td></tr>
        <tr><td>米国</td><td>GENIUS Act で準備資産米金融機関保管を義務化予定</td><td>USDC は要件をほぼ充足</td></tr>
        <tr><td>IPO</td><td>Circle が NYSE 上場準備</td><td>公開企業化で透明性強化</td></tr>
      </tbody>
    </table>
    <h3>7. メリットまとめ</h3>
    <ul>
      <li><strong>完全準備 &amp; 月次監査</strong> で高い透明性</li>
      <li><strong>規制順守</strong> – MiCA / Covered Stablecoin 認定</li>
      <li><strong>クロスチェーン低リスク</strong> – ネイティブ発行 + CCTP</li>
    </ul>
    <h3>8. リスクと注意点</h3>
    <ul>
      <li>中央集権 – Circle にブラックリスト権限</li>
      <li>金利依存 – 利息収入が主収益、金利低下リスク</li>
      <li>償還ラッシュ時の一時乖離リスク</li>
    </ul>
    <h3>9. 初心者への 3 ステップ</h3>
    <ol>
      <li>取引所で 50 USDC を購入しウォレット送金</li>
      <li>DeFi セービングに小額預け利回りとリスクを学習</li>
      <li>規制ニュースと Circle 月次報告を定点チェック</li>
    </ol>
  `,
  'TRON': `
    <h3>1. TRON（TRX）とは</h3>
    <ul>
      <li><strong>高速・低手数料</strong>のスマートコントラクト対応 L1。</li>
      <li>Delegated Proof-of-Stake (DPoS) で 27 SR が数秒でブロック生成。</li>
      <li>クリエイターが DApp／コンテンツを収益化しやすい設計。</li>
    </ul>
    <h3>2. しくみ（かみ砕きイメージ）</h3>
    <table>
      <thead><tr><th>概念</th><th>役割</th><th>初心者向けイメージ</th></tr></thead>
      <tbody>
        <tr><td>DPoS + SR 投票</td><td>TRX 投票で SR 選出＆報酬</td><td>町内会で代表を選び利益を山分け</td></tr>
        <tr><td>Energy / Bandwidth</td><td>TRX 凍結で無料ガス枠</td><td>先払いデータ通信量</td></tr>
        <tr><td>Burn &amp; Mint</td><td>手数料は焼却・報酬は発行</td><td>使うと減り守ると増える</td></tr>
      </tbody>
    </table>
    <h3>3. 基礎データ（2025-06-29）</h3>
    <ul>
      <li>価格: <strong>0.275 USD／TRX</strong></li>
      <li>時価総額: <strong>≈ 26.1 B USD</strong></li>
      <li>循環供給量: <strong>≈ 94.8 B TRX</strong></li>
      <li>24h 取引高: <strong>≈ 315 M USD</strong></li>
    </ul>
    <p><em>供給ダイナミクス:</em> 1 日あたり約 5.06 M TRX が新規発行される一方、手数料焼却が上回る日が増え <strong>実質デフレ傾向</strong>。</p>
    <h3>4. エコシステムの特徴</h3>
    <ul>
      <li>ステーブルコイン: TRC20-USDT 残高 80 B USDT（チェーン最大シェア）</li>
      <li>DeFi: JustLend, SunSwap など TVL ≈4.3 B USD</li>
      <li>クロスチェーン: BTTC 2.0 で安全な資産移動を計画</li>
      <li>トレンド: TRX ステーキング付き ETF 申請中</li>
    </ul>
    <h3>5. 最近のアップグレード &amp; ロードマップ</h3>
    <ul>
      <li>2025-04-29 GreatVoyage-v4.8.0 (Kant) – EIP-4844 準拠で手数料最適化</li>
      <li>2025 ロードマップ: ZK-EVM、分散ストレージ統合、BTTC 2.0</li>
    </ul>
    <h3>6. ステーキング（投票）の目安</h3>
    <table>
      <thead><tr><th>方法</th><th>想定 APR</th><th>メモ</th></tr></thead>
      <tbody>
        <tr><td>公式 SR への委任</td><td>≈3–5 %</td><td>TronLink → 投票で 1 TRX から</td></tr>
        <tr><td>CEX 固定プラン</td><td>〜20 %</td><td>高利率はロック条件あり、要リスク確認</td></tr>
      </tbody>
    </table>
    <h3>7. リスクと注意点</h3>
    <ul>
      <li>中央集権性 – SR 27 名、創業者の影響大</li>
      <li>規制動向 – 2025-05 に SEC 訴訟停止も再開余地</li>
      <li>USDT 依存 – Tether リスクの影響</li>
      <li>ブリッジ – BTTC はハッキング歴あり</li>
    </ul>
    <h3>8. 初心者向け 3 ステップ</h3>
    <ol>
      <li>TronLink などウォレット作成</li>
      <li>少額購入 → TRC20 送金で手数料体感</li>
      <li>SR 投票ステーキング &amp; USDT 送金を試す</li>
    </ol>
  `,
  'TRX': `同上`,
  'Dogecoin': `
    <h3>1. DOGE（ドージコイン）とは</h3>
    <ul>
      <li>2013 年にジョークとして誕生した <strong>ライトコイン系 P2P 暗号資産</strong>。</li>
      <li>Scrypt-PoW + ライトコイン<strong>マージマイニング</strong>で 1 分ごとにブロック生成。</li>
      <li>ブロック報酬 <strong>10,000 DOGE</strong> 固定、毎年 5 B DOGE が発行。</li>
    </ul>
    <h3>2. 基礎データ（2025-06-29）</h3>
    <ul>
      <li>価格: <strong>0.1647 USD／DOGE</strong></li>
      <li>時価総額: <strong>約 24.7 B USD</strong></li>
      <li>循環供給量: <strong>約 149.9 B DOGE</strong></li>
      <li>年間新規発行: 5 B DOGE（≈3.3 % インフレ）</li>
    </ul>
    <h3>3. 技術しくみ（ざっくり）</h3>
    <table>
      <thead><tr><th>コンポーネント</th><th>役割</th><th>イメージ</th></tr></thead>
      <tbody>
        <tr><td>Scrypt-PoW</td><td>計算競争でブロック生成</td><td>クイズに正解でコイン</td></tr>
        <tr><td>Merged Mining</td><td>LTC 同時採掘で安全性強化</td><td>同じ作業で 2 給料</td></tr>
        <tr><td>固定報酬</td><td>10k DOGE/分供給</td><td>毎分 1 万枚印刷</td></tr>
      </tbody>
    </table>
    <h3>4. ユースケース</h3>
    <ul>
      <li>少額決済・チップ – Reddit/Twitch 文化</li>
      <li>eコマース – Tesla 公式グッズ決済対応</li>
      <li>X 決済構想 – 2025 公開予定 “X Money”</li>
      <li>慈善活動 – ボブスレー代表支援など</li>
    </ul>
    <h3>5. 最近ニュース</h3>
    <ul>
      <li>2024-12 Dogecoin Core v1.14.9 公開</li>
      <li>2025-06-26 価格反発、X 決済期待</li>
    </ul>
    <h3>6. リスク</h3>
    <ul>
      <li>価格変動 – ミームで急騰/急落</li>
      <li>集中保有 – 上位 20 アドレス ≈45 %</li>
      <li>インフレ – 毎年 5 B DOGE 供給</li>
      <li>人物依存 – 著名人発言の影響大</li>
    </ul>
    <h3>7. 初心者 3 ステップ</h3>
    <ol>
      <li>取引所で購入 → Core ウォレットへ送金</li>
      <li>Reddit でチップ or Tesla で小物決済</li>
      <li>Core 最新版 &amp; X 決済ニュースを確認</li>
    </ol>
  `,
  'DOGE': `同上`,
  'Cardano': `
    <h3>1. ADA（Cardano）とは</h3>
    <ul>
      <li>科学的アプローチで設計された <strong>第 3 世代ブロックチェーン</strong>（2017 メインネット）。</li>
      <li>ネイティブ通貨 <strong>ADA</strong> は手数料・ステーキング報酬・ガバナンスに使用。</li>
    </ul>
    <h3>2. 基礎データ（2025-06-29）</h3>
    <ul>
      <li>価格: <strong>≈ 0.56 USD／ADA</strong></li>
      <li>時価総額: <strong>≈ 19.9 B USD</strong></li>
      <li>循環供給量: <strong>35.4 B / 45 B ADA</strong></li>
    </ul>
    <h3>3. 技術しくみ</h3>
    <table>
      <thead><tr><th>コンポーネント</th><th>役割</th><th>イメージ</th></tr></thead>
      <tbody>
        <tr><td>Ouroboros PoS</td><td>ステーク量でブロック生成</td><td>預金が多い順に当番</td></tr>
        <tr><td>eUTXO</td><td>スマート機能付き UTXO</td><td>BTC 財布に拡張機能</td></tr>
        <tr><td>マルチアセット</td><td>L1 でトークン発行</td><td>ERC-20 を標準装備</td></tr>
        <tr><td>Hydra Head</td><td>L2 決済 10 万 TPS</td><td>個室レジで一気に会計</td></tr>
        <tr><td>Mithril</td><td>署名集約で高速同期</td><td>高速スナップショット</td></tr>
      </tbody>
    </table>
    <h3>4. 主要アップグレード（2024-25）</h3>
    <ul>
      <li>2025-01 Plomin HF – CIP-1694 により完全オンチェーンガバナンスへ移行</li>
      <li>2025-06 憲法委員会選挙開始</li>
      <li>Voltaire フェーズ最終段階で自律運営を完成</li>
    </ul>
    <h3>5. エコシステム例</h3>
    <ul>
      <li>DeFi: Minswap, Indigo</li>
      <li>NFT / RWA: jpg.store, Book.io</li>
      <li>ID: Atala PRISM</li>
      <li>L2: Hydra, Midnight</li>
    </ul>
    <h3>6. ステーキング概要</h3>
    <ul>
      <li>最低 1 ADA、年率目安 3–4 %</li>
      <li>ロック無し・即解除可</li>
      <li>Yoroi/Lace でプール委任（資産移動なし）</li>
    </ul>
    <h3>7. メリット</h3>
    <ul>
      <li>省電力 PoS</li>
      <li>フォーマル検証で高セキュリティ</li>
      <li>オンチェーン民主制 – ADA 保有者がルール策定</li>
    </ul>
    <h3>8. リスク</h3>
    <ul>
      <li>開発速度が遅いと批判</li>
      <li>dApp 流動性がまだ小さい</li>
      <li>規制・税制の不確実性</li>
    </ul>
    <h3>9. 初心者 3 ステップ</h3>
    <ol>
      <li>Yoroi/Lace をセットアップし 50 ADA 送金</li>
      <li>好きなプールに 1 ADA からステーク委任</li>
      <li>Minswap でスワップ &amp; ガバナンス投票体験</li>
    </ol>
  `,
  'ADA': `同上`
};
// ---------------- 用語集データ ----------------
const glossary = {
  '基本構造': [
    { term: 'ブロックチェーン', def: '取引データが鎖のようにつながった分散型台帳。改ざんが極めて困難。' },
    { term: 'トランザクション', def: 'ブロックチェーンに記録される 1 件の取引。' },
    { term: 'ブロック', def: '複数トランザクションを束ねたデータ。ブロック単位で追加。' },
    { term: 'コンセンサスアルゴリズム', def: 'ネットワーク全体が同じ台帳に合意する仕組み。PoW や PoS など。' },
    { term: 'スマートコントラクト', def: 'あらかじめ設定された条件が満たされると自動的に取引や処理を実行するブロックチェーン上のプログラム' },
    { term: 'ノード', def: 'ブロックチェーン上で取引データを保管し他の参加者と情報を相互に共有・検証する役割を持つコンピュータ。' },
    { term: 'マイニング', def: 'ブロックチェーン上の取引が正しいことを大量計算で証明し、その見返りに新しい仮想通貨を受け取る仕組み' },
    { term: 'Lightning Network', def: 'ビットコインなどの送金をブロックチェーン外でまとめて瞬時・低手数料で決済し、最終結果だけをチェーンに記録して混雑を解消する仕組み' },
    { term: 'dApp（分散型アプリ）', def: 'ブロックチェーン上で動きスマートコントラクトにより中央管理者なしで自動実行されるアプリケーション' }
  ],
  '通貨・トークンの種類': [
    { term: '仮想通貨／暗号資産', def: 'インターネット上だけで存在するお金。' },
    { term: 'トークン', def: '他チェーンを利用して発行されたデジタル資産。' },
    { term: 'ステーブルコイン', def: '法定通貨と価値を連動させたトークン。' },
    { term: 'NFT', def: '唯一性を証明できるデジタル所有権トークン。' },
    { term: 'ステーキング', def: '保有する仮想通貨をネットワークに預けて取引承認に参加し、その報酬として新規コインや手数料を受け取る運用方法。' },
    { term: 'ブリッジ', def: '異なるブロックチェーン間でトークンやデータを移動・交換できるようにする中継プロトコル。' },
    { term: 'L2（レイヤー2）', def: 'メインのブロックチェーン外で多数の取引を処理し、最終結果だけをチェーンに書き込むことで速度向上と手数料削減を図る拡張技術。' },
    { term: 'L2', def: 'メインのブロックチェーン外で多数の取引を処理し、最終結果だけをチェーンに書き込むことで速度向上と手数料削減を図る拡張技術。' },
    { term: 'ガス代', def: 'ブロックチェーン上で取引やスマートコントラクトを実行する際に支払う手数料で、ネットワークの計算資源使用料に相当する。' },
    { term: 'DeFi（分散型金融）', def: '中央の銀行や仲介を介さず、ブロックチェーン上のスマートコントラクトで貸借・送金・取引など金融サービスを提供する仕組み。' },
    { term: 'DeFi', def: '分散型金融(Decentralized Finance)の略称。ブロックチェーン上の無許可型金融サービス全般を指す。' },
    { term: 'セービング商品', def: '取引所などに仮想通貨を一定期間預け、利息（年利/APY）を受け取る“暗号資産版の預金”サービス。' },
    { term: 'オーダーブック', def: '取引所が保有する、ある銘柄について現在出ている買い注文（Bid）と売り注文（Ask）を価格順に並べたリアルタイム一覧表。' },
    { term: 'バリデータ', def: 'PoS系ネットワークでトランザクションを検証しブロックを承認する権限を持つノードで、ネットワークの安全性を保つ要。' },
    { term: 'クロスチェーン', def: '異なるブロックチェーン間でトークンやデータを相互移動・相互運用できるようにする技術。' },
    { term: 'PoS（Proof of Stake）', def: 'コイン保有量（ステーク）に応じて取引承認者を選び、低消費電力でブロック生成を行うコンセンサスメカニズム。' },
    { term: 'PoS', def: 'Proof of Stake の略称。保有量に応じてブロック承認権を与えるコンセンサスメカニズム。' },
    { term: 'RWA', def: 'Real World Assets の略称。不動産や株式など現実資産をトークン化してブロックチェーン上で売買できるようにする仕組み。' },
    { term: 'GameFi', def: 'ゲームと DeFi を組み合わせ、プレイや NFT 取引で仮想通貨を稼げるブロックチェーンゲームの総称。' },
    { term: 'DePIN', def: 'Decentralized Physical Infrastructure Networks の略称。トークン報酬で通信やストレージなどのインフラを分散型で構築・運営する取り組み。' },
    { term: '焼却', def: 'トークンを回収不可能なアドレスに送って供給量を永久に減らすこと。バーンとも呼ばれる。' },
    { term: 'バーン', def: 'トークン焼却（Burn）のカタカナ表現。同義語。' },
    { term: 'レンディング', def: '保有する仮想通貨を貸し出し、利息として同じ銘柄を受け取る運用方法。' }
  ],
  'ウォレット & 鍵管理': [
    { term: 'ウォレット', def: '仮想通貨を保管し署名するソフトや機器。' },
    { term: '公開鍵 / アドレス', def: 'お金を受け取るために共有する口座番号のようなもの。' },
    { term: '秘密鍵', def: '資産を動かすための暗証番号＋印鑑。漏洩厳禁。' },
    { term: 'ホットウォレット(オンライン型)', def: 'オンライン保管で利便性高いがハッキングに注意。' },
    { term: 'コールドウォレット(ハードウェア型)', def: 'オフライン保管で高セキュリティ。' },
    { term: 'オンライン型', def: 'インターネット接続された環境で保管・利用する形式。利便性が高い反面ハッキングリスクが大きい。' },
    { term: 'ハードウェア型', def: '専用デバイスに秘密鍵を隔離保管する形式。オフラインで高いセキュリティを確保できる。' }
  ]
  // 追加セクションは省略（必要なら続けて定義）
};

// glossary 平坦化マップ作成
const glossaryFlat = Object.values(glossary).flat();
const glossaryMap  = Object.fromEntries(glossaryFlat.map(i => [i.term, i.def]));

// ---------------- 既存要素取得 ----------------
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = modal.querySelector('.modal-content');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

document.getElementById('crypto-table-body').addEventListener('click', e => {
  if (e.target.classList.contains('explain-btn')) {
    const name = e.target.dataset.name;
    modalTitle.textContent = name;
    let html = explanations[name] || '（解説は未記入です）';
    // dApp 表記を括弧付きに統一
    html = html.replace(/dApp(?!（分散型アプリ）)/g, 'dApp（分散型アプリ）');
// 用語をハイライトしてツールチップ付与
Object.keys(glossaryMap).forEach(term=>{
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const regex = new RegExp(escaped, 'g');
  html = html.replace(regex, `<span class="glossary-term" data-tip="${glossaryMap[term]}">${term}</span>`);
});
modalBody.innerHTML = html;
    modalContent.scrollTop = 0;
    modal.classList.remove('hidden');
  }
});
modalClose.addEventListener('click', () => { modalContent.scrollTop = 0; modal.classList.add('hidden'); });
modal.addEventListener('click', e => { if (e.target === modal){ modalContent.scrollTop = 0; modal.classList.add('hidden'); } });

// ---------------- 用語集モーダル ----------------
const glossaryBtn = document.getElementById('glossary-btn');
const glossaryModal = document.getElementById('glossary-modal');
const glossaryClose = document.getElementById('glossary-close');
const glossaryBody = document.getElementById('glossary-body');

function renderGlossary(){
  const skip = new Set(['L2','DeFi','PoS']); // 重複を避ける単独用語
  const seen = new Set();
  const all = Object.values(glossary).flat().filter(i=>{
    if(skip.has(i.term)) return false;
    if(seen.has(i.term)) return false;
    seen.add(i.term);
    return true;
  });
  // 分離してソート
  const kana = [];
  const latin = [];
  all.forEach(i=>{
    const first = i.term.charAt(0);
    if(first.match(/[A-Za-z]/)){ latin.push(i); }
    else{ kana.push(i); }
  });
  const yomi = {
    '焼却': 'ショウキャク',
    'バーン': 'バーン',
    '仮想通貨／暗号資産': 'カソウツウカ',
    '公開鍵 / アドレス': 'コウカイカギ',
    '秘密鍵': 'ヒミツカギ'
  };
  const norm = str => str.replace(/[\s/・／()（）]/g,'');
  kana.sort((a,b)=> (yomi[a.term]||norm(a.term)).localeCompare((yomi[b.term]||norm(b.term)),'ja')); // あいうえお順
  latin.sort((a,b)=> a.term.localeCompare(b.term,'en', {sensitivity:'base'})); // abc順
  const combined = [...kana, ...latin];
  const rows = combined.map(i => `<tr><td><strong>${i.term}</strong></td><td>${i.def}</td></tr>`).join('');
  glossaryBody.innerHTML = `<table>${rows}</table>`;
}


glossaryBtn.addEventListener('click', () => {
  renderGlossary();
  glossaryModal.classList.remove('hidden');
});
glossaryClose.addEventListener('click', () => glossaryModal.classList.add('hidden'));
glossaryModal.addEventListener('click', e => { if(e.target === glossaryModal) glossaryModal.classList.add('hidden'); });

// ---------------- 使い方モーダル ----------------
const tourBtn = document.getElementById('tour-btn');
const tourModal = document.getElementById('tour-modal');
const tourClose = document.getElementById('tour-close');
const tourOk = document.getElementById('tour-ok');
const tourDisable = document.getElementById('tour-disable');

function openTour(){ tourModal.classList.remove('hidden'); }
function closeTour(){ tourModal.classList.add('hidden'); localStorage.setItem('tourSeen','yes'); }

if(tourBtn){ tourBtn.addEventListener('click',openTour); }
if(tourClose){ tourClose.addEventListener('click',closeTour); }
if(tourOk){ tourOk.addEventListener('click',closeTour); }
if(tourDisable){ tourDisable.addEventListener('click',()=>{ localStorage.setItem('tourAuto','off'); closeTour(); }); }
if(tourModal){ tourModal.addEventListener('click',e=>{ if(e.target===tourModal) closeTour(); }); }

// 初回 & 再訪問時に自動表示 (off が設定されていない限り)
if(localStorage.getItem('tourAuto')!=='off'){
  setTimeout(openTour, 500);
}

// ---------------- テーマ切替 ----------------
const themeToggle = document.getElementById('theme-toggle');
function applyTheme(){
  const isDark = localStorage.getItem('theme') === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? '☀' : '🌙';
}
applyTheme();

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀' : '🌙';
});

// ---------------- 損益計算シミュレーター ----------------
const calcBtn   = document.getElementById('calc-btn');
const calcModal = document.getElementById('calc-modal');
const calcClose = document.getElementById('calc-close');
const tradeRows = document.getElementById('trade-rows');
const addRowBtn = document.getElementById('add-row');
const calcRun   = document.getElementById('calc-run');
const calcResult= document.getElementById('calc-result');

function addTradeRow(){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><select class="type"><option value="buy">買</option><option value="sell">売</option></select></td>
    <td><input type="text"  class="asset" placeholder="BTC" style="width:70px"></td>
    <td><input type="number" class="qty"   min="0" step="0.0001" style="width:80px"></td>
    <td><input type="number" class="price" min="0" step="0.01"   style="width:90px"></td>
    <td><select class="currency"><option value="JPY">円</option><option value="USD">USD</option></select></td>
    <td><button type="button" class="remove">✖</button></td>`;
  tradeRows.appendChild(tr);
  tr.querySelector('.remove').addEventListener('click', ()=> tr.remove());
}

calcBtn.addEventListener('click', ()=>{
  tradeRows.innerHTML = '';
  addTradeRow();
  calcResult.textContent = '';
  calcModal.classList.remove('hidden');
});
calcClose.addEventListener('click', ()=> calcModal.classList.add('hidden'));
calcModal.addEventListener('click', e=>{if(e.target===calcModal) calcModal.classList.add('hidden');});
addRowBtn.addEventListener('click', addTradeRow);

calcRun.addEventListener('click', ()=>{
  // 銘柄 & 通貨ごとに集計 { key: {buy:0,sell:0, asset:'BTC', cur:'JPY'} }
  const totals = {};  // key = `${cur}_${asset}`
  tradeRows.querySelectorAll('tr').forEach(tr=>{
    const asset = (tr.querySelector('.asset').value || '').trim().toUpperCase();
    const type = tr.querySelector('.type').value; // buy or sell
    const qty  = parseFloat(tr.querySelector('.qty').value)||0;
    const price= parseFloat(tr.querySelector('.price').value)||0;
    const cur  = tr.querySelector('.currency').value; // JPY or USD
    const amount = qty*price;
    if(!asset) return; // 未入力は無視
    const key = `${cur}_${asset}`;
    if(!totals[key]) totals[key] = {buy:0,sell:0, asset, cur};
    totals[key][type] += amount;
  });
  let html='';
  const taxRate=0.20315;
  Object.values(totals).forEach(t=>{
    const profit = t.sell - t.buy;
    html += `<p><strong>${t.asset}</strong> (${t.cur}) 損益: ${profit.toLocaleString(undefined,{maximumFractionDigits:2})} ${t.cur}`;
    if(t.cur==='JPY'){
      const tax = profit>0 ? profit*taxRate : 0;
      html += ` / 税概算: ${tax.toLocaleString(undefined,{maximumFractionDigits:2})} 円`;
    }
    html += '</p>';
  });
  calcResult.innerHTML = html || '入力が不足しています';
});

// ---------------- クイズ ----------------
const quizBtn     = document.getElementById('quiz-btn');
const quizModal   = document.getElementById('quiz-modal');
const quizClose   = document.getElementById('quiz-close');
const quizQ       = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const quizScoreEl = document.getElementById('quiz-score');
let quizPool = [], quizIdx = 0, quizScore = 0;
function shuffle(arr){return arr.slice().sort(()=>Math.random()-0.5);} // 簡易シャッフル
function startQuiz(){
  quizPool = shuffle(glossaryFlat).slice(0,10); // 10問
  quizIdx = 0; quizScore = 0;
  renderQuizQ();
  quizModal.classList.remove('hidden');
}
function renderQuizQ(){
  if(quizIdx >= quizPool.length){
    quizQ.textContent = `終了！スコア ${quizScore} / ${quizPool.length}`;
    quizOptions.innerHTML = '<button id="quiz-restart" class="glossary-btn">もう一度</button>';
    document.getElementById('quiz-restart').onclick = startQuiz;
    quizScoreEl.textContent = '';
    return;
  }
  const current = quizPool[quizIdx];
  quizQ.innerHTML = `<strong>Q${quizIdx+1}.</strong> ${current.def}`;
  const distractors = shuffle(glossaryFlat.filter(g=>g.term!==current.term)).slice(0,2).map(g=>g.term);
  const opts = shuffle([current.term, ...distractors]);
  quizOptions.innerHTML = '';
  opts.forEach(opt=>{
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = 'glossary-btn';
    btn.onclick = ()=>{
      if(opt===current.term) quizScore++;
      quizIdx++;
      renderQuizQ();
    };
    quizOptions.appendChild(btn);
  });
  quizScoreEl.textContent = `正解数: ${quizScore} / ${quizIdx}`;
}
quizBtn.addEventListener('click', startQuiz);
quizClose.addEventListener('click', ()=> quizModal.classList.add('hidden'));
quizModal.addEventListener('click', e=>{if(e.target===quizModal) quizModal.classList.add('hidden');});

// ---------------- 汎用ツールチップ ----------------
// 動的に挿入される要素にも対応するため、イベントデリゲーション

document.body.addEventListener('mouseenter', e => {
  const tip = e.target.dataset.tip;
  if(tip){ /* CSS ::after handles表示*/ }
}, true);
