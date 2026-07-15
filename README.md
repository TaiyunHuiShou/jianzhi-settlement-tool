<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>兼职结算核对工具</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f7fb;
      --panel: #ffffff;
      --text: #17202a;
      --muted: #667085;
      --line: #dde4ed;
      --red: #e53935;
      --red-dark: #b71c1c;
      --yellow: #fff7d6;
      --green: #0f8b5f;
      --blue: #2563eb;
      --shadow: 0 10px 30px rgba(31, 41, 55, 0.08);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, "Microsoft YaHei", sans-serif;
      background: var(--bg);
      color: var(--text);
      letter-spacing: 0;
    }
    button, input, textarea, select { font: inherit; }
    button {
      border: 0;
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--red);
      color: white;
      font-weight: 700;
      cursor: pointer;
      min-height: 40px;
    }
    button.secondary { background: #edf1f7; color: #223044; }
    button.ghost { background: transparent; color: var(--red-dark); border: 1px solid #f3b1ae; }
    button.danger { background: #7f1d1d; }
    input, textarea, select {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: #fff;
      color: var(--text);
      min-height: 40px;
    }
    textarea { min-height: 150px; resize: vertical; line-height: 1.5; }
    label { display: block; font-size: 13px; color: var(--muted); margin: 0 0 6px; }
    h1, h2, h3 { margin: 0; }
    h1 { font-size: 22px; }
    h2 { font-size: 18px; margin-bottom: 12px; }
    h3 { font-size: 15px; margin-bottom: 8px; }
    .app { min-height: 100vh; padding-bottom: 74px; }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(245, 247, 251, 0.94);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--line);
    }
    .topbar-inner {
      max-width: none;
      width: 100%;
      margin: 0 auto;
      padding: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .subtitle { color: var(--muted); font-size: 13px; margin-top: 4px; }
    .datebox { min-width: 150px; }
    .wrap { max-width: none; width: 100%; margin: 0 auto; padding: 14px; }
    .view { display: none; }
    .view.active { display: block; }
    .grid { display: grid; gap: 12px; }
    .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 14px;
      box-shadow: var(--shadow);
    }
    .stat-title { color: var(--muted); font-size: 13px; }
    .stat-value { font-size: 24px; font-weight: 800; margin-top: 6px; }
    .profit { color: var(--green); }
    .loss { color: var(--red-dark); }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .form-grid { display: grid; gap: 10px; }
    .row-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; background: #fff; }
    table { width: 100%; border-collapse: collapse; min-width: 680px; }
    th, td { padding: 10px; border-bottom: 1px solid #edf1f7; text-align: left; font-size: 13px; white-space: nowrap; }
    th { background: #f8fafc; color: #475467; position: sticky; top: 0; }
    tr:last-child td { border-bottom: 0; }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 42px;
      border-radius: 999px;
      padding: 3px 8px;
      background: #fff1f1;
      color: var(--red-dark);
      font-weight: 800;
      font-size: 12px;
    }
    .notice {
      background: var(--yellow);
      border: 1px solid #f4df8f;
      border-radius: 10px;
      padding: 12px;
      color: #664d03;
      line-height: 1.5;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .empty { color: var(--muted); text-align: center; padding: 24px; }
    .tabs {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 30;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #fff;
      border-top: 1px solid var(--line);
      box-shadow: 0 -8px 22px rgba(31, 41, 55, 0.08);
    }
    .tab {
      min-height: 58px;
      border-radius: 0;
      background: #fff;
      color: #475467;
      padding: 7px 2px;
      font-size: 12px;
    }
    .tab.active { color: var(--red-dark); background: #fff1f1; }
    .tab span { display: block; font-size: 19px; line-height: 1.1; }
    .copybox {
      white-space: pre-wrap;
      background: #0f172a;
      color: #e5e7eb;
      border-radius: 10px;
      padding: 12px;
      font-size: 13px;
      line-height: 1.6;
      max-height: 260px;
      overflow: auto;
    }
    .settings-grid { display: grid; gap: 12px; }
    .settings-block {
      border-top: 1px solid var(--line);
      padding-top: 12px;
      margin-top: 12px;
    }
    .compact-platform-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .daily-split, .settlementConsoleGrid { display: grid; gap: 12px; }
    .screenshot-table { min-width: 0; }
    .screenshot-table th, .screenshot-table td {
      white-space: normal;
      vertical-align: top;
      line-height: 1.35;
    }
    .screenshot-table td:first-child { font-weight: 800; min-width: 74px; }
    .screenshot-task {
      display: inline-block;
      margin: 2px 8px 2px 0;
      min-width: 82px;
    }
    .screenshot-total { font-weight: 800; color: var(--red-dark); }
    #backToTopBtn {
      position: fixed;
      right: 14px;
      bottom: 84px;
      z-index: 60;
      display: none;
      width: 44px;
      min-height: 44px;
      padding: 0;
      border-radius: 999px;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
    }
    .split { display: grid; gap: 12px; }
    .stack { display: grid; gap: 12px; }
    .overview-agent-card { margin-top: 12px; }
    .assign-split > .card { height: 100%; }
    .platform-price { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: end; }
    .platform-head { display: grid; gap: 4px; min-width: 150px; }
    .platform-head a { color: var(--blue); text-decoration: none; font-size: 12px; font-weight: 700; }
    .account-card { display: grid; gap: 6px; min-width: 170px; white-space: normal; }
    .account-line { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .mini-copy {
      min-height: 26px;
      padding: 4px 7px;
      border-radius: 6px;
      background: #edf1f7;
      color: #223044;
      font-size: 12px;
      font-weight: 700;
    }
    .muted { color: var(--muted); }
    .warn { color: var(--red-dark); font-weight: 700; }
    .ok { color: var(--green); font-weight: 700; }
    .small { font-size: 12px; }
    .confirm-mask {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: rgba(15, 23, 42, 0.48);
    }
    .confirm-box {
      width: min(420px, 100%);
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 20px 70px rgba(15, 23, 42, 0.28);
      overflow: hidden;
    }
    .confirm-message {
      padding: 24px 18px;
      text-align: center;
      font-size: 18px;
      font-weight: 800;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    .confirm-actions { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--line); }
    .confirm-actions button { border-radius: 0; min-height: 56px; background: #fff; }
    .confirm-cancel { color: #223044; border-right: 1px solid var(--line); }
    .confirm-ok { color: var(--red); }
    .toast-box {
      position: fixed;
      left: 50%;
      bottom: 84px;
      z-index: 90;
      transform: translateX(-50%);
      max-width: min(520px, calc(100vw - 28px));
      padding: 10px 14px;
      border-radius: 10px;
      background: #0f172a;
      color: #fff;
      font-size: 14px;
      line-height: 1.45;
      box-shadow: 0 14px 40px rgba(15, 23, 42, 0.22);
      display: none;
      white-space: pre-wrap;
    }

    @media (min-width: 860px) {
      .app { padding-bottom: 0; }
      .wrap { padding: 18px 28px; }
      .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
      .settings-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
      .settings-wide { grid-column: 1 / -1; }
      .daily-split, .settlementConsoleGrid { grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr); align-items: start; }
      .overview-top { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: stretch; }
      .overview-top > .card { min-height: 205px; }
      .overview-side { display: grid; grid-template-rows: auto 1fr; }
      .form-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: end; }
      .tabs {
        position: sticky;
        top: 73px;
        max-width: none;
        width: calc(100% - 56px);
        margin: 0 auto;
        border: 1px solid var(--line);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: none;
      }
      .tab { min-height: 46px; }
      .tab span { display: inline; font-size: 15px; margin-right: 4px; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="topbar">
      <div class="topbar-inner">
        <div>
          <h1 id="appTitleText">兼职结算核对工具</h1>
          <div id="appSubtitleText" class="subtitle">账号对应微信，回传自动算钱，每日数据一眼看清</div>
        </div>
        <div class="datebox">
          <label for="selectedDate">结算日期</label>
          <input id="selectedDate" type="date">
        </div>
      </div>
    </header>

    <nav class="tabs" aria-label="页面导航">
      <button class="tab active" data-view="overview"><span>⌂</span>总览</button>
      <button class="tab" data-view="accounts"><span>☷</span>入库/闲置</button>
      <button class="tab" data-view="assign"><span>派</span>发号</button>
      <button class="tab" data-view="hive"><span>蜂</span>蜂箱</button>
      <button class="tab" data-view="import"><span>＋</span>回传结算</button>
      <button class="tab" data-view="daily"><span>表</span>综合结算台</button>
      <button class="tab" data-view="settings"><span>⚙</span>设置</button>
    </nav>

    <main class="wrap">
      <section id="overview" class="view active">
        <div class="grid stats" id="stats"></div>
        <div class="split overview-top" style="margin-top:12px">
          <div class="card">
            <h2>平台汇总</h2>
            <div class="table-wrap"><table id="platformTable"></table></div>
          </div>
          <div class="stack overview-side">
            <div class="card">
              <h2>库存概览</h2>
              <div id="inventoryBox"></div>
            </div>
            <div class="card">
              <h2>回传未匹配账号</h2>
              <div id="unmatchedBox"></div>
            </div>
          </div>
        </div>
        <div class="card overview-agent-card" id="overviewAgentCard">
          <h2>代理账号</h2>
          <div class="toolbar">
            <input id="agentGroupSearch" placeholder="搜索代理、账号或平台" style="max-width:320px">
          </div>
          <div id="agentAccountGroups"></div>
          <h3>代理备用仓库</h3>
          <div class="toolbar">
            <input id="agentSpareAssignNameInput" placeholder="要分给的新代理名称" style="max-width:240px">
            <input id="agentSpareAssignRateInput" type="number" step="0.01" placeholder="代理单价，可不填" style="max-width:180px">
          </div>
          <div class="table-wrap"><table id="agentSpareTable"></table></div>
        </div>
      </section>

      <section id="accounts" class="view">
        <div class="card">
            <h2>账号入库</h2>
            <div class="notice">新账号直接按“账号 密码”导入即可。使用本工具之前已经手动分配过的账号，请在密码后面加兼职称呼，工具会按这个名字归属，支持批量导入。</div>
            <div class="toolbar" style="margin-bottom:10px">
              <label style="margin:0">入库平台</label>
              <select id="rosterPlatformInput">
                <option value="">自动识别</option>
                <option value="XX">全部按 XX 入库</option>
                <option value="qq">全部按 qq 入库</option>
                <option value="HH">全部按 HH 入库</option>
                <option value="TN">全部按 TN 入库</option>
              </select>
            </div>
            <textarea id="rosterText" placeholder="每行一个账号和密码，例如：
XXjt57-83 uR4KNDCnKHbF
qqXX15-70 JcX9sCzCh9Bz

如果是以前手动分配过的账号，在密码后面加兼职称呼：
XXjt046-88 q8q8L3NHUHbC 钛云数码"></textarea>
            <div class="toolbar" style="margin-top:10px">
              <button id="importRosterBtn">导入到库存</button>
              <button class="secondary" id="clearRosterTextBtn">清空输入</button>
            </div>
            <div id="rosterStatusBox" class="notice" style="display:none"></div>
        </div>

        <div class="card" style="margin-top:12px">
          <h2>已派兼职账号</h2>
          <div class="toolbar">
            <input id="workerGroupSearch" placeholder="搜索账号或微信" style="max-width:320px">
          </div>
          <div class="toolbar" style="margin-top:10px">
            <input id="renameFromInput" placeholder="原微信名，例如 Koumari" style="max-width:240px">
            <input id="renameToInput" placeholder="统一改成，例如 Koumori" style="max-width:240px">
            <button class="secondary" id="renameAssigneeBtn">合并/调整微信名</button>
          </div>
          <div class="table-wrap" style="margin-top:10px"><table id="workerGroupTable"></table></div>
        </div>
      </section>

      <section id="assign" class="view">
        <div class="split assign-split">
          <div class="card">
            <h2>给新兼职分配账号</h2>
            <div class="notice">输入微信号后，工具会从空闲库存里自动分配四个平台各 1 个账号。账号释放后 7 天内不会再分给新人。</div>
            <div class="form-grid">
              <div><label>兼职微信</label><input id="assignWechatInput" placeholder="例如：橘子"></div>
              <div><label>开始日期</label><input id="assignStartDate" type="date"></div>
              <div><label>分配数量</label><input value="四个平台各 1 个" disabled></div>
              <div><button id="assignWorkerBtn">自动分配并生成文本</button></div>
            </div>
            <div style="margin-top:12px">
              <label>发给兼职的文本</label>
              <textarea id="assignmentText" placeholder="分配后这里会生成可复制文本"></textarea>
              <div class="toolbar" style="margin-top:10px">
                <button id="copyAssignmentBtn">复制发号文本</button>
              </div>
            </div>
          </div>

          <div class="card">
            <h2>代理拿号</h2>
            <div class="notice">把供号方直接发给代理的新账号粘贴到这里，入库时就归属到该代理；不会占用你的闲置账号库存。</div>
            <div class="form-grid">
              <div><label>代理名称</label><input id="agentNameInput" placeholder="例如：代理老王"></div>
              <div><label>代理单价</label><input id="agentRateInput" type="number" step="0.01" placeholder="例如：0.22"></div>
              <div><label>开始日期</label><input id="agentStartDate" type="date"></div>
            </div>
            <label style="margin-top:10px">粘贴给代理的新账号</label>
            <textarea id="agentImportText" placeholder="一次可粘贴 10 个左右，例如：
XXjt57-61 ARpJhR4z6bDR
XXjt57-62 BdMv8X7K7NzE
Hqq27.2 zuDwhw38TEcM
TN-MHB-mb0-01075 vV6H4aVXyQ9V"></textarea>
            <div class="toolbar" style="margin-top:10px">
              <label style="margin:0">平台识别</label>
              <select id="agentImportPlatformInput">
                <option value="">自动识别</option>
                <option value="XX">按 XX 入库</option>
                <option value="qq">按 qq 入库</option>
                <option value="HH">按 HH 入库</option>
                <option value="TN">按 TN 入库</option>
              </select>
              <button class="secondary" id="importAgentAccountsBtn">归属到代理</button>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:12px">
          <h2>派发限制</h2>
          <div class="notice">这里看发号前后的库存变化。派完一组后，“可派发库存”会少一组；有订单记录回收后会进入 7 天限制。</div>
          <div id="assignInventoryBox" style="margin-bottom:10px"></div>
        </div>

        <div class="card" style="margin-top:12px">
          <h2>闲置账号</h2>
          <div class="notice">这里是当前可派发库存，只展示和复制账号密码；已分配、7 天限制、代理账号不会放在这里。</div>
          <div class="toolbar" style="margin-top:12px">
            <input id="accountSearch" placeholder="搜索闲置账号或平台" style="max-width:320px">
          </div>
          <div class="table-wrap"><table id="accountsTable"></table></div>
        </div>

        <div class="card" style="margin-top:12px">
          <h2>当前分配和回收</h2>
          <div class="notice">按错人时点“撤销误分”，账号立即恢复；对方退号时点“退号回收”，没有订单会立即释放，有订单记录才进入 7 天隔离。</div>
          <div class="toolbar" style="margin-top:12px">
            <input id="assignmentSearch" placeholder="搜索兼职、账号或平台" style="max-width:320px">
          </div>
          <div class="table-wrap"><table id="assignmentsTable"></table></div>
        </div>
      </section>

      <section id="hive" class="view">
        <div class="split">
          <div class="card">
            <h2>蜂箱账号目录</h2>
            <div class="notice">蜂箱账号只用于统计归属，不需要派发、回收、7天限制。导错的账号可以直接删除后重新添加；只有回传里出现但目录里没有归属的账号，会进入未匹配等待落实。</div>
            <div class="form-grid">
              <div><label>归属类型</label><select id="hiveOwnerTypeInput"><option value="worker">兼职</option><option value="agent">代理</option></select></div>
              <div><label>归属名称</label><input id="hiveOwnerInput" placeholder="例如：钛云数字 或 代理A"></div>
            </div>
            <textarea id="hiveRosterText" placeholder="每行一个蜂箱账号，也可以从 Excel/WPS 复制一列账号进来，例如：
方迈-LSZB1-477860
方迈-LSZB1-384296"></textarea>
            <div class="toolbar" style="margin-top:10px">
              <input id="hiveRosterFileInput" type="file" accept=".xlsx,.xls,.csv,.txt">
              <button class="secondary" id="loadHiveRosterFileBtn">上传账号表格</button>
              <button id="importHiveRosterBtn">导入蜂箱账号</button>
              <button class="secondary" id="clearHiveRosterTextBtn">清空输入</button>
            </div>
            <div class="toolbar" style="margin-top:10px">
              <input id="hiveAccountSearch" placeholder="搜索蜂箱账号或归属" style="max-width:320px">
            </div>
            <div class="table-wrap"><table id="hiveAccountTable"></table></div>
          </div>

          <div class="card">
            <h2>蜂箱回传</h2>
            <div class="notice">上传供号方给的蜂箱 Excel/WPS 表格，工具会读取“用户名 / 成功”，同一个蜂箱账号多行会自动合计。结算只按已导入的数据计算，今天没有蜂箱数据也不影响抖音结算。</div>
            <textarea id="hiveReturnText" placeholder="也可以直接粘贴：
方迈-LSZB1-477860 7
方迈-LSZB1-477860 3
方迈-LSZB1-203161 2"></textarea>
            <div class="toolbar" style="margin-top:10px">
              <input id="hiveReturnFileInput" type="file" accept=".xlsx,.xls,.csv,.txt">
              <button class="secondary" id="loadHiveReturnFileBtn">上传蜂箱回传</button>
              <button id="parseHiveReturnBtn">解析并保存蜂箱数据</button>
              <button class="secondary" id="clearHiveReturnTextBtn">清空输入</button>
              <button class="ghost" id="clearHiveReturnBtn">清空当天蜂箱</button>
            </div>
            <h3>蜂箱未匹配账号</h3>
            <div id="hiveUnmatchedBox"></div>
            <h3>当天蜂箱明细</h3>
            <div class="table-wrap"><table id="hiveReturnTable"></table></div>
          </div>
        </div>
      </section>

      <section id="import" class="view">
        <div class="card">
          <h2>回传数据录入</h2>
          <div class="notice">最方便：让供号方发 Excel/WPS 表格，直接复制“账号、审核通过、审核失败”三列粘贴进来。工具只取账号后面的第一个数字作为审核通过单数，右边失败数会自动忽略；同一天同账号再次导入会覆盖当天数据。</div>
          <textarea id="returnText" placeholder="例如：
TN-MHB-mb0-01044 1 1
TN-MHB-mb0-01046 33 46
XXjt57-61 24 3

如果 OCR 把列拆乱，也可以粘贴成：
TN-MHB-mb0-01044
TN-MHB-mb0-01046
1
33
右边失败数不用管，工具会按账号顺序取第一批数字。"></textarea>
            <div class="toolbar" style="margin-top:10px">
            <input id="returnFileInput" type="file" accept=".xlsx,.xls,.csv,.txt">
            <button class="secondary" id="loadReturnFileBtn">上传Excel/WPS表格</button>
            <button id="parseReturnBtn">解析并保存到当天</button>
            <button class="secondary" id="sampleReturnBtn">填入示例回传</button>
            <button class="secondary" id="clearReturnTextBtn">清空输入框</button>
            <button class="ghost" id="clearReturnBtn">清空当天回传</button>
          </div>
          <h3>当天账号明细</h3>
          <div class="table-wrap"><table id="returnTable"></table></div>
        </div>
      </section>

      <section id="daily" class="view">
        <div class="daily-split settlementConsoleGrid">
          <div class="card">
            <h2>兼职结算</h2>
            <div class="table-wrap"><table id="wechatTable"></table></div>
          </div>
          <div class="card">
            <h2>代理结算</h2>
            <div class="toolbar">
              <button class="secondary" id="copyAgentBtn">复制代理结算</button>
            </div>
            <div class="table-wrap" style="margin-bottom:12px"><table id="agentTable"></table></div>
            <h3>代理专用回传数据</h3>
            <div class="toolbar">
              <select id="agentExportSelect" style="max-width:260px"></select>
              <button class="secondary" id="copyAgentReturnsBtn">复制账号单数</button>
              <button class="secondary" id="exportAgentReturnsBtn">导出代理表格</button>
            </div>
            <div id="agentExportPreview" class="copybox" style="margin-bottom:12px"></div>
            <h3>代理当天做单账号</h3>
            <div class="table-wrap"><table id="agentAccountDailyTable"></table></div>
          </div>
        </div>
        <div class="card" id="settlementScreenshotPanel" style="margin-top:12px">
          <h2>群发截图明细</h2>
          <div class="notice">这里按兼职逐行汇总抖音四个平台和蜂箱，适合直接截图发群里核对；不依赖复制长文字，手机上也更容易看清。</div>
          <div class="table-wrap"><table id="settlementScreenshotTable" class="screenshot-table"></table></div>
        </div>
        <div class="card" style="margin-top:12px">
          <h2>兼职单人总结算</h2>
          <div class="toolbar">
            <button id="copyWorkerBtn">复制发给兼职的明细</button>
          </div>
          <div id="workerCopyText" class="copybox"></div>
        </div>
      </section>

      <section id="settings" class="view">
        <div class="settings-grid">
          <div class="card settings-wide" id="displaySettingsCard">
            <h2>平台价格</h2>
            <div class="notice">这里用于设置结算显示名称、平台成本价和任务链接。成本方名称可按实际叫法改成“成本方 / 渠道 / 供号方”，平台成本价按当前使用者自己的结算规则填写。</div>
            <div class="form-grid" style="margin-top:10px">
              <div><label>工具标题</label><input id="appTitleInput" placeholder="例如：兼职结算核对工具"></div>
              <div><label>标题说明</label><input id="appSubtitleInput" placeholder="例如：账号对应微信，回传自动算钱"></div>
              <div><label>成本方名称</label><input id="bossNameInput" placeholder="例如：成本方、渠道、供号方"></div>
              <div><button class="secondary" id="saveLabelsBtn">保存显示名称</button></div>
            </div>
            <div id="douyinSettingsCard" class="settings-block">
              <h3>抖音团购</h3>
              <div id="priceSettings" class="grid compact-platform-grid"></div>
            </div>
            <div id="hiveSettingsCard" class="settings-block">
            <h3>蜂箱价格</h3>
            <div class="form-grid">
              <div><label>兼职单价</label><input id="hiveWorkerRateInput" type="number" step="0.01" placeholder="留空按 0 计算"></div>
              <div><label>代理单价</label><input id="hiveAgentRateInput" type="number" step="0.01" placeholder="留空按 0 计算"></div>
              <div><label><span class="bossRateLabel">成本方单价</span></label><input id="hiveBossRateInput" type="number" step="0.01" placeholder="留空按 0 计算"></div>
            </div>
            <div class="toolbar" style="margin-top:12px">
              <button id="savePricesBtn">保存价格</button>
              <button class="secondary" id="resetPricesBtn">恢复默认价格</button>
            </div>
            </div>
            <div id="ownerRateSettingsCard" class="settings-block">
            <h3>单人价格</h3>
            <div class="notice">名字必须完全一致才会生效；“杨”和“杨桃李洲”会按两个人分别计算。</div>
            <div class="form-grid">
              <div><label>类型</label><select id="rateOwnerTypeInput"><option value="worker">兼职</option><option value="agent">代理</option></select></div>
              <div><label>微信/代理名</label><input id="rateOwnerNameInput" placeholder="必须完整输入，例如：杨桃李洲"></div>
              <div><label>平台</label><select id="ratePlatformInput"><option value="XX">XX</option><option value="qq">qq</option><option value="HH">HH</option><option value="TN">TN</option><option value="hive">蜂箱</option></select></div>
              <div><label>单价</label><input id="rateValueInput" type="number" step="0.01" placeholder="例如：0.3"></div>
            </div>
            <div class="toolbar" style="margin-top:10px">
              <button class="secondary" id="saveOwnerRateBtn">保存单人价格</button>
              <button class="ghost" id="clearOwnerRateBtn">清除这个单人价格</button>
            </div>
            <div class="table-wrap" style="margin-top:10px"><table id="ownerRateTable"></table></div>
            </div>
          </div>
          <div class="card" id="backupSettingsCard">
            <h2>备份与恢复</h2>
            <div class="toolbar">
              <button id="exportBtn">导出备份</button>
              <button class="secondary" id="importBackupBtn">导入备份</button>
              <button class="secondary" id="scanStorageBtn">扫描本页旧数据</button>
              <button class="danger" id="clearToolDataBtn">清空本工具数据</button>
            </div>
            <div id="dataStatusBox" class="notice"></div>
            <div id="storageScanBox"></div>
            <textarea id="backupText" placeholder="导出的备份会显示在这里；也可以把备份 JSON 粘贴进来再点导入"></textarea>
            <div class="notice" style="margin-top:12px">这个工具的数据存在当前浏览器里。换手机、清缓存、换浏览器前，先导出备份。</div>
          </div>
          <div class="card">
            <h2>云同步</h2>
            <div class="notice">先在 Supabase 建表，再填下面配置。上传前会用“同步密码”加密，云端保存的是密文；手机和电脑使用同一个同步码和同步密码即可同步。</div>
            <div class="form-grid">
              <div><label>Supabase 地址</label><input id="cloudUrlInput" placeholder="https://xxxx.supabase.co"></div>
              <div><label>anon key</label><input id="cloudKeyInput" placeholder="Supabase anon public key"></div>
              <div><label>同步码</label><input id="cloudSyncCodeInput" placeholder="例如：my-main-data"></div>
              <div><label>同步密码</label><input id="cloudPasswordInput" type="password" placeholder="至少 6 位，自己记住"></div>
            </div>
            <div class="toolbar" style="margin-top:12px">
              <button id="saveCloudConfigBtn">保存云配置</button>
              <button class="secondary" id="uploadCloudBtn">上传到云端</button>
              <button class="secondary" id="downloadCloudBtn">从云端同步</button>
            </div>
            <label>Supabase 建表 SQL</label>
            <textarea id="cloudSqlText" readonly></textarea>
            <div class="toolbar" style="margin-top:10px">
              <button class="secondary" id="copyCloudSqlBtn">复制建表 SQL</button>
            </div>
            <div class="notice">注意：从云端同步会用云端数据覆盖当前浏览器数据。同步前不放心，可以先点“导出备份”。</div>
          </div>
        </div>
      </section>
    </main>

    <button id="backToTopBtn" type="button" title="回到顶部">↑</button>

    <div id="confirmMask" class="confirm-mask" role="dialog" aria-modal="true" aria-labelledby="confirmMessage">
      <div class="confirm-box">
        <div id="confirmMessage" class="confirm-message"></div>
        <div class="confirm-actions">
          <button id="confirmCancelBtn" class="confirm-cancel" type="button">取消</button>
          <button id="confirmOkBtn" class="confirm-ok" type="button">确认</button>
        </div>
      </div>
    </div>
    <div id="toastBox" class="toast-box" role="status" aria-live="polite"></div>

    <div id="editAccountPanel" class="card" style="display:none; position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); z-index:20; width:min(560px,92vw); box-shadow:0 20px 60px rgba(15,23,42,.25)">
      <h2>编辑账号</h2>
      <input id="editAccountOriginal" type="hidden">
      <div class="form-grid">
        <div><label>账号</label><input id="editAccountInput" disabled></div>
        <div><label>密码</label><input id="editPasswordInput"></div>
        <div><label>归属/备注</label><input id="editWechatInput" placeholder="兼职名，代理写：代理：名字"></div>
        <div><label>平台</label><select id="editPlatformInput"><option value="XX">XX</option><option value="qq">qq</option><option value="HH">HH</option><option value="TN">TN</option></select></div>
      </div>
      <div class="toolbar" style="margin-top:12px">
        <button id="saveAccountEditBtn">保存账号</button>
        <button class="danger" id="deleteAccountEditBtn">删除测试号</button>
        <button class="secondary" id="closeAccountEditBtn">关闭</button>
      </div>
      <div id="editAccountStatusBox" class="notice" style="display:none"></div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  <script>
(function (root) {
  const DEFAULT_PLATFORMS = {
    XX: {
      name: 'XX',
      link: 'https://www.u8mm0j2j4.com/',
      workerRate: 0,
      bossRate: 0,
      timeLabel: '7:00-8:00 8:30-9:30',
      patterns: [/^XX/i],
    },
    qq: {
      name: 'qq',
      link: 'https://www.ric1902rws.com/home',
      workerRate: 0,
      bossRate: 0,
      timeLabel: '8:01-8:20 8:40-9:20',
      patterns: [/^qq/i],
    },
    HH: {
      name: 'HH',
      link: 'https://www.o3a07dqjd8.com/',
      workerRate: 0,
      bossRate: 0,
      timeLabel: '10点 12点 15点',
      patterns: [/^HH/i, /^Hqq/i],
    },
    TN: {
      name: 'TN',
      link: 'https://www.hserr9zaq3du.com/home',
      workerRate: 0,
      bossRate: 0,
      timeLabel: '7:00-11:30 16-18',
      patterns: [/^TN/i],
    },
  };

  const STORAGE_KEY = 'settlement-tool-state-v2';
  const PLATFORM_ORDER = ['XX', 'qq', 'HH', 'TN'];
  const RATE_OVERRIDE_KEYS = [...PLATFORM_ORDER, 'hive'];
  const COOLDOWN_DAYS = 7;
  const DEFAULT_LABELS = {
    appTitle: '兼职结算核对工具',
    subtitle: '账号对应微信，回传自动算钱，每日数据一眼看清',
    bossName: '渠道',
  };
  const AGENT_SPARE_LABEL = '代理备用';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function createDefaultState() {
    return {
      version: 2,
      selectedDate: today(),
      platforms: clone(DEFAULT_PLATFORMS),
      accounts: [],
      assignments: [],
      agents: [],
      labels: clone(DEFAULT_LABELS),
      rateOverrides: { worker: {}, agent: {} },
      hive: { accounts: [], rates: { worker: 0, agent: 0, boss: 0 } },
      days: {},
    };
  }

  function detectPlatform(account) {
    const value = String(account || '').trim();
    for (const [key, config] of Object.entries(DEFAULT_PLATFORMS)) {
      if (config.patterns.some((pattern) => pattern.test(value))) return key;
    }
    return '';
  }

  function parseAccountRoster(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const withName = line.match(/^(\S+)\s+([^\s(（]+)\s*[\(（]([^）)]+)[\)）]?/);
        if (withName) {
          const account = withName[1].trim();
          return {
            account,
            password: withName[2].trim(),
            wechat: withName[3].trim(),
            platform: detectPlatform(account),
          };
        }

        const plain = line.match(/^(\S+)\s+(\S+)(?:\s+(.+))?$/);
        if (!plain) return null;
        const account = plain[1].trim();
        const owner = String(plain[3] || '').trim().replace(/^[（(]\s*/, '').replace(/\s*[）)]$/, '');
        return {
          account,
          password: plain[2].trim(),
          wechat: owner,
          platform: detectPlatform(account),
        };
      })
      .filter(Boolean);
  }

  function parseReturnText(text) {
    const rows = [];
    const pendingAccounts = [];
    const looseNumbers = [];

    String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const accountMatch = line.match(/[A-Za-z]{2}[A-Za-z0-9._-]*/);
        if (accountMatch) {
          const account = accountMatch[0].trim();
          const afterAccount = line.slice(accountMatch.index + account.length);
          const numberMatch = afterAccount.match(/-?\d+/);
          if (numberMatch) {
            const count = Math.max(0, Number.parseInt(numberMatch[0], 10) || 0);
            rows.push({ account, count, platform: detectPlatform(account), source: line });
          } else {
            pendingAccounts.push({ account, source: line });
          }
          return;
        }

        const numbers = line.match(/-?\d+/g);
        if (numbers) looseNumbers.push(...numbers);
      });

    pendingAccounts.forEach((item, index) => {
      if (index >= looseNumbers.length) return;
      const count = Math.max(0, Number.parseInt(looseNumbers[index], 10) || 0);
      rows.push({
        account: item.account,
        count,
        platform: detectPlatform(item.account),
        source: `${item.source} ${looseNumbers[index]}`,
      });
    });

    return rows;
  }

  function normalizeHiveAccountValue(value) {
    return String(value || '').trim();
  }

  function hiveKey(account) {
    return normalizeHiveAccountValue(account).toLowerCase();
  }

  function isHiveAccount(value) {
    return /LSZB1/i.test(String(value || ''));
  }

  function normalizeHiveAccount(row) {
    return {
      account: normalizeHiveAccountValue(row && row.account),
      ownerType: row && row.ownerType === 'agent' ? 'agent' : 'worker',
      owner: String(row && row.owner || '').trim(),
    };
  }

  function normalizeHiveState(hive) {
    const source = hive && typeof hive === 'object' ? hive : {};
    const rates = source.rates && typeof source.rates === 'object' ? source.rates : {};
    const unique = new Map();
    (Array.isArray(source.accounts) ? source.accounts : []).map(normalizeHiveAccount).forEach((row) => {
      if (!row.account) return;
      unique.set(hiveKey(row.account), row);
    });
    return {
      accounts: [...unique.values()].sort((a, b) => a.account.localeCompare(b.account)),
      rates: {
        worker: Number(rates.worker) || 0,
        agent: Number(rates.agent) || 0,
        boss: Number(rates.boss) || 0,
      },
    };
  }

  function excelSerialToDate(value) {
    const serial = Number(value);
    if (!Number.isFinite(serial)) return '';
    const date = new Date(Date.UTC(1899, 11, 30));
    date.setUTCDate(date.getUTCDate() + serial);
    return date.toISOString().slice(0, 10);
  }

  function parseHiveRosterRows(rows, options = {}) {
    const ownerType = options.ownerType === 'agent' ? 'agent' : 'worker';
    const owner = String(options.owner || '').trim();
    return (rows || [])
      .map((row) => {
        const cells = Array.isArray(row) ? row : [row];
        const account = normalizeHiveAccountValue(cells.find((cell) => isHiveAccount(cell)) || cells[0]);
        if (!account || account === '账号' || !isHiveAccount(account)) return null;
        const inlineOwner = String(cells[1] || cells[2] || '').trim();
        return {
          account,
          ownerType,
          owner: owner || inlineOwner,
        };
      })
      .filter(Boolean);
  }

  function parseHiveRosterText(text, options = {}) {
    const rows = String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+/));
    return parseHiveRosterRows(rows, options);
  }

  function parseHiveReturnRows(rows) {
    const map = new Map();
    (rows || []).forEach((row) => {
      const cells = Array.isArray(row) ? row : [row];
      const accountIndex = cells.findIndex((cell) => isHiveAccount(cell));
      if (accountIndex < 0) return;
      const account = normalizeHiveAccountValue(cells[accountIndex]);
      const countCell = cells.slice(accountIndex + 1).find((cell) => cell !== '' && cell !== null && cell !== undefined && Number.isFinite(Number(cell)));
      const count = Math.max(0, Number(countCell) || 0);
      const dateCell = cells.find((cell, index) => index !== accountIndex && Number.isFinite(Number(cell)) && Number(cell) > 30000);
      const date = excelSerialToDate(dateCell);
      const key = hiveKey(account);
      const existing = map.get(key) || { account, count: 0, date };
      existing.count += count;
      if (!existing.date && date) existing.date = date;
      map.set(key, existing);
    });
    return [...map.values()];
  }

  function parseHiveReturnText(text) {
    const rows = String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+/));
    return parseHiveReturnRows(rows);
  }

  function upsertHiveAccounts(state, rows) {
    state.hive = normalizeHiveState(state.hive);
    const map = new Map(state.hive.accounts.map((row) => [hiveKey(row.account), row]));
    (rows || []).map(normalizeHiveAccount).forEach((row) => {
      if (!row.account) return;
      map.set(hiveKey(row.account), row);
    });
    state.hive.accounts = [...map.values()].sort((a, b) => a.account.localeCompare(b.account));
    return state.hive.accounts;
  }

  function deleteHiveAccount(state, account) {
    state.hive = normalizeHiveState(state.hive);
    const before = state.hive.accounts.length;
    const key = hiveKey(account);
    state.hive.accounts = state.hive.accounts.filter((row) => hiveKey(row.account) !== key);
    return { deleted: state.hive.accounts.length !== before };
  }

  function hiveSettlement(state, date = today()) {
    const hive = normalizeHiveState(state.hive);
    const day = (state.days || {})[date] || {};
    const returns = Array.isArray(day.hiveReturns) ? day.hiveReturns : [];
    const accountMap = new Map(hive.accounts.map((row) => [hiveKey(row.account), row]));
    const rows = returns.map((item) => {
      const count = Number(item.count) || 0;
      const account = normalizeHiveAccountValue(item.account);
      const matched = accountMap.get(hiveKey(account));
      const ownerType = matched ? matched.ownerType : 'worker';
      const owner = matched && matched.owner ? matched.owner : '未匹配';
      const baseRate = ownerType === 'agent' ? hive.rates.agent : hive.rates.worker;
      const rate = rateForOwner({
        type: ownerType,
        name: owner,
        platform: 'hive',
        platforms: {},
        rateOverrides: state.rateOverrides,
        fallbackRate: baseRate,
      });
      const payable = money(count * rate);
      const receivable = money(count * hive.rates.boss);
      return {
        task: '蜂箱',
        account,
        count,
        ownerType,
        owner,
        rate,
        payable,
        receivable,
        profit: money(receivable - payable),
        matched: Boolean(matched && matched.owner),
      };
    });
    const unmatched = rows.filter((row) => !row.matched && row.count > 0);
    return { rows, unmatched };
  }

  function emptyTaskSummary() {
    const platforms = {};
    PLATFORM_ORDER.forEach((platform) => {
      platforms[platform] = { platform, count: 0, payable: 0, receivable: 0, profit: 0, activeAccounts: 0 };
    });
    return { count: 0, payable: 0, receivable: 0, profit: 0, activeAccounts: 0, platforms };
  }

  function addTaskSummary(target, source) {
    target.count += Number(source.count) || 0;
    target.payable = money(target.payable + (Number(source.payable) || 0));
    target.receivable = money(target.receivable + (Number(source.receivable) || 0));
    target.profit = money(target.profit + (Number(source.profit) || 0));
    if (Number(source.count) > 0 || Number(source.activeAccounts) > 0) target.activeAccounts += Number(source.activeAccounts) || 1;
    if (source.platforms) {
      Object.entries(source.platforms).forEach(([platform, row]) => {
        if (!target.platforms[platform]) target.platforms[platform] = { platform, count: 0, payable: 0, receivable: 0, profit: 0, activeAccounts: 0 };
        addTaskSummary(target.platforms[platform], row);
      });
    }
  }

  function calculateCombinedSettlement({ state, date = today(), douyinSettlement }) {
    const douyin = douyinSettlement || calculateSettlement({
      accounts: state.accounts,
      assignments: state.assignments,
      date,
      returns: ((state.days || {})[date] || {}).returns || [],
      platforms: state.platforms,
      rateOverrides: state.rateOverrides,
    });
    const hive = hiveSettlement(state, date);
    const groups = new Map();

    function ensure(type, name) {
      const cleanName = String(name || '').trim() || '未匹配';
      const key = `${type === 'agent' ? 'agent' : 'worker'}:${cleanName}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          type: type === 'agent' ? 'agent' : 'worker',
          name: cleanName,
          douyin: emptyTaskSummary(),
          hive: emptyTaskSummary(),
          total: emptyTaskSummary(),
        });
      }
      return groups.get(key);
    }

    (douyin.byAssigneePlatform || []).forEach((row) => {
      if (!row.count) return;
      const group = ensure(row.assigneeType, row.wechat);
      addTaskSummary(group.douyin, row);
      addTaskSummary(group.total, row);
    });

    hive.rows.forEach((row) => {
      if (!row.count || !row.matched) return;
      const group = ensure(row.ownerType, row.owner);
      addTaskSummary(group.hive, row);
      addTaskSummary(group.total, row);
    });

    const rows = [...groups.values()].sort((a, b) => b.total.count - a.total.count || a.name.localeCompare(b.name, 'zh-Hans-CN'));
    return {
      rows,
      workers: rows.filter((row) => row.type !== 'agent'),
      agents: rows.filter((row) => row.type === 'agent'),
      hiveRows: hive.rows,
      hiveUnmatched: hive.unmatched,
      total: rows.reduce((sum, row) => {
        addTaskSummary(sum, row.total);
        return sum;
      }, emptyTaskSummary()),
    };
  }

  function money(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function dateToTime(date) {
    return new Date(`${date}T00:00:00`).getTime();
  }

  function addDays(date, days) {
    const [year, month, day] = date.split('-').map(Number);
    const dt = new Date(Date.UTC(year, month - 1, day));
    dt.setUTCDate(dt.getUTCDate() + days);
    return dt.toISOString().slice(0, 10);
  }

  function isDateWithin(date, startDate, endDate) {
    if (!date || !startDate) return false;
    const target = dateToTime(date);
    const start = dateToTime(startDate);
    const end = endDate ? dateToTime(endDate) : Infinity;
    return target >= start && target <= end;
  }

  function normalizePlatformConfig(platforms) {
    const merged = clone(DEFAULT_PLATFORMS);
    for (const key of Object.keys(merged)) {
      if (platforms && platforms[key]) {
        merged[key].workerRate = Number(platforms[key].workerRate) || 0;
        merged[key].bossRate = Number(platforms[key].bossRate) || 0;
        merged[key].link = platforms[key].link || merged[key].link;
        merged[key].timeLabel = platforms[key].timeLabel || merged[key].timeLabel;
      }
    }
    return merged;
  }

  function normalizeLabels(labels) {
    const source = labels && typeof labels === 'object' ? labels : {};
    const bossName = String(source.bossName || DEFAULT_LABELS.bossName).trim() || DEFAULT_LABELS.bossName;
    return {
      appTitle: String(source.appTitle || DEFAULT_LABELS.appTitle).trim() || DEFAULT_LABELS.appTitle,
      subtitle: String(source.subtitle || DEFAULT_LABELS.subtitle).trim() || DEFAULT_LABELS.subtitle,
      bossName: bossName === '\u4e0a\u5bb6' ? '渠道' : bossName,
    };
  }

  function normalizeAccount(account) {
    const platform = account.platform || detectPlatform(account.account);
    return {
      account: account.account,
      password: account.password || '',
      wechat: account.wechat || '',
      platform,
    };
  }

  function parseOwnerInput(value, fallbackType = 'worker') {
    const text = String(value || '').trim();
    const match = text.match(/^代理[：:\-\s]*(.+)$/);
    if (match && match[1].trim()) return { type: 'agent', name: match[1].trim() };
    return { type: fallbackType === 'agent' ? 'agent' : 'worker', name: text };
  }

  function normalizeRateOverrides(rateOverrides) {
    const normalized = { worker: {}, agent: {} };
    ['worker', 'agent'].forEach((type) => {
      const source = rateOverrides && rateOverrides[type] && typeof rateOverrides[type] === 'object' ? rateOverrides[type] : {};
      Object.entries(source).forEach(([name, rates]) => {
        const cleanName = String(name || '').trim();
        if (!cleanName || !rates || typeof rates !== 'object') return;
        normalized[type][cleanName] = {};
        RATE_OVERRIDE_KEYS.forEach((platform) => {
          if (rates[platform] !== undefined && rates[platform] !== '') {
            normalized[type][cleanName][platform] = Number(rates[platform]) || 0;
          }
        });
      });
    });
    return normalized;
  }

  function setAssigneeRate(state, { type = 'worker', name, platform, rate }) {
    const ownerType = type === 'agent' ? 'agent' : 'worker';
    const ownerName = String(name || '').trim();
    if (!ownerName) return false;
    if (!RATE_OVERRIDE_KEYS.includes(platform)) return false;
    state.rateOverrides = normalizeRateOverrides(state.rateOverrides);
    if (!state.rateOverrides[ownerType][ownerName]) state.rateOverrides[ownerType][ownerName] = {};
    if (rate === '' || rate === null || rate === undefined) {
      delete state.rateOverrides[ownerType][ownerName][platform];
      if (!Object.keys(state.rateOverrides[ownerType][ownerName]).length) delete state.rateOverrides[ownerType][ownerName];
      return true;
    }
    state.rateOverrides[ownerType][ownerName][platform] = Number(rate) || 0;
    return true;
  }

  function rateForOwner({ type, name, platform, platforms, rateOverrides, fallbackRate }) {
    const ownerType = type === 'agent' ? 'agent' : 'worker';
    const ownerName = String(name || '').trim();
    const overrides = normalizeRateOverrides(rateOverrides);
    if (ownerName && overrides[ownerType] && overrides[ownerType][ownerName] && overrides[ownerType][ownerName][platform] !== undefined) {
      return Number(overrides[ownerType][ownerName][platform]) || 0;
    }
    if (fallbackRate !== null && fallbackRate !== undefined && fallbackRate !== '') return Number(fallbackRate) || 0;
    const config = normalizePlatformConfig(platforms);
    const rates = config[platform] || { workerRate: 0 };
    return Number(rates.workerRate) || 0;
  }

  function findAssignment(assignments, account, date) {
    return (assignments || [])
      .filter((item) => item.account === account && isDateWithin(date, item.startDate, item.endDate || ''))
      .sort((a, b) => dateToTime(b.startDate) - dateToTime(a.startDate))[0] || null;
  }

  function activeAssignment(assignments, account) {
    return (assignments || [])
      .filter((item) => item.account === account && !item.endDate)
      .sort((a, b) => dateToTime(b.startDate) - dateToTime(a.startDate))[0] || null;
  }

  function lastEndedAssignment(assignments, account) {
    return (assignments || [])
      .filter((item) => item.account === account && item.endDate)
      .sort((a, b) => dateToTime(b.endDate) - dateToTime(a.endDate))[0] || null;
  }

  function accountStatus(state, account, date) {
    const active = activeAssignment(state.assignments, account);
    if (active) return { status: 'assigned', assignment: active };
    const base = (state.accounts || []).find((item) => item.account === account);
    if (base && String(base.wechat || '').trim() === AGENT_SPARE_LABEL) {
      return { status: 'agent_spare' };
    }
    if (base && String(base.wechat || '').trim()) {
      return { status: 'manual', assignee: String(base.wechat).trim(), assigneeType: 'worker' };
    }
    const last = lastEndedAssignment(state.assignments, account);
    if (last) {
      const availableDate = addDays(last.endDate, COOLDOWN_DAYS);
      if (dateToTime(date) < dateToTime(availableDate)) {
        return { status: 'cooldown', lastAssignment: last, availableDate };
      }
    }
    return { status: 'free' };
  }

  function accountOwnerLabel(state, account, date = today()) {
    const status = accountStatus(state, account, date);
    if (status.status === 'assigned') {
      const prefix = status.assignment.assigneeType === 'agent' ? '代理：' : '';
      return `${prefix}${status.assignment.assignee}`;
    }
    if (status.status === 'manual') return status.assignee;
    if (status.status === 'cooldown' && status.lastAssignment) {
      const prefix = status.lastAssignment.assigneeType === 'agent' ? '代理：' : '';
      return `${prefix}${status.lastAssignment.assignee}`;
    }
    const base = (state.accounts || []).find((item) => item.account === account);
    return base ? String(base.wechat || '').trim() : '';
  }

  function availableAccounts(state, date = today(), platforms = PLATFORM_ORDER) {
    const wanted = new Set(platforms);
    return (state.accounts || [])
      .map(normalizeAccount)
      .filter((account) => wanted.has(account.platform))
      .filter((account) => accountStatus(state, account.account, date).status === 'free')
      .sort((a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform) || a.account.localeCompare(b.account));
  }

  function upsertAgent(state, agent, rate) {
    const name = String(agent || '').trim();
    if (!name) return null;
    state.agents = Array.isArray(state.agents) ? state.agents : [];
    const existing = state.agents.find((item) => item.name === name);
    if (existing) {
      if (rate !== undefined && rate !== '') existing.rate = Number(rate) || 0;
      return existing;
    }
    const item = { name, rate: Number(rate) || 0 };
    state.agents.push(item);
    return item;
  }

  function createAssignment({ account, assignee, assigneeType, startDate, rate }) {
    return {
      id: `${account}-${assigneeType}-${assignee}-${startDate}-${Math.random().toString(36).slice(2, 8)}`,
      account,
      assignee,
      assigneeType,
      startDate,
      endDate: '',
      rate: rate === undefined || rate === '' ? null : Number(rate),
    };
  }

  function assignAccountsToWorker(state, { wechat, startDate = today(), platforms = PLATFORM_ORDER }) {
    const name = String(wechat || '').trim();
    if (!name) return { assigned: [], missing: platforms.slice(), text: '' };
    state.assignments = Array.isArray(state.assignments) ? state.assignments : [];
    const selected = [];
    const missing = [];

    for (const platform of platforms) {
      const candidate = availableAccounts(state, startDate, [platform])[0];
      if (!candidate) {
        missing.push(platform);
        continue;
      }
      selected.push(candidate);
    }

    if (missing.length) return { assigned: [], missing, text: '' };

    selected.forEach((candidate) => {
      state.assignments.push(createAssignment({
        account: candidate.account,
        assignee: name,
        assigneeType: 'worker',
        startDate,
      }));
    });

    return { assigned: selected, missing: [], text: formatAssignmentText(selected, state.platforms) };
  }

  function assignAccountsToAgent(state, { agent, rate, startDate = today(), accounts = [] }) {
    const item = upsertAgent(state, agent, rate);
    if (!item) return { assigned: [], skipped: [] };
    state.assignments = Array.isArray(state.assignments) ? state.assignments : [];
    const accountSet = new Set(accounts);
    const assigned = [];
    const skipped = [];
    for (const account of state.accounts.map(normalizeAccount)) {
      if (!accountSet.has(account.account)) continue;
      if (accountStatus(state, account.account, startDate).status !== 'free') {
        skipped.push(account);
        continue;
      }
      state.assignments.push(createAssignment({
        account: account.account,
        assignee: item.name,
        assigneeType: 'agent',
        startDate,
        rate: item.rate,
      }));
      assigned.push(account);
    }
    return { assigned, skipped };
  }

  function mergeAccount(existing, incoming) {
    const current = existing || {};
    return {
      account: incoming.account || current.account,
      password: incoming.password || current.password || '',
      wechat: incoming.wechat || current.wechat || '',
      platform: incoming.platform || current.platform || detectPlatform(incoming.account || current.account),
    };
  }

  function upsertAccounts(state, accounts) {
    state.accounts = Array.isArray(state.accounts) ? state.accounts : [];
    const map = new Map(state.accounts.map((item) => [item.account, normalizeAccount(item)]));
    accounts.map(normalizeAccount).forEach((item) => {
      if (!item.account) return;
      map.set(item.account, mergeAccount(map.get(item.account), item));
    });
    state.accounts = [...map.values()].sort((a, b) => a.account.localeCompare(b.account));
    return state.accounts;
  }

  function updateAccount(state, { account, password, wechat, platform }) {
    const target = String(account || '').trim();
    if (!target) return null;
    state.accounts = Array.isArray(state.accounts) ? state.accounts : [];
    const item = state.accounts.find((row) => row.account === target);
    if (!item) return null;
    if (password !== undefined) item.password = String(password || '').trim();
    if (wechat !== undefined) item.wechat = String(wechat || '').trim();
    if (platform !== undefined && PLATFORM_ORDER.includes(platform)) item.platform = platform;
    if (!item.platform) item.platform = detectPlatform(item.account);
    if (wechat !== undefined) {
      const active = activeAssignment(state.assignments, target);
      if (active) {
        const owner = parseOwnerInput(wechat, active.assigneeType);
        if (owner.name) {
          active.assignee = owner.name;
          active.assigneeType = owner.type;
        }
      }
    }
    return normalizeAccount(item);
  }

  function importAccountsForAgent(state, { agent, rate, startDate = today(), text = '', platform = '' }) {
    const fallbackPlatform = PLATFORM_ORDER.includes(platform) ? platform : '';
    const imported = parseAccountRoster(text).map((item) => ({
      ...item,
      wechat: '',
      platform: fallbackPlatform || item.platform,
    }));
    upsertAccounts(state, imported);
    const result = assignAccountsToAgent(state, {
      agent,
      rate,
      startDate,
      accounts: imported.map((item) => item.account),
    });
    return { imported, assigned: result.assigned, skipped: result.skipped };
  }

  function inventorySummary(state, date = today()) {
    const byPlatform = {};
    PLATFORM_ORDER.forEach((platform) => {
      byPlatform[platform] = { free: 0, assigned: 0, manual: 0, cooldown: 0, total: 0 };
    });

    (state.accounts || []).map(normalizeAccount).forEach((account) => {
      const platform = account.platform || 'unknown';
      if (!byPlatform[platform]) byPlatform[platform] = { free: 0, assigned: 0, manual: 0, cooldown: 0, total: 0 };
      const status = accountStatus(state, account.account, date).status;
      byPlatform[platform].total += 1;
      byPlatform[platform][status] = (byPlatform[platform][status] || 0) + 1;
    });

    const freeSets = Math.min(...PLATFORM_ORDER.map((platform) => byPlatform[platform].free || 0));
    const assignedSets = Math.min(...PLATFORM_ORDER.map((platform) => (byPlatform[platform].assigned || 0) + (byPlatform[platform].manual || 0)));
    const cooldownSets = Math.min(...PLATFORM_ORDER.map((platform) => byPlatform[platform].cooldown || 0));
    return {
      byPlatform,
      freeAccounts: PLATFORM_ORDER.reduce((sum, platform) => sum + (byPlatform[platform].free || 0), 0),
      assignedAccounts: PLATFORM_ORDER.reduce((sum, platform) => sum + (byPlatform[platform].assigned || 0) + (byPlatform[platform].manual || 0), 0),
      cooldownAccounts: PLATFORM_ORDER.reduce((sum, platform) => sum + (byPlatform[platform].cooldown || 0), 0),
      totalAccounts: PLATFORM_ORDER.reduce((sum, platform) => sum + (byPlatform[platform].total || 0), 0),
      freeSets,
      assignedSets,
      cooldownSets,
    };
  }

  function renameAssignee(state, { from, to }) {
    const oldName = String(from || '').trim();
    const newName = String(to || '').trim();
    if (!oldName || !newName || oldName === newName) return 0;
    let changed = 0;
    (state.accounts || []).forEach((account) => {
      if (String(account.wechat || '').trim() === oldName) {
        account.wechat = newName;
        changed += 1;
      }
    });
    (state.assignments || []).forEach((assignment) => {
      if (String(assignment.assignee || '').trim() === oldName) {
        assignment.assignee = newName;
        changed += 1;
      }
    });
    (state.agents || []).forEach((agent) => {
      if (String(agent.name || '').trim() === oldName) {
        agent.name = newName;
        changed += 1;
      }
    });
    return changed;
  }

  function releaseAssignment(state, account, endDate = today()) {
    const active = activeAssignment(state.assignments, account);
    if (!active) return null;
    if (!hasReturnForAccount(state, account)) {
      state.assignments = (state.assignments || []).filter((item) => item.id !== active.id);
      return { ...active, immediate: true };
    }
    active.endDate = endDate;
    return { ...active, immediate: false };
  }

  function revokeActiveAssignment(state, account) {
    const active = activeAssignment(state.assignments, account);
    if (!active) return null;
    state.assignments = (state.assignments || []).filter((item) => item.id !== active.id);
    return active;
  }

  function recycleAgentAccount(state, account) {
    const item = (state.accounts || []).find((row) => row.account === account);
    if (!item) return { recycled: false, reason: '账号不存在' };
    const active = activeAssignment(state.assignments, account);
    if (active && active.assigneeType !== 'agent') {
      return { recycled: false, reason: '这个账号不是代理账号，不能回收到代理备用仓库' };
    }
    state.assignments = (state.assignments || []).filter((row) => row.account !== account || row.endDate || row.assigneeType !== 'agent');
    item.wechat = AGENT_SPARE_LABEL;
    return { recycled: true, reason: '' };
  }

  function assignAgentSpareAccount(state, { account, agent, rate, startDate = today() }) {
    const name = String(agent || '').trim();
    if (!name) return { assigned: false, reason: '请填写代理名称' };
    const item = (state.accounts || []).find((row) => row.account === account);
    if (!item) return { assigned: false, reason: '账号不存在' };
    if (accountStatus(state, account, startDate).status !== 'agent_spare') {
      return { assigned: false, reason: '这个账号不在代理备用仓库' };
    }
    item.wechat = '';
    const result = assignAccountsToAgent(state, {
      agent: name,
      rate,
      startDate,
      accounts: [account],
    });
    if (!result.assigned.length) {
      item.wechat = AGENT_SPARE_LABEL;
      return { assigned: false, reason: '分配失败' };
    }
    return { assigned: true, reason: '' };
  }

  function hasReturnForAccount(state, account) {
    return Object.values(state.days || {}).some((day) => (day.returns || []).some((row) => row.account === account && Number(row.count) > 0));
  }

  function deleteAccountSafely(state, account) {
    const hasAccount = (state.accounts || []).some((row) => row.account === account);
    if (!hasAccount) return { deleted: false, reason: '账号不存在' };
    if (hasReturnForAccount(state, account)) {
      return { deleted: false, reason: '这个账号已有回传单数，不能删除，避免结算记录断掉。' };
    }
    state.assignments = (state.assignments || []).filter((item) => item.account !== account);
    state.accounts = state.accounts.filter((item) => item.account !== account);
    return { deleted: true, reason: '' };
  }

  function formatAssignmentText(accounts, platforms = DEFAULT_PLATFORMS) {
    const config = normalizePlatformConfig(platforms);
    const labels = ['一', '二', '三', '四'];
    return accounts
      .sort((a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform))
      .map((account, index) => {
        const platform = config[account.platform] || {};
        return [
          `${labels[index] || index + 1}、时间${platform.timeLabel || ''}`,
          platform.link || '',
          `账号：${account.account}`,
          `密码：${account.password || ''}`,
        ].join('\n');
      })
      .join('\n');
  }

  function calculateSettlement({ accounts = [], assignments = [], date = today(), returns = [], platforms = DEFAULT_PLATFORMS, rateOverrides = {} }) {
    const config = normalizePlatformConfig(platforms);
    const accountMap = new Map();
    accounts.map(normalizeAccount).forEach((item) => {
      if (item.account) accountMap.set(item.account, item);
    });

    const countMap = new Map();
    returns.forEach((item) => {
      if (!item.account) return;
      countMap.set(item.account, {
        account: item.account,
        count: Number(item.count) || 0,
        platform: item.platform || detectPlatform(item.account),
      });
    });

    const allAccounts = new Set([...accountMap.keys(), ...countMap.keys()]);
    const accountRows = [...allAccounts].sort().map((account) => {
      const base = accountMap.get(account) || { account, password: '', wechat: '', platform: detectPlatform(account) };
      const returned = countMap.get(account) || { count: 0, platform: base.platform || detectPlatform(account) };
      const platform = base.platform || returned.platform || detectPlatform(account);
      const rates = config[platform] || { workerRate: 0, bossRate: 0 };
      const assignment = findAssignment(assignments, account, date);
      const count = Number(returned.count) || 0;
      const assigneeType = assignment ? assignment.assigneeType : 'worker';
      const assignee = assignment ? assignment.assignee : (base.wechat || (accountMap.has(account) ? '未备注' : '未匹配'));
      const workerRate = rateForOwner({
        type: assigneeType,
        name: assignee,
        platform,
        platforms: config,
        rateOverrides,
        fallbackRate: assignment && assignment.rate !== null && assignment.rate !== undefined ? assignment.rate : null,
      });
      const payable = money(count * workerRate);
      const receivable = money(count * rates.bossRate);
      return {
        account,
        password: base.password || '',
        wechat: assignee,
        assignee,
        assigneeType,
        platform,
        count,
        workerRate,
        payable,
        receivable,
        profit: money(receivable - payable),
        matched: accountMap.has(account),
        assignment,
      };
    });

    const byPlatformMap = new Map();
    const byWechatMap = new Map();
    const byAssigneePlatformMap = new Map();
    for (const row of accountRows) {
      addSummary(byPlatformMap, row.platform || '未知', row);
      addSummary(byWechatMap, row.wechat || '未备注', row);
      addAssigneePlatformSummary(byAssigneePlatformMap, row);
    }

    const total = accountRows.reduce(
      (sum, row) => ({
        count: sum.count + row.count,
        payable: money(sum.payable + row.payable),
        receivable: money(sum.receivable + row.receivable),
        profit: money(sum.profit + row.profit),
      }),
      { count: 0, payable: 0, receivable: 0, profit: 0 }
    );

    return {
      total,
      accountRows,
      byPlatform: [...byPlatformMap.values()].sort((a, b) => a.key.localeCompare(b.key)),
      byWechat: [...byWechatMap.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
      byAssigneePlatform: [...byAssigneePlatformMap.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
      unmatched: accountRows.filter((row) => !row.matched && row.count > 0),
    };
  }

  function agentReturnRows(settlement, agentName = '') {
    const name = String(agentName || '').trim();
    return (settlement.accountRows || [])
      .filter((row) => row.assigneeType === 'agent')
      .filter((row) => row.count > 0)
      .filter((row) => !name || row.wechat === name)
      .sort((a, b) => String(a.wechat).localeCompare(String(b.wechat), 'zh-Hans-CN') || PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform) || a.account.localeCompare(b.account))
      .map((row) => ({
        agent: row.wechat,
        account: row.account,
        platform: row.platform || detectPlatform(row.account),
        count: row.count,
      }));
  }

  function formatAgentReturnText(rows) {
    return (rows || []).map((row) => `${row.account} ${row.count}`).join('\n');
  }

  function csvCell(value) {
    const text = String(value === undefined || value === null ? '' : value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function formatAgentReturnCsv(rows) {
    const lines = [['代理名称', '任务', '平台', '账号', '成功数', '失败数', '结算状态'].map(csvCell).join(',')];
    (rows || []).forEach((row) => {
      lines.push([
        row.agent,
        row.task || '抖音团购',
        row.platform || detectPlatform(row.account),
        row.account,
        row.count,
        row.failCount || 0,
        row.status || '待结算',
      ].map(csvCell).join(','));
    });
    return lines.join('\n');
  }

  function parseCsvLine(line) {
    const cells = [];
    let current = '';
    let quoted = false;
    for (let index = 0; index < String(line || '').length; index += 1) {
      const char = line[index];
      if (char === '"') {
        if (quoted && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (char === ',' && !quoted) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current);
    return cells.map((cell) => cell.trim());
  }

  function parseAgentReturnCsv(text) {
    const lines = String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return { rows: [], errors: ['没有可导入的数据'] };
    const header = parseCsvLine(lines[0]);
    const required = ['代理名称', '平台', '账号', '成功数'];
    const indexMap = {};
    header.forEach((name, index) => { indexMap[name] = index; });
    const errors = [];
    required.forEach((name) => {
      if (indexMap[name] === undefined) errors.push(`表头缺少${name}`);
    });
    if (errors.length) return { rows: [], errors };

    const rows = [];
    lines.slice(1).forEach((line, lineIndex) => {
      const rowNo = lineIndex + 2;
      const cells = parseCsvLine(line);
      const account = String(cells[indexMap['账号']] || '').trim();
      const successRaw = cells[indexMap['成功数']];
      const count = Number(successRaw);
      if (!account) {
        errors.push(`第 ${rowNo} 行格式有误，缺少账号`);
        return;
      }
      if (successRaw === undefined || successRaw === '' || !Number.isFinite(count)) {
        errors.push(`第 ${rowNo} 行格式有误，缺少成功数`);
        return;
      }
      rows.push({
        agent: String(cells[indexMap['代理名称']] || '').trim(),
        task: indexMap['任务'] === undefined ? '' : String(cells[indexMap['任务']] || '').trim(),
        platform: String(cells[indexMap['平台']] || '').trim() || detectPlatform(account),
        account,
        count: Math.max(0, count || 0),
        failCount: indexMap['失败数'] === undefined ? 0 : Math.max(0, Number(cells[indexMap['失败数']]) || 0),
        status: indexMap['结算状态'] === undefined ? '' : String(cells[indexMap['结算状态']] || '').trim(),
      });
    });
    return { rows, errors };
  }

  function addAssigneePlatformSummary(map, row) {
    const name = row.wechat || '未备注';
    const key = `${row.assigneeType || 'worker'}:${name}`;
    if (!map.has(key)) {
      const platforms = {};
      PLATFORM_ORDER.forEach((platform) => {
        platforms[platform] = {
          platform,
          count: 0,
          payable: 0,
          receivable: 0,
          profit: 0,
          activeAccounts: 0,
        };
      });
      map.set(key, {
        key,
        wechat: name,
        assigneeType: row.assigneeType,
        count: 0,
        payable: 0,
        receivable: 0,
        profit: 0,
        activeAccounts: 0,
        platforms,
      });
    }

    const item = map.get(key);
    if (!item.platforms[row.platform]) {
      item.platforms[row.platform] = {
        platform: row.platform,
        count: 0,
        payable: 0,
        receivable: 0,
        profit: 0,
        activeAccounts: 0,
      };
    }
    const platform = item.platforms[row.platform];
    item.count += row.count;
    item.payable = money(item.payable + row.payable);
    item.receivable = money(item.receivable + row.receivable);
    item.profit = money(item.profit + row.profit);
    platform.count += row.count;
    platform.payable = money(platform.payable + row.payable);
    platform.receivable = money(platform.receivable + row.receivable);
    platform.profit = money(platform.profit + row.profit);
    if (row.count > 0) {
      item.activeAccounts += 1;
      platform.activeAccounts += 1;
    }
    if (row.assigneeType === 'agent') item.assigneeType = 'agent';
  }

  function addSummary(map, key, row) {
    if (!map.has(key)) {
      map.set(key, {
        key,
        wechat: key,
        platform: key,
        assigneeType: row.assigneeType,
        count: 0,
        payable: 0,
        receivable: 0,
        profit: 0,
        activeAccounts: 0,
      });
    }
    const item = map.get(key);
    item.count += row.count;
    item.payable = money(item.payable + row.payable);
    item.receivable = money(item.receivable + row.receivable);
    item.profit = money(item.profit + row.profit);
    if (row.count > 0) item.activeAccounts += 1;
    if (row.assigneeType === 'agent') item.assigneeType = 'agent';
  }

  function serializeState(state) {
    return JSON.stringify(state, null, 2);
  }

  function cryptoApi() {
    const api = root.crypto || (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
    if (!api || !api.subtle) throw new Error('当前浏览器不支持加密同步');
    return api;
  }

  function bytesToBase64(bytes) {
    if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function base64ToBytes(value) {
    if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(value, 'base64'));
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }

  async function deriveCloudKey(password, syncCode, salt, iterations = 150000) {
    if (!password || String(password).length < 6) throw new Error('同步密码至少 6 位');
    if (!syncCode) throw new Error('请填写同步码');
    const subtle = cryptoApi().subtle;
    const encoder = new TextEncoder();
    const material = await subtle.importKey(
      'raw',
      encoder.encode(`${syncCode}:${password}`),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encryptCloudPayload(plainText, password, syncCode) {
    const crypto = cryptoApi();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const iterations = 150000;
    const key = await deriveCloudKey(password, syncCode, salt, iterations);
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(String(plainText || ''))
    );
    return {
      v: 1,
      algorithm: 'AES-GCM',
      kdf: 'PBKDF2-SHA256',
      iterations,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      cipher: bytesToBase64(new Uint8Array(cipher)),
      updatedAt: new Date().toISOString(),
    };
  }

  async function decryptCloudPayload(payload, password, syncCode) {
    const item = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (!item || !item.salt || !item.iv || !item.cipher) throw new Error('云端数据格式不正确');
    const salt = base64ToBytes(item.salt);
    const iv = base64ToBytes(item.iv);
    const cipher = base64ToBytes(item.cipher);
    const key = await deriveCloudKey(password, syncCode, salt, item.iterations || 150000);
    const plain = await cryptoApi().subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plain);
  }

  function normalizeSupabaseUrl(url) {
    const base = String(url || '').trim().replace(/\/+$/, '');
    if (!base) return '';
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base)) {
      throw new Error('Supabase 地址应填写完整项目地址，例如：https://xxxx.supabase.co');
    }
    return base;
  }

  function cloudFriendlyError(error) {
    const message = String(error && error.message ? error.message : error || '');
    if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
      return '无法连接 Supabase。请检查 Supabase 地址是否完整（例如 https://xxxx.supabase.co）、anon key 是否复制完整、是否已执行建表 SQL，手机/电脑网络是否能访问 Supabase。';
    }
    if (/Supabase 地址/.test(message)) return message;
    return message || '未知错误';
  }

  function buildSupabaseRequest({ url, key, syncCode, payload }) {
    const base = normalizeSupabaseUrl(url);
    const id = String(syncCode || '').trim();
    if (!base || !key || !id) throw new Error('请填写 Supabase 地址、anon key 和同步码');
    return {
      endpoint: `${base}/rest/v1/settlement_sync?on_conflict=id`,
      downloadEndpoint: `${base}/rest/v1/settlement_sync?id=eq.${encodeURIComponent(id)}&select=payload,updated_at`,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: {
        id,
        payload: JSON.stringify(payload),
        updated_at: new Date().toISOString(),
      },
    };
  }

  function cloudTableSql() {
    return [
      'create table if not exists public.settlement_sync (',
      '  id text primary key,',
      '  payload text not null,',
      '  updated_at timestamptz not null default now()',
      ');',
      '',
      'alter table public.settlement_sync enable row level security;',
      '',
      'drop policy if exists "anon can manage encrypted sync" on public.settlement_sync;',
      'create policy "anon can manage encrypted sync"',
      'on public.settlement_sync',
      'for all',
      'to anon',
      'using (true)',
      'with check (true);',
    ].join('\n');
  }

  function mergeAccountRows(state, rows) {
    const next = restoreState(state);
    const map = new Map(next.accounts.map((row) => [row.account, row]));
    rows.map(normalizeAccount).forEach((row) => {
      if (!row.account) return;
      map.set(row.account, { ...map.get(row.account), ...row, platform: row.platform || detectPlatform(row.account) });
    });
    next.accounts = [...map.values()].sort((a, b) => a.account.localeCompare(b.account));
    return next;
  }

  function parseLooseBackupAccounts(text) {
    const rows = [];
    const blocks = String(text || '').match(/\{[^{}]*"account"\s*:\s*"[^"]+"[^{}]*\}/g) || [];
    blocks.forEach((block) => {
      try {
        const item = JSON.parse(block.replace(/,\s*\}/g, '}'));
        if (item && item.account) rows.push(item);
      } catch (error) {
        // Fall back to line scanning below.
      }
    });

    const found = new Set(rows.map((row) => row.account));
    let current = null;
    String(text || '').split(/\r?\n/).forEach((line) => {
      const account = line.match(/"account"\s*:\s*"([^"]+)"/);
      if (account) {
        if (current && current.account && !found.has(current.account)) rows.push(current);
        current = { account: account[1] };
        return;
      }
      if (!current) return;
      const password = line.match(/"password"\s*:\s*"([^"]*)"/);
      if (password) current.password = password[1];
      const wechat = line.match(/"wechat"\s*:\s*"([^"]*)"/);
      if (wechat) current.wechat = wechat[1];
      const platform = line.match(/"platform"\s*:\s*"([^"]*)"/);
      if (platform) current.platform = platform[1];
    });
    if (current && current.account && !found.has(current.account)) rows.push(current);

    const unique = new Map();
    rows.forEach((row) => {
      if (!row.account) return;
      unique.set(row.account, {
        account: row.account,
        password: row.password || '',
        wechat: row.wechat || '',
        platform: row.platform || detectPlatform(row.account),
      });
    });
    return [...unique.values()];
  }

  function importBackupState(currentState, input) {
    const text = String(input || '').trim();
    if (!text) throw new Error('empty backup');

    const fullBackup = extractFullBackup(text);
    if (fullBackup) {
      return { state: restoreState(fullBackup), mode: 'full', count: 0 };
    }

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const rows = parsed.filter((item) => item && item.account);
        if (!rows.length) throw new Error('no account rows');
        return { state: mergeAccountRows(currentState, rows), mode: 'accounts', count: rows.length };
      }
      if (parsed && parsed.account) {
        return { state: mergeAccountRows(currentState, [parsed]), mode: 'accounts', count: 1 };
      }
      return { state: restoreState(parsed), mode: 'full', count: 0 };
    } catch (error) {
      const rows = parseLooseBackupAccounts(text);
      if (!rows.length) throw error;
      return { state: mergeAccountRows(currentState, rows), mode: 'accounts', count: rows.length };
    }
  }

  function extractFullBackup(text) {
    const value = String(text || '').trim();
    const candidates = [];

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'string') candidates.push(parsed);
      if (isFullBackupObject(parsed)) return parsed;
    } catch (error) {
      // Try looser extraction below.
    }

    const quoted = value.match(/setItem\s*\(\s*["']settlement-tool-state-v\d+["']\s*,\s*(['"])([\s\S]*?)\1\s*\)/);
    if (quoted) {
      try {
        candidates.push(JSON.parse(quoted[1] + quoted[2] + quoted[1]));
      } catch (error) {
        candidates.push(quoted[2]);
      }
    }

    const first = value.indexOf('{');
    const last = value.lastIndexOf('}');
    if (first >= 0 && last > first) candidates.push(value.slice(first, last + 1));

    for (const candidate of candidates) {
      try {
        const parsed = typeof candidate === 'string' ? JSON.parse(candidate) : candidate;
        if (typeof parsed === 'string') {
          const nested = JSON.parse(parsed);
          if (isFullBackupObject(nested)) return nested;
        }
        if (isFullBackupObject(parsed)) return parsed;
      } catch (error) {
        // Continue with the next candidate.
      }
    }
    return null;
  }

  function isFullBackupObject(value) {
    return Boolean(value && typeof value === 'object' && (
      Array.isArray(value.accounts) ||
      Array.isArray(value.assignments) ||
      value.days ||
      value.platforms
    ));
  }

  function scanStoredBackups(storage) {
    if (!storage || typeof storage.length !== 'number') return [];
    const rows = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key) continue;
      const raw = storage.getItem(key);
      let parsed = null;
      try {
        parsed = extractFullBackup(raw) || JSON.parse(raw);
      } catch (error) {
        parsed = null;
      }
      if (!isFullBackupObject(parsed)) continue;
      const state = restoreState(parsed);
      rows.push({
        key,
        accounts: state.accounts.length,
        assignments: state.assignments.length,
        agents: state.agents.length,
        days: Object.keys(state.days || {}).length,
        raw,
      });
    }
    return rows.sort((a, b) => b.accounts - a.accounts || b.assignments - a.assignments || a.key.localeCompare(b.key));
  }

  function restoreState(json) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    const defaults = createDefaultState();
    return {
      ...defaults,
      ...parsed,
      version: 2,
      platforms: normalizePlatformConfig(parsed.platforms),
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts.map(normalizeAccount) : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
      agents: Array.isArray(parsed.agents) ? parsed.agents : [],
      labels: normalizeLabels(parsed.labels),
      rateOverrides: normalizeRateOverrides(parsed.rateOverrides),
      hive: normalizeHiveState(parsed.hive),
      days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
    };
  }

  function saveState(state) {
    if (!root.localStorage) return;
    root.localStorage.setItem(STORAGE_KEY, serializeState(state));
  }

  function loadState() {
    if (!root.localStorage) return createDefaultState();
    const raw = root.localStorage.getItem(STORAGE_KEY) || root.localStorage.getItem('settlement-tool-state-v1');
    if (!raw) return createDefaultState();
    try {
      return restoreState(raw);
    } catch (error) {
      return createDefaultState();
    }
  }

  const api = {
    DEFAULT_PLATFORMS,
    DEFAULT_LABELS,
    PLATFORM_ORDER,
    COOLDOWN_DAYS,
    STORAGE_KEY,
    AGENT_SPARE_LABEL,
    createDefaultState,
    detectPlatform,
    parseAccountRoster,
    parseReturnText,
    parseHiveRosterRows,
    parseHiveRosterText,
    parseHiveReturnRows,
    parseHiveReturnText,
    upsertHiveAccounts,
    deleteHiveAccount,
    hiveSettlement,
    calculateCombinedSettlement,
    calculateSettlement,
    agentReturnRows,
    formatAgentReturnText,
    formatAgentReturnCsv,
    parseAgentReturnCsv,
    availableAccounts,
    accountStatus,
    accountOwnerLabel,
    inventorySummary,
    renameAssignee,
    setAssigneeRate,
    assignAccountsToWorker,
    assignAccountsToAgent,
    importAccountsForAgent,
    releaseAssignment,
    revokeActiveAssignment,
    recycleAgentAccount,
    assignAgentSpareAccount,
    deleteAccountSafely,
    updateAccount,
    formatAssignmentText,
    serializeState,
    encryptCloudPayload,
    decryptCloudPayload,
    buildSupabaseRequest,
    cloudFriendlyError,
    cloudTableSql,
    importBackupState,
    scanStoredBackups,
    restoreState,
    saveState,
    loadState,
    money,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.SettlementTool = api;
})(typeof window !== 'undefined' ? window : globalThis);

</script>
  <script>
    const T = window.SettlementTool;
    const CLOUD_CONFIG_KEY = 'settlement-cloud-config-v1';
    let state = T.loadState();
    const $ = (id) => document.getElementById(id);

    function currentReturns() {
      const day = state.days[state.selectedDate] || { returns: [] };
      return Array.isArray(day.returns) ? day.returns : [];
    }

    function currentHiveReturns() {
      const day = state.days[state.selectedDate] || { hiveReturns: [] };
      return Array.isArray(day.hiveReturns) ? day.hiveReturns : [];
    }

    function setCurrentReturns(returns) {
      state.days[state.selectedDate] = { ...(state.days[state.selectedDate] || {}), returns };
      T.saveState(state);
    }

    function setCurrentHiveReturns(hiveReturns) {
      state.days[state.selectedDate] = { ...(state.days[state.selectedDate] || {}), hiveReturns };
      T.saveState(state);
    }

    function result() {
      return T.calculateSettlement({
        accounts: state.accounts,
        assignments: state.assignments,
        date: state.selectedDate,
        returns: currentReturns(),
        platforms: state.platforms,
        rateOverrides: state.rateOverrides,
      });
    }

    function combinedResult() {
      return T.calculateCombinedSettlement({
        state,
        date: state.selectedDate,
        douyinSettlement: result(),
      });
    }

    function render() {
      $('selectedDate').value = state.selectedDate;
      renderDisplayLabels();
      renderPlatformSelect();
      renderStats();
      renderPlatformTable();
      renderInventory();
      renderAssignInventory();
      renderUnmatched();
      renderAccounts();
      renderOwnerGroups();
      renderAgentAccountDetails();
      renderHive();
      renderAssignmentPanel();
      renderReturns();
      renderWechat();
      renderAgentAccountDaily();
      renderAgentExport();
      renderCopyText();
      renderSettlementScreenshot();
      renderPriceSettings();
      renderOwnerRates();
      renderCloudSettings();
      renderDataStatus();
    }

    function yuan(value) {
      return '￥' + T.money(value).toFixed(2);
    }

    function labels() {
      return state.labels || T.DEFAULT_LABELS;
    }

    function bossLabel(suffix = '') {
      return `${labels().bossName || T.DEFAULT_LABELS.bossName}${suffix}`;
    }

    function renderDisplayLabels() {
      const current = labels();
      document.title = current.appTitle || T.DEFAULT_LABELS.appTitle;
      $('appTitleText').textContent = current.appTitle || T.DEFAULT_LABELS.appTitle;
      $('appSubtitleText').textContent = current.subtitle || T.DEFAULT_LABELS.subtitle;
      if ($('appTitleInput')) $('appTitleInput').value = current.appTitle || T.DEFAULT_LABELS.appTitle;
      if ($('appSubtitleInput')) $('appSubtitleInput').value = current.subtitle || T.DEFAULT_LABELS.subtitle;
      if ($('bossNameInput')) $('bossNameInput').value = current.bossName || T.DEFAULT_LABELS.bossName;
    }

    function renderStats() {
      const r = combinedResult();
      $('stats').innerHTML = [
        ['今日总单', r.total.count + ' 单', ''],
        [bossLabel('应收'), yuan(r.total.receivable), ''],
        ['兼职应付', yuan(r.total.payable), ''],
        ['预估利润', yuan(r.total.profit), r.total.profit >= 0 ? 'profit' : 'loss'],
      ].map(([title, value, cls]) => `
        <div class="card">
          <div class="stat-title">${title}</div>
          <div class="stat-value ${cls}">${value}</div>
        </div>
      `).join('');
    }

    function table(headers, rows, emptyText) {
      if (!rows.length) return `<tbody><tr><td class="empty">${emptyText}</td></tr></tbody>`;
      return `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody>`;
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char]));
    }

    function platformHeader(platform) {
      const cfg = state.platforms[platform] || {};
      const link = cfg.link || '';
      const linkText = link.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `<div class="platform-head">
        <strong>${platform}</strong>
        ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener" title="${escapeHtml(link)}">${escapeHtml(linkText)}</a>` : ''}
      </div>`;
    }

    function accountCard(row) {
      if (!row || !row.account) return '-';
      const account = escapeHtml(row.account);
      const password = escapeHtml(row.password || '');
      return `<div class="account-card">
        <div class="account-line"><strong>${account}</strong><button class="mini-copy" data-copy-value="${account}">复制账号</button></div>
        <div class="account-line"><span class="small muted">${password || '无密码'}</span>${password ? `<button class="mini-copy" data-copy-value="${password}">复制密码</button>` : ''}</div>
        <div class="account-line"><button class="mini-copy" data-edit-account="${account}">编辑</button></div>
      </div>`;
    }

    function idleAccountCard(row) {
      if (!row || !row.account) return '-';
      const account = escapeHtml(row.account);
      const password = escapeHtml(row.password || '');
      return `<div class="account-card">
        <div class="account-line"><strong>${account}</strong><button class="mini-copy" data-copy-value="${account}">复制账号</button></div>
        <div class="account-line"><span class="small muted">${password || '无密码'}</span>${password ? `<button class="mini-copy" data-copy-value="${password}">复制密码</button>` : ''}</div>
        <div class="account-line"><button class="mini-copy" data-edit-account="${account}">编辑</button></div>
      </div>`;
    }

    function agentAccountCard(row) {
      if (!row || !row.account) return '-';
      const account = escapeHtml(row.account);
      const password = escapeHtml(row.password || '');
      return `<div class="account-card">
        <div class="account-line"><strong>${account}</strong><button class="mini-copy" data-copy-value="${account}">复制账号</button></div>
        <div class="account-line"><span class="small muted">${password || '无密码'}</span>${password ? `<button class="mini-copy" data-copy-value="${password}">复制密码</button>` : ''}</div>
        <div class="account-line"><button class="mini-copy" data-edit-account="${account}">编辑</button><button class="mini-copy" data-recycle-agent-account="${account}">回收到备用</button></div>
      </div>`;
    }

    function agentSpareRows(keyword = '') {
      const needle = String(keyword || '').trim().toLowerCase();
      return state.accounts
        .map((row) => ({ ...row, platform: row.platform || T.detectPlatform(row.account) }))
        .filter((row) => T.accountStatus(state, row.account, state.selectedDate).status === 'agent_spare')
        .filter((row) => !needle || [row.account, row.password, row.platform].some((value) => String(value || '').toLowerCase().includes(needle)))
        .sort((a, b) => T.PLATFORM_ORDER.indexOf(a.platform) - T.PLATFORM_ORDER.indexOf(b.platform) || a.account.localeCompare(b.account));
    }

    function selectableAccountCard(row) {
      if (!row || !row.account) return '-';
      const account = escapeHtml(row.account);
      const password = escapeHtml(row.password || '');
      return `<label class="account-card">
        <div class="account-line"><input type="checkbox" data-agent-account="${account}"><strong>${account}</strong></div>
        <div class="account-line"><span class="small muted">${password || '无密码'}</span></div>
      </label>`;
    }

    function renderPlatformTable() {
      const r = result();
      const rows = Object.keys(state.platforms).map((key) => {
        const item = r.byPlatform.find((row) => row.key === key) || { count: 0, payable: 0, receivable: 0, profit: 0 };
        const cfg = state.platforms[key];
        return `<tr>
          <td><span class="badge">${key}</span></td>
          <td>${item.count}</td>
          <td>${cfg.bossRate}</td>
          <td>${yuan(item.payable)}</td>
          <td>${yuan(item.receivable)}</td>
          <td class="${item.profit >= 0 ? 'ok' : 'warn'}">${yuan(item.profit)}</td>
        </tr>`;
      });
      $('platformTable').innerHTML = table(['平台', '单数', bossLabel('价'), '应付', '应收', '利润'], rows, '暂无数据');
    }

    function renderUnmatched() {
      const unmatched = result().unmatched;
      if (!unmatched.length) {
        $('unmatchedBox').innerHTML = '<div class="empty">没有回传未匹配账号<br><span class="small muted">这里只显示“回传里有单数、但账号底册里没有”的账号。</span></div>';
        return;
      }
      $('unmatchedBox').innerHTML = `
        <div class="notice">这些账号有回传单数，但账号底册里没有。补到底册后才能准确结算。</div>
        <div class="table-wrap"><table>${table(['账号', '平台', '单数'], unmatched.map((row) => `<tr><td>${row.account}</td><td>${row.platform || '未知'}</td><td>${row.count}</td></tr>`), '暂无')}</table></div>
      `;
    }

    function renderInventory() {
      const summary = T.inventorySummary(state, state.selectedDate);
      $('inventoryBox').innerHTML = `
        <div class="grid stats">
          <div class="stat-title">空闲库存<br><b class="stat-value">${summary.freeSets}</b><br><span class="small muted">套 / ${summary.freeAccounts}个号</span></div>
          <div class="stat-title">已分配<br><b class="stat-value">${summary.assignedSets}</b><br><span class="small muted">套 / ${summary.assignedAccounts}个号</span></div>
          <div class="stat-title">7天隔离<br><b class="stat-value">${summary.cooldownSets}</b><br><span class="small muted">套 / ${summary.cooldownAccounts}个号</span></div>
          <div class="stat-title">总账号<br><b class="stat-value">${summary.totalAccounts}</b><br><span class="small muted">按四平台凑套</span></div>
        </div>
      `;
    }

    function renderAssignInventory() {
      const summary = T.inventorySummary(state, state.selectedDate);
      const workerGroups = ownerGroupDisplayRows('worker').length;
      const agentGroups = ownerGroupDisplayRows('agent').length;
      if (!$('assignInventoryBox')) return;
      $('assignInventoryBox').innerHTML = `
        <div class="grid stats">
          <div class="stat-title">可派发库存<br><b class="stat-value">${summary.freeSets}</b><br><span class="small muted">组 / ${summary.freeAccounts}个号</span></div>
          <div class="stat-title">已派出<br><b class="stat-value">${summary.assignedSets}</b><br><span class="small muted">组 / ${summary.assignedAccounts}个号</span></div>
          <div class="stat-title">兼职已派<br><b class="stat-value">${workerGroups}</b><br><span class="small muted">组</span></div>
          <div class="stat-title">代理已派<br><b class="stat-value">${agentGroups}</b><br><span class="small muted">组</span></div>
          <div class="stat-title">7天限制<br><b class="stat-value">${summary.cooldownSets}</b><br><span class="small muted">组 / ${summary.cooldownAccounts}个号</span></div>
          <div class="stat-title">总账号<br><b class="stat-value">${summary.totalAccounts}</b><br><span class="small muted">四个平台合计</span></div>
        </div>
      `;
    }

    function renderPlatformSelect() {
      if (!$('platformInput')) return;
      const html = Object.keys(state.platforms).map((key) => `<option value="${key}">${key}</option>`).join('');
      $('platformInput').innerHTML = html;
    }

    function applyImportPlatform(rows, platform) {
      if (!platform) return rows;
      return rows.map((row) => ({ ...row, platform }));
    }

    function syncManualAccountPlatform() {
      if (!$('accountInput') || !$('platformInput')) return;
      const account = $('accountInput').value.trim();
      const platform = T.detectPlatform(account);
      if (platform && state.platforms[platform]) {
        $('platformInput').value = platform;
        $('platformAutoHint').textContent = `已识别：${platform}`;
        $('platformAutoHint').className = 'small ok';
      } else {
        $('platformAutoHint').textContent = account ? '未识别，可手选' : '自动识别';
        $('platformAutoHint').className = account ? 'small warn' : 'small muted';
      }
    }

    function renderAccounts() {
      const keyword = $('accountSearch').value.trim().toLowerCase();
      const byPlatform = { XX: [], qq: [], HH: [], TN: [] };
      T.availableAccounts(state, state.selectedDate)
        .filter((row) => !keyword || [
          row.account,
          row.password,
          row.platform,
        ].some((value) => String(value || '').toLowerCase().includes(keyword)))
        .forEach((row) => {
          if (byPlatform[row.platform]) byPlatform[row.platform].push(row);
        });
      const maxRows = Math.max(0, ...Object.values(byPlatform).map((rows) => rows.length));
      const rows = Array.from({ length: maxRows }).map((_, index) => `<tr>
        <td>${idleAccountCard(byPlatform.XX[index])}</td>
        <td>${idleAccountCard(byPlatform.qq[index])}</td>
        <td>${idleAccountCard(byPlatform.HH[index])}</td>
        <td>${idleAccountCard(byPlatform.TN[index])}</td>
      </tr>`);
      $('accountsTable').innerHTML = table([platformHeader('XX'), platformHeader('qq'), platformHeader('HH'), platformHeader('TN')], rows, '当前没有闲置账号');
    }

    function ownerKindFromRemark(value) {
      const text = String(value || '').trim();
      if (!text) return { type: '', owner: '' };
      const match = text.match(/^代理[：:\-\s]*(.+)$/);
      if (match && match[1].trim()) return { type: 'agent', owner: match[1].trim() };
      if ((state.agents || []).some((agent) => agent && agent.name === text)) {
        return { type: 'agent', owner: text };
      }
      return { type: 'worker', owner: text };
    }

    function ownerGroupBuckets(type, keyword = '') {
      const buckets = new Map();
      const needle = String(keyword || '').trim().toLowerCase();
      state.accounts.map((row) => ({
        ...row,
        platform: row.platform || T.detectPlatform(row.account),
      })).forEach((row) => {
        const status = T.accountStatus(state, row.account, state.selectedDate);
        let owner = '';
        if (status.status === 'assigned' && status.assignment.assigneeType === type) {
          owner = status.assignment.assignee;
        } else if (status.status === 'manual') {
          const manual = ownerKindFromRemark(status.assignee);
          if (manual.type === type) owner = manual.owner;
        }
        if (!owner) return;
        if (needle && ![
          row.account,
          row.password,
          owner,
          row.platform,
        ].some((value) => String(value || '').toLowerCase().includes(needle))) return;
        if (!buckets.has(owner)) {
          buckets.set(owner, { owner, XX: [], qq: [], HH: [], TN: [] });
        }
        const group = buckets.get(owner);
        if (Object.prototype.hasOwnProperty.call(group, row.platform)) group[row.platform].push(row);
      });
      return [...buckets.values()].sort((a, b) => a.owner.localeCompare(b.owner, 'zh-Hans-CN'));
    }

    function ownerGroupDisplayRows(type, keyword = '') {
      return ownerGroupBuckets(type, keyword).flatMap((group) => {
        const rowCount = Math.max(1, ...T.PLATFORM_ORDER.map((platform) => group[platform].length));
        return Array.from({ length: rowCount }).map((_, index) => ({
          owner: index === 0 ? group.owner : '',
          XX: group.XX[index] || null,
          qq: group.qq[index] || null,
          HH: group.HH[index] || null,
          TN: group.TN[index] || null,
        }));
      });
    }

    function renderOwnerGroups() {
      const workerRows = ownerGroupDisplayRows('worker', $('workerGroupSearch').value).map((row) => `<tr>
        <td>${escapeHtml(row.owner)}</td>
        <td>${accountCard(row.XX)}</td>
        <td>${accountCard(row.qq)}</td>
        <td>${accountCard(row.HH)}</td>
        <td>${accountCard(row.TN)}</td>
      </tr>`);
      $('workerGroupTable').innerHTML = table(['微信', platformHeader('XX'), platformHeader('qq'), platformHeader('HH'), platformHeader('TN')], workerRows, '还没有派给兼职的账号');
    }

    function renderAgentAccountDetails() {
      const keyword = $('agentGroupSearch').value.trim().toLowerCase();
      const groups = ownerGroupBuckets('agent', keyword);
      $('agentAccountGroups').innerHTML = groups.length ? groups.map((group) => {
        const counts = T.PLATFORM_ORDER.map((platform) => `${platform} ${group[platform].length}个`).join(' ｜ ');
        const rowCount = Math.max(1, ...T.PLATFORM_ORDER.map((platform) => group[platform].length));
        const rows = Array.from({ length: rowCount }).map((_, index) => `<tr>
          <td>${agentAccountCard(group.XX[index])}</td>
          <td>${agentAccountCard(group.qq[index])}</td>
          <td>${agentAccountCard(group.HH[index])}</td>
          <td>${agentAccountCard(group.TN[index])}</td>
        </tr>`);
        return `<div class="card" style="margin-top:12px">
          <h3>${escapeHtml(group.owner)} <span class="small muted">${escapeHtml(counts)}</span></h3>
          <div class="table-wrap"><table>${table([platformHeader('XX'), platformHeader('qq'), platformHeader('HH'), platformHeader('TN')], rows, '这个代理还没有账号')}</table></div>
        </div>`;
      }).join('') : '<div class="empty">还没有代理账号</div>';

      const spareRows = agentSpareRows(keyword).map((row) => `<tr>
        <td>${escapeHtml(row.account)}</td>
        <td>${escapeHtml(row.password || '')}</td>
        <td><span class="badge">${escapeHtml(row.platform || '未知')}</span></td>
        <td><button class="secondary" data-edit-account="${escapeHtml(row.account)}">编辑</button> <button class="secondary" data-assign-agent-spare="${escapeHtml(row.account)}">分给代理</button></td>
      </tr>`);
      $('agentSpareTable').innerHTML = table(['账号', '密码', '平台', '操作'], spareRows, '代理备用仓库暂无账号');
    }

    function assignmentDisplayRows(keyword = '') {
      const needle = String(keyword || '').trim().toLowerCase();
      const matches = (values) => !needle || values.some((value) => String(value || '').toLowerCase().includes(needle));
      const rows = (state.assignments || []).slice().sort((a, b) => {
        if (!a.endDate && b.endDate) return -1;
        if (a.endDate && !b.endDate) return 1;
        return String(b.startDate).localeCompare(String(a.startDate));
      }).filter((item) => item.assigneeType !== 'agent').filter((item) => {
        const account = state.accounts.find((row) => row.account === item.account) || {};
        return matches([item.account, item.assignee, item.assigneeType, account.platform || T.detectPlatform(item.account)]);
      }).map((item) => {
        const account = state.accounts.find((row) => row.account === item.account) || {};
        const status = item.endDate ? `隔离中，${T.COOLDOWN_DAYS}天后可用` : '使用中';
        return `<tr>
          <td>${item.account}</td>
          <td><span class="badge">${account.platform || T.detectPlatform(item.account) || '未知'}</span></td>
          <td>${item.assigneeType === 'agent' ? '代理' : '兼职'}</td>
          <td>${item.assignee}</td>
          <td>${item.rate === null || item.rate === undefined ? '' : item.rate}</td>
          <td>${item.startDate}</td>
          <td>${item.endDate || '-'}</td>
          <td>${status}</td>
          <td>${item.endDate ? '' : `<button class="secondary" data-edit-account="${item.account}">编辑</button> <button class="secondary" data-revoke="${item.account}">撤销误分</button> <button class="danger" data-release="${item.account}">退号回收</button> <button class="danger" data-delete-account="${item.account}">删除测试号</button>`}</td>
        </tr>`;
      });

      const tracked = new Set((state.assignments || []).map((item) => item.account));
      const manualRows = state.accounts
        .filter((row) => !tracked.has(row.account))
        .map((row) => ({ ...row, platform: row.platform || T.detectPlatform(row.account) }))
        .filter((row) => String(row.wechat || '').trim())
        .filter((row) => ownerKindFromRemark(row.wechat).type !== 'agent')
        .filter((row) => matches([row.account, row.password, row.wechat, row.platform]))
        .map((row) => {
          const manual = ownerKindFromRemark(row.wechat);
          return `<tr>
            <td>${row.account}</td>
            <td><span class="badge">${row.platform || '未知'}</span></td>
            <td>${manual.type === 'agent' ? '代理' : '兼职'}</td>
            <td>${escapeHtml(manual.owner)}</td>
            <td></td>
            <td>备注归属</td>
            <td>-</td>
            <td>使用中</td>
            <td><button class="secondary" data-edit-account="${row.account}">编辑</button> <button class="danger" data-delete-account="${row.account}">删除测试号</button></td>
          </tr>`;
        });
      return rows.concat(manualRows);
    }

    function renderAssignmentPanel() {
      $('assignStartDate').value = state.selectedDate;
      $('agentStartDate').value = state.selectedDate;
      const assignmentRows = assignmentDisplayRows($('assignmentSearch').value);
      $('assignmentsTable').innerHTML = table(['账号', '平台', '类型', '归属', '代理价', '开始', '结束', '状态', '操作'], assignmentRows, '还没有兼职分配记录');
    }

    function renderReturns() {
      const rows = result().accountRows
        .filter((row) => row.count > 0 || currentReturns().some((item) => item.account === row.account))
        .map((row) => `<tr>
          <td>${row.account}</td>
          <td><span class="badge">${row.platform || '未知'}</span></td>
          <td>${row.wechat}</td>
          <td>${row.count}</td>
          <td>${yuan(row.payable)}</td>
          <td>${row.matched ? '<span class="ok">已匹配</span>' : '<span class="warn">未匹配</span>'}</td>
        </tr>`);
      $('returnTable').innerHTML = table(['账号', '平台', '微信', '单数', '应付兼职', '状态'], rows, '当天还没有回传数据');
    }

    function renderHive() {
      if (!$('hiveAccountTable')) return;
      state.hive = state.hive || { accounts: [], rates: { worker: 0, agent: 0, boss: 0 } };
      const keyword = $('hiveAccountSearch').value.trim().toLowerCase();
      const accountRows = (state.hive.accounts || [])
        .filter((row) => !keyword || [row.account, row.owner, row.ownerType].some((value) => String(value || '').toLowerCase().includes(keyword)))
        .map((row) => `<tr>
          <td>${escapeHtml(row.account)}</td>
          <td>${row.ownerType === 'agent' ? '代理' : '兼职'}</td>
          <td>${escapeHtml(row.owner || '未填写')}</td>
          <td><button class="danger" data-delete-hive-account="${escapeHtml(row.account)}">删除</button></td>
        </tr>`);
      $('hiveAccountTable').innerHTML = table(['蜂箱账号', '类型', '归属', '操作'], accountRows, '还没有蜂箱账号目录');

      const combined = combinedResult();
      const unmatchedRows = combined.hiveUnmatched.map((row) => `<tr>
        <td>${escapeHtml(row.account)}</td>
        <td>${row.count}</td>
        <td><button class="secondary" data-fill-hive-account="${escapeHtml(row.account)}">填到目录输入框</button></td>
      </tr>`);
      $('hiveUnmatchedBox').innerHTML = unmatchedRows.length
        ? `<div class="notice">这些蜂箱账号有回传单数，但目录里还没有归属。确认是谁的以后，选择归属类型和名称，再点“填到目录输入框”导入即可落实。</div><div class="table-wrap"><table>${table(['蜂箱账号', '成功数', '操作'], unmatchedRows, '暂无')}</table></div>`
        : '<div class="empty">没有蜂箱未匹配账号</div>';

      const hiveRows = combined.hiveRows
        .filter((row) => row.count > 0 || currentHiveReturns().some((item) => item.account === row.account))
        .map((row) => `<tr>
          <td>${escapeHtml(row.account)}</td>
          <td>${row.ownerType === 'agent' ? '代理' : '兼职'}</td>
          <td>${escapeHtml(row.owner)}</td>
          <td>${row.count}</td>
          <td>${yuan(row.payable)}</td>
          <td>${row.matched ? '<span class="ok">已匹配</span>' : '<span class="warn">未匹配</span>'}</td>
        </tr>`);
      $('hiveReturnTable').innerHTML = table(['蜂箱账号', '类型', '归属', '成功数', '应付', '状态'], hiveRows, '当天还没有蜂箱回传');
    }

    function renderWechat() {
      const r = combinedResult();
      const workerRows = r.workers
        .filter((row) => row.total.count > 0)
        .map((row) => `<tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${platformCell(row.douyin, 'XX')}</td>
        <td>${platformCell(row.douyin, 'qq')}</td>
        <td>${platformCell(row.douyin, 'HH')}</td>
        <td>${platformCell(row.douyin, 'TN')}</td>
        <td>${taskCell(row.hive)}</td>
        <td>${row.total.count}</td>
        <td>${yuan(row.total.payable)}</td>
      </tr>`);
      $('wechatTable').innerHTML = table(['微信', 'XX', 'qq', 'HH', 'TN', '蜂箱', '合计单数', '应付兼职'], workerRows, '当天还没有兼职结算数据');

      const agentRows = r.agents
        .filter((row) => row.total.count > 0)
        .map((row) => `<tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${platformCell(row.douyin, 'XX')}</td>
        <td>${platformCell(row.douyin, 'qq')}</td>
        <td>${platformCell(row.douyin, 'HH')}</td>
        <td>${platformCell(row.douyin, 'TN')}</td>
        <td>${taskCell(row.hive)}</td>
        <td>${row.total.count}</td>
        <td>${yuan(row.total.payable)}</td>
        <td>${yuan(row.total.receivable)}</td>
        <td>${yuan(row.total.profit)}</td>
      </tr>`);
      $('agentTable').innerHTML = table(['代理', 'XX', 'qq', 'HH', 'TN', '蜂箱', '合计单数', '应付代理', bossLabel('应收'), '利润'], agentRows, '当天还没有代理结算数据');
    }

    function screenshotTaskCell(row) {
      const pieces = ['XX', 'qq', 'HH', 'TN']
        .map((key) => {
          const item = row.douyin.platforms && row.douyin.platforms[key] ? row.douyin.platforms[key] : { count: 0, payable: 0 };
          return `<span class="screenshot-task">${key} ${item.count || 0}单<br><span class="small">${yuan(item.payable || 0)}</span></span>`;
        });
      const hive = row.hive || { count: 0, payable: 0 };
      pieces.push(`<span class="screenshot-task">蜂箱 ${hive.count || 0}单<br><span class="small">${yuan(hive.payable || 0)}</span></span>`);
      return pieces.join('');
    }

    function renderSettlementScreenshot() {
      if (!$('settlementScreenshotTable')) return;
      const rows = combinedResult().workers
        .filter((row) => row.total.count > 0)
        .map((row) => `<tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${screenshotTaskCell(row)}</td>
          <td class="screenshot-total">${row.total.count}单<br>${yuan(row.total.payable)}</td>
        </tr>`);
      $('settlementScreenshotTable').innerHTML = table(['微信', '任务明细', '合计应结'], rows, '当天还没有兼职结算数据');
    }

    function renderAgentAccountDaily() {
      const rows = result().accountRows
        .filter((row) => row.assigneeType === 'agent' && row.count > 0)
        .sort((a, b) => String(a.wechat).localeCompare(String(b.wechat), 'zh-Hans-CN') || T.PLATFORM_ORDER.indexOf(a.platform) - T.PLATFORM_ORDER.indexOf(b.platform) || a.account.localeCompare(b.account))
        .map((row) => `<tr>
          <td>${escapeHtml(row.wechat)}</td>
          <td>${escapeHtml(row.account)}</td>
          <td><span class="badge">${escapeHtml(row.platform || '未知')}</span></td>
          <td>${row.count}</td>
          <td>${yuan(row.payable)}</td>
          <td>${yuan(row.receivable)}</td>
          <td>${yuan(row.profit)}</td>
        </tr>`);
      $('agentAccountDailyTable').innerHTML = table(['代理', '账号', '平台', '单数', '应付代理', bossLabel('应收'), '利润'], rows, '当天还没有代理做单账号');
    }

    function currentAgentNames() {
      const hiveNames = combinedResult().hiveRows
        .filter((row) => row.ownerType === 'agent' && row.count > 0 && row.matched)
        .map((row) => row.owner);
      const names = [...new Set(T.agentReturnRows(result()).map((row) => row.agent).concat(hiveNames))];
      return names.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
    }

    function selectedAgentReturnRows() {
      const agent = $('agentExportSelect').value;
      const douyinRows = T.agentReturnRows(result(), agent).map((row) => ({ ...row, task: '抖音团购' }));
      const hiveRows = combinedResult().hiveRows
        .filter((row) => row.ownerType === 'agent' && row.count > 0 && row.matched)
        .filter((row) => !agent || row.owner === agent)
        .map((row) => ({ agent: row.owner, account: row.account, platform: '蜂箱', count: row.count, task: '蜂箱' }));
      return douyinRows.concat(hiveRows);
    }

    function formatCombinedAgentReturnText(rows) {
      return (rows || []).map((row) => `${row.task || row.platform} ${row.account} ${row.count}`).join('\n');
    }

    function formatCombinedAgentReturnCsv(rows) {
      return T.formatAgentReturnCsv(rows || []);
    }

    function renderAgentExport() {
      const names = currentAgentNames();
      const current = $('agentExportSelect').value;
      $('agentExportSelect').innerHTML = names.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
      if (current && names.includes(current)) $('agentExportSelect').value = current;
      const rows = selectedAgentReturnRows();
      $('agentExportPreview').textContent = rows.length ? formatCombinedAgentReturnText(rows) : '当天还没有代理账号单数';
    }

    function platformCell(row, platform) {
      const item = row.platforms && row.platforms[platform] ? row.platforms[platform] : { count: 0, payable: 0 };
      if (!item.count) return '<span class="muted">0单<br>￥0.00</span>';
      return `<strong>${item.count}单</strong><br><span class="small">${yuan(item.payable)}</span>`;
    }

    function taskCell(item) {
      if (!item || !item.count) return '<span class="muted">0单<br>￥0.00</span>';
      return `<strong>${item.count}单</strong><br><span class="small">${yuan(item.payable)}</span>`;
    }

    function platformCopyPart(row, platform) {
      const item = row.platforms && row.platforms[platform] ? row.platforms[platform] : { count: 0, payable: 0 };
      if (!item.count) return '';
      return `${platform}${item.count}单/${yuan(item.payable)}`;
    }

    function combinedCopyLine(row) {
      const parts = [];
      const douyinParts = ['XX', 'qq', 'HH', 'TN'].map((key) => platformCopyPart(row.douyin, key)).filter(Boolean);
      if (douyinParts.length) parts.push(`抖音${douyinParts.join('，')}`);
      if (row.hive && row.hive.count) parts.push(`蜂箱${row.hive.count}单/${yuan(row.hive.payable)}`);
      return `${row.name}：${parts.join('，')}，合计${row.total.count}单，应结 ${yuan(row.total.payable)}`;
    }

    function renderCopyText() {
      const r = combinedResult();
      const workerLines = r.workers
        .filter((row) => row.total.count > 0)
        .map(combinedCopyLine);
      $('workerCopyText').textContent = [
        `${state.selectedDate} 兼职结算`,
        workerLines.length ? workerLines.join('\n') : '暂无兼职结算',
      ].join('\n');
    }

    function renderPriceSettings() {
      state.hive = state.hive || { accounts: [], rates: { worker: 0, agent: 0, boss: 0 } };
      $('priceSettings').innerHTML = Object.keys(state.platforms).map((key) => {
        const cfg = state.platforms[key];
        return `<div class="card">
          <h3><span class="badge">${key}</span></h3>
          <div class="platform-price">
            <div><label><span class="bossRateLabel">${escapeHtml(bossLabel('单价'))}</span></label><input data-boss-rate="${key}" type="number" step="0.01" value="${cfg.bossRate || ''}" placeholder="留空按 0 计算"></div>
          </div>
          <div style="margin-top:8px"><label>链接</label><input data-link="${key}" value="${cfg.link || ''}"></div>
        </div>`;
      }).join('');
      $('hiveWorkerRateInput').value = state.hive.rates.worker || '';
      $('hiveAgentRateInput').value = state.hive.rates.agent || '';
      $('hiveBossRateInput').value = state.hive.rates.boss || '';
    }

    function renderOwnerRates() {
      const overrides = state.rateOverrides || { worker: {}, agent: {} };
      const rows = [];
      ['worker', 'agent'].forEach((type) => {
        Object.entries(overrides[type] || {}).forEach(([name, rates]) => {
          T.PLATFORM_ORDER.concat(['hive']).forEach((platform) => {
            if (rates[platform] === undefined) return;
            rows.push(`<tr>
              <td>${type === 'agent' ? '代理' : '兼职'}</td>
              <td>${escapeHtml(name)}</td>
              <td><span class="badge">${platform === 'hive' ? '蜂箱' : platform}</span></td>
              <td>${rates[platform]}</td>
            </tr>`);
          });
        });
      });
      $('ownerRateTable').innerHTML = table(['类型', '姓名', '平台', '单价'], rows, '还没有单人价格');
    }

    function loadCloudConfig() {
      try {
        return JSON.parse(localStorage.getItem(CLOUD_CONFIG_KEY) || '{}');
      } catch (error) {
        return {};
      }
    }

    function saveCloudConfig() {
      const config = {
        url: $('cloudUrlInput').value.trim(),
        key: $('cloudKeyInput').value.trim(),
        syncCode: $('cloudSyncCodeInput').value.trim(),
      };
      localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
      return config;
    }

    function renderCloudSettings() {
      const config = loadCloudConfig();
      $('cloudUrlInput').value = config.url || '';
      $('cloudKeyInput').value = config.key || '';
      $('cloudSyncCodeInput').value = config.syncCode || '';
      $('cloudSqlText').value = T.cloudTableSql();
    }

    function renderDataStatus() {
      if (!$('dataStatusBox')) return;
      const days = Object.keys(state.days || {}).length;
      $('dataStatusBox').innerHTML = `当前页面数据：账号 ${state.accounts.length} 个，分配记录 ${state.assignments.length} 条，代理 ${state.agents.length} 个，日数据 ${days} 天。<br><span class="small muted">当前地址：${escapeHtml(location.href)}。换网址、换浏览器、换手机时，本地数据不会自动跟过去，要用备份或云同步。</span>`;
    }

    function renderStorageScan() {
      const rows = T.scanStoredBackups ? T.scanStoredBackups(localStorage) : [];
      if (!$('storageScanBox')) return;
      if (!rows.length) {
        $('storageScanBox').innerHTML = '<div class="empty">本页地址下没有扫描到其他可恢复数据。旧数据可能在旧网址、旧文件地址、手机浏览器或 GitHub 线上网址里。</div>';
        return;
      }
      const best = rows[0];
      $('storageScanBox').innerHTML = `
        <div class="notice">扫描到这些本页浏览器数据。建议先恢复账号最多的一条；恢复前可以先点“导出备份”留一份当前数据。</div>
        <div class="toolbar">
          <button data-restore-storage="0">恢复账号最多的数据（${best.accounts}个账号 / ${best.assignments}条分配）</button>
          <button class="secondary" id="copyBestStorageBtn" data-copy-storage="0">复制这条备份</button>
        </div>
        <div class="table-wrap" style="margin-bottom:12px"><table>${table(['存储项', '账号', '分配', '代理', '日数据', '操作'], rows.map((row, index) => `<tr>
          <td>${escapeHtml(row.key)}</td>
          <td>${row.accounts}</td>
          <td>${row.assignments}</td>
          <td>${row.agents}</td>
          <td>${row.days}</td>
          <td><button class="secondary" data-restore-storage="${index}">恢复这条</button></td>
        </tr>`), '暂无')}</table></div>
      `;
      window.__storageScanRows = rows;
    }

    function cloudConfigFromInputs() {
      const config = saveCloudConfig();
      const password = $('cloudPasswordInput').value;
      if (!password) throw new Error('请填写同步密码');
      return { ...config, password };
    }

    function friendlyCloudError(error) {
      return T.cloudFriendlyError ? T.cloudFriendlyError(error) : (error.message || error);
    }

    function openAccountEditor(account) {
      const item = state.accounts.find((row) => row.account === account);
      if (!item) return toast('没有找到这个账号');
      $('editAccountOriginal').value = item.account;
      $('editAccountInput').value = item.account;
      $('editPasswordInput').value = item.password || '';
      $('editWechatInput').value = item.wechat || '';
      $('editPlatformInput').value = item.platform || T.detectPlatform(item.account) || 'XX';
      $('editAccountStatusBox').style.display = 'none';
      $('editAccountPanel').style.display = 'block';
    }

    function closeAccountEditor() {
      $('editAccountPanel').style.display = 'none';
    }

    async function deleteAccountFromUi(account) {
      if (!await confirmDialog(`确定删除测试号 ${account}？\n只有没有回传订单的账号才会删除；有订单会自动拦截。`)) return;
      const result = T.deleteAccountSafely(state, account);
      if (!result.deleted) return toast(result.reason || '删除失败');
      T.saveState(state);
      closeAccountEditor();
      render();
      toast(`已删除测试号 ${account}`);
    }

    async function recycleAgentAccountFromUi(account) {
      if (!await confirmDialog(`确定把 ${account} 从当前代理回收到代理备用仓库？`)) return;
      const result = T.recycleAgentAccount(state, account);
      if (!result.recycled) return toast(result.reason || '回收失败');
      T.saveState(state);
      render();
      toast(`已回收到代理备用仓库：${account}`);
    }

    function assignAgentSpareFromUi(account) {
      const agent = $('agentSpareAssignNameInput').value.trim();
      if (!agent) return toast('请先填写要分给的新代理名称');
      const result = T.assignAgentSpareAccount(state, {
        account,
        agent,
        rate: $('agentSpareAssignRateInput').value,
        startDate: state.selectedDate,
      });
      if (!result.assigned) return toast(result.reason || '分配失败');
      T.saveState(state);
      render();
      toast(`已把 ${account} 分给代理 ${agent}`);
    }

    function rowsToReturnText(rows) {
      return rows
        .map((row) => Array.isArray(row) ? row : [])
        .map((row) => {
          const account = String(row[0] || '').trim();
          const count = String(row[1] === undefined ? '' : row[1]).trim();
          if (!account || !count || account === '账号') return '';
          return `${account} ${count}`;
        })
        .filter(Boolean)
        .join('\n');
    }

    async function spreadsheetRows(file) {
      const name = file.name.toLowerCase();
      if (name.endsWith('.csv') || name.endsWith('.txt')) {
        const text = await file.text();
        return text.split(/\r?\n/).map((line) => line.split(/\t|,/).map((cell) => cell.trim()));
      }
      if (!window.XLSX) {
        throw new Error('Excel解析库没有加载成功，可以把表格另存为CSV，或直接复制表格内容粘贴进来。');
      }
      const buffer = await file.arrayBuffer();
      const workbook = window.XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
    }

    function hiveRosterRowsToText(rows) {
      return T.parseHiveRosterRows(rows).map((row) => row.account).join('\n');
    }

    function hiveReturnRowsToText(rows) {
      return T.parseHiveReturnRows(rows).map((row) => `${row.account} ${row.count}`).join('\n');
    }

    async function handleReturnFile() {
      const file = $('returnFileInput').files && $('returnFileInput').files[0];
      if (!file) return toast('请先选择表格文件');
      const name = file.name.toLowerCase();
      if (name.endsWith('.csv') || name.endsWith('.txt')) {
        $('returnText').value = await file.text();
        toast('已读取文件内容，请点“解析并保存到当天”');
        return;
      }
      if (!window.XLSX) {
        toast('Excel解析库没有加载成功。可以把表格另存为CSV，或直接复制表格三列粘贴进来。');
        return;
      }
      const buffer = await file.arrayBuffer();
      const workbook = window.XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
      const text = rowsToReturnText(rows);
      if (!text) return toast('表格里没有识别到账号和审核通过单数');
      $('returnText').value = text;
      toast('已从表格提取账号和通过单数，请点“解析并保存到当天”');
    }

    async function uploadCloudBackup() {
      const config = cloudConfigFromInputs();
      const encrypted = await T.encryptCloudPayload(T.serializeState(state), config.password, config.syncCode);
      const request = T.buildSupabaseRequest({
        url: config.url,
        key: config.key,
        syncCode: config.syncCode,
        payload: encrypted,
      });
      const response = await fetch(request.endpoint, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(request.body),
      });
      if (!response.ok) throw new Error(await response.text());
      toast('已加密上传到云端');
    }

    async function downloadCloudBackup() {
      const config = cloudConfigFromInputs();
      const request = T.buildSupabaseRequest({
        url: config.url,
        key: config.key,
        syncCode: config.syncCode,
        payload: {},
      });
      const response = await fetch(request.downloadEndpoint, {
        method: 'GET',
        headers: request.headers,
      });
      if (!response.ok) throw new Error(await response.text());
      const rows = await response.json();
      if (!rows.length) throw new Error('云端还没有这个同步码的数据');
      const payload = typeof rows[0].payload === 'string' ? JSON.parse(rows[0].payload) : rows[0].payload;
      const backup = await T.decryptCloudPayload(payload, config.password, config.syncCode);
      state = T.restoreState(backup);
      T.saveState(state);
      render();
      toast('已从云端同步到当前设备');
    }

    function upsertAccounts(rows) {
      const map = new Map(state.accounts.map((row) => [row.account, row]));
      rows.forEach((row) => {
        if (!row.account) return;
        const existing = map.get(row.account) || {};
        map.set(row.account, {
          account: row.account,
          password: row.password || existing.password || '',
          wechat: row.wechat || existing.wechat || '',
          platform: row.platform || existing.platform || T.detectPlatform(row.account),
        });
      });
      state.accounts = [...map.values()].sort((a, b) => a.account.localeCompare(b.account));
      T.saveState(state);
      render();
    }

    function toast(message) {
      const box = $('toastBox');
      box.textContent = message;
      box.style.display = 'block';
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        box.style.display = 'none';
      }, 2400);
    }

    function confirmDialog(message, okText = '确认') {
      return new Promise((resolve) => {
        const mask = $('confirmMask');
        const msg = $('confirmMessage');
        const cancel = $('confirmCancelBtn');
        const ok = $('confirmOkBtn');
        const cleanup = (value) => {
          mask.style.display = 'none';
          cancel.onclick = null;
          ok.onclick = null;
          resolve(value);
        };
        msg.textContent = message;
        ok.textContent = okText;
        mask.style.display = 'flex';
        cancel.onclick = () => cleanup(false);
        ok.onclick = () => cleanup(true);
      });
    }

    function showInlineStatus(id, message, type = 'notice') {
      const box = $(id);
      if (!box) return;
      box.style.display = 'block';
      box.className = type === 'warn' ? 'notice warn' : 'notice';
      box.textContent = message;
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        toast('已复制');
      } catch (error) {
        $('backupText').value = text;
        toast('浏览器不允许自动复制，内容已放到备份框里，可手动复制');
      }
    }

    function downloadTextFile(filename, text, type = 'text/csv;charset=utf-8') {
      const blob = new Blob(['\ufeff' + text], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
        document.querySelectorAll('.view').forEach((item) => item.classList.remove('active'));
        tab.classList.add('active');
        $(tab.dataset.view).classList.add('active');
      });
    });

    $('selectedDate').addEventListener('change', (event) => {
      state.selectedDate = event.target.value;
      if (!state.days[state.selectedDate]) state.days[state.selectedDate] = { returns: [], hiveReturns: [] };
      if (!state.days[state.selectedDate].returns) state.days[state.selectedDate].returns = [];
      if (!state.days[state.selectedDate].hiveReturns) state.days[state.selectedDate].hiveReturns = [];
      T.saveState(state);
      render();
    });

    $('importRosterBtn').addEventListener('click', () => {
      const rows = applyImportPlatform(T.parseAccountRoster($('rosterText').value), $('rosterPlatformInput').value);
      if (!rows.length) {
        showInlineStatus('rosterStatusBox', '没有识别到账号。格式要像：XXjt57-73 密码(微信名)，每行一个。', 'warn');
        return toast('没有识别到账号。请检查格式：账号 密码(微信备注)');
      }
      upsertAccounts(rows);
      showInlineStatus('rosterStatusBox', `已识别 ${rows.length} 行，当前库存一共 ${state.accounts.length} 个账号。可以到“派发号 > 闲置账号”查看可派发账号。`);
      toast(`已导入/更新 ${rows.length} 个账号`);
    });

    $('clearRosterTextBtn').addEventListener('click', () => {
      $('rosterText').value = '';
      if ($('rosterStatusBox')) $('rosterStatusBox').style.display = 'none';
    });

    $('accountsTable').addEventListener('click', (event) => {
      const value = event.target.dataset.copyValue;
      if (value !== undefined) return copyText(value);
      const edit = event.target.dataset.editAccount;
      if (edit) return openAccountEditor(edit);
    });

    $('accountSearch').addEventListener('input', renderAccounts);
    $('workerGroupSearch').addEventListener('input', renderOwnerGroups);
    $('agentGroupSearch').addEventListener('input', renderOwnerGroups);
    $('assignmentSearch').addEventListener('input', renderAssignmentPanel);
    $('hiveAccountSearch').addEventListener('input', renderHive);

    function handleCopyFromTable(event) {
      const value = event.target.dataset.copyValue;
      if (value !== undefined) copyText(value);
      const edit = event.target.dataset.editAccount;
      if (edit) openAccountEditor(edit);
      const del = event.target.dataset.deleteAccount;
      if (del) deleteAccountFromUi(del);
      const recycle = event.target.dataset.recycleAgentAccount;
      if (recycle) recycleAgentAccountFromUi(recycle);
      const assignSpare = event.target.dataset.assignAgentSpare;
      if (assignSpare) assignAgentSpareFromUi(assignSpare);
    }

    $('workerGroupTable').addEventListener('click', handleCopyFromTable);
    $('agentAccountGroups').addEventListener('click', handleCopyFromTable);
    $('agentSpareTable').addEventListener('click', handleCopyFromTable);

    $('loadHiveRosterFileBtn').addEventListener('click', async () => {
      const file = $('hiveRosterFileInput').files && $('hiveRosterFileInput').files[0];
      if (!file) return toast('请先选择蜂箱账号表格');
      try {
        const text = hiveRosterRowsToText(await spreadsheetRows(file));
        if (!text) return toast('没有识别到蜂箱账号');
        $('hiveRosterText').value = text;
        toast('已读取蜂箱账号，请确认归属后导入');
      } catch (error) {
        toast(error.message || error);
      }
    });

    $('importHiveRosterBtn').addEventListener('click', () => {
      const owner = $('hiveOwnerInput').value.trim();
      if (!owner) return toast('请先填写蜂箱账号归属名称');
      const rows = T.parseHiveRosterText($('hiveRosterText').value, {
        ownerType: $('hiveOwnerTypeInput').value,
        owner,
      });
      if (!rows.length) return toast('没有识别到蜂箱账号');
      T.upsertHiveAccounts(state, rows);
      T.saveState(state);
      render();
      toast(`已导入/更新 ${rows.length} 个蜂箱账号`);
    });

    $('clearHiveRosterTextBtn').addEventListener('click', () => {
      $('hiveRosterText').value = '';
    });

    $('loadHiveReturnFileBtn').addEventListener('click', async () => {
      const file = $('hiveReturnFileInput').files && $('hiveReturnFileInput').files[0];
      if (!file) return toast('请先选择蜂箱回传表格');
      try {
        const text = hiveReturnRowsToText(await spreadsheetRows(file));
        if (!text) return toast('没有识别到蜂箱回传数据');
        $('hiveReturnText').value = text;
        toast('已读取蜂箱回传，请确认后保存');
      } catch (error) {
        toast(error.message || error);
      }
    });

    $('parseHiveReturnBtn').addEventListener('click', () => {
      const rows = T.parseHiveReturnText($('hiveReturnText').value);
      if (!rows.length) return toast('没有识别到蜂箱回传数据');
      const map = new Map(currentHiveReturns().map((row) => [row.account.toLowerCase(), row]));
      rows.forEach((row) => map.set(row.account.toLowerCase(), row));
      setCurrentHiveReturns([...map.values()]);
      render();
      toast(`已保存 ${rows.length} 条蜂箱数据到 ${state.selectedDate}`);
    });

    $('clearHiveReturnTextBtn').addEventListener('click', () => {
      $('hiveReturnText').value = '';
    });

    $('clearHiveReturnBtn').addEventListener('click', async () => {
      if (!await confirmDialog(`确定清空 ${state.selectedDate} 的蜂箱回传数据？`)) return;
      setCurrentHiveReturns([]);
      render();
    });

    $('hiveAccountTable').addEventListener('click', async (event) => {
      const account = event.target.dataset.deleteHiveAccount;
      if (!account) return;
      if (!await confirmDialog(`确定删除蜂箱账号 ${account}？\n只删除账号目录，不会删除已经导入的回传数据。`)) return;
      T.deleteHiveAccount(state, account);
      T.saveState(state);
      render();
      toast('蜂箱账号已删除');
    });

    $('hiveUnmatchedBox').addEventListener('click', (event) => {
      const account = event.target.dataset.fillHiveAccount;
      if (!account) return;
      $('hiveRosterText').value = account;
      toast('已填入目录输入框，选择归属后点导入蜂箱账号');
    });

    $('closeAccountEditBtn').addEventListener('click', closeAccountEditor);
    $('saveAccountEditBtn').addEventListener('click', () => {
      const account = $('editAccountOriginal').value;
      const updated = T.updateAccount(state, {
        account,
        password: $('editPasswordInput').value,
        wechat: $('editWechatInput').value,
        platform: $('editPlatformInput').value,
      });
      if (!updated) return toast('保存失败，没有找到这个账号');
      T.saveState(state);
      render();
      closeAccountEditor();
      toast('账号已保存');
    });
    $('deleteAccountEditBtn').addEventListener('click', () => {
      const account = $('editAccountOriginal').value;
      if (account) deleteAccountFromUi(account);
    });

    $('renameAssigneeBtn').addEventListener('click', () => {
      const from = $('renameFromInput').value.trim();
      const to = $('renameToInput').value.trim();
      if (!from || !to) return toast('请填写原微信名和要改成的微信名');
      const changed = T.renameAssignee(state, { from, to });
      T.saveState(state);
      render();
      toast(changed ? `已调整 ${changed} 条归属` : '没有找到需要调整的微信名');
    });

    $('assignWorkerBtn').addEventListener('click', async () => {
      const wechat = $('assignWechatInput').value.trim();
      if (!wechat) return toast('请先输入兼职微信号');
      const res = T.assignAccountsToWorker(state, {
        wechat,
        startDate: $('assignStartDate').value || state.selectedDate,
      });
      if (!res.assigned.length) {
        await confirmDialog(`库存不足，缺少：${res.missing.join('、')}\n\n发号规则是四个平台各 1 个，缺任意平台时不会发出残缺组合。`, '知道了');
        return;
      }
      T.saveState(state);
      $('assignmentText').value = res.text;
      render();
      toast('四个平台账号已分配');
    });

    $('copyAssignmentBtn').addEventListener('click', () => {
      copyText($('assignmentText').value || '暂无可复制的发号文本');
    });

    $('importAgentAccountsBtn').addEventListener('click', () => {
      const agent = $('agentNameInput').value.trim();
      if (!agent) return toast('请先输入代理名称');
      const text = $('agentImportText').value.trim();
      if (!text) return toast('请先粘贴代理要拿的新账号');
      const res = T.importAccountsForAgent(state, {
        agent,
        rate: $('agentRateInput').value,
        startDate: $('agentStartDate').value || state.selectedDate,
        text,
        platform: $('agentImportPlatformInput').value,
      });
      T.saveState(state);
      render();
      toast(`已归属到代理 ${res.assigned.length} 个账号${res.skipped.length ? `，跳过 ${res.skipped.length} 个不可用账号` : ''}`);
    });

    $('assignmentsTable').addEventListener('click', async (event) => {
      const edit = event.target.dataset.editAccount;
      if (edit) return openAccountEditor(edit);
      const del = event.target.dataset.deleteAccount;
      if (del) return deleteAccountFromUi(del);
      const account = event.target.dataset.release;
      const revoke = event.target.dataset.revoke;
      if (revoke) {
        if (!await confirmDialog(`确定撤销账号 ${revoke} 的当前分配？\n适合处理按错分给代理/兼职的情况，撤销后账号会立刻回到原本可用状态。`)) return;
        const revoked = T.revokeActiveAssignment(state, revoke);
        if (!revoked) return toast('这个账号当前没有使用中的分配记录');
        T.saveState(state);
        render();
        return toast(`已撤销 ${revoke} 的当前分配`);
      }
      if (!account) return;
      if (!await confirmDialog(`确定退号回收账号 ${account}？\n没有订单会立即释放；已有订单记录会进入 7 天隔离。`)) return;
      const released = T.releaseAssignment(state, account, state.selectedDate);
      if (!released) return toast('这个账号当前没有使用中的分配记录');
      T.saveState(state);
      render();
      toast(released.immediate ? `已释放 ${account}，可立即重新分配` : `已回收 ${account}，有订单记录，7 天后可重新分配`);
    });

    $('parseReturnBtn').addEventListener('click', () => {
      const rows = T.parseReturnText($('returnText').value);
      if (!rows.length) return toast('没有识别到回传数据');
      const map = new Map(currentReturns().map((row) => [row.account, row]));
      rows.forEach((row) => map.set(row.account, row));
      setCurrentReturns([...map.values()].sort((a, b) => a.account.localeCompare(b.account)));
      toast(`已保存 ${rows.length} 条回传数据到 ${state.selectedDate}`);
      render();
    });

    $('loadReturnFileBtn').addEventListener('click', handleReturnFile);

    $('sampleReturnBtn').addEventListener('click', () => {
      $('returnText').value = [
        'TN-MHB-mb0-01069 1 1',
        'XXjt57-83 24 3',
        'qqXX15-70 29 3',
        'HH-qq15.72 2 1',
      ].join('\n');
    });

    $('clearReturnTextBtn').addEventListener('click', () => {
      $('returnText').value = '';
      toast('已清空输入框，已保存数据不受影响');
    });

    $('clearReturnBtn').addEventListener('click', async () => {
      if (!await confirmDialog(`确定清空 ${state.selectedDate} 的回传数据？`)) return;
      setCurrentReturns([]);
      render();
    });

    $('copyWorkerBtn').addEventListener('click', () => copyText(combinedResult().workers
      .filter((row) => row.total.count > 0)
      .map(combinedCopyLine)
      .join('\n') || '暂无兼职结算'));

    $('copyAgentBtn').addEventListener('click', () => copyText(combinedResult().agents
      .filter((row) => row.total.count > 0)
      .map(combinedCopyLine)
      .join('\n') || '暂无代理结算'));

    $('agentExportSelect').addEventListener('change', renderAgentExport);

    $('copyAgentReturnsBtn').addEventListener('click', () => {
      const rows = selectedAgentReturnRows();
      copyText(rows.length ? formatCombinedAgentReturnText(rows) : '暂无代理账号单数');
    });

    $('exportAgentReturnsBtn').addEventListener('click', () => {
      const rows = selectedAgentReturnRows();
      if (!rows.length) return toast('暂无代理账号单数可导出');
      const agent = $('agentExportSelect').value || '代理';
      const filename = `${state.selectedDate}-${agent}-账号单数.csv`;
      downloadTextFile(filename, formatCombinedAgentReturnCsv(rows));
      toast('代理表格已导出');
    });

    $('saveLabelsBtn').addEventListener('click', () => {
      state.labels = {
        appTitle: $('appTitleInput').value.trim() || T.DEFAULT_LABELS.appTitle,
        subtitle: $('appSubtitleInput').value.trim() || T.DEFAULT_LABELS.subtitle,
        bossName: $('bossNameInput').value.trim() || T.DEFAULT_LABELS.bossName,
      };
      T.saveState(state);
      render();
      toast('显示名称已保存');
    });

    $('savePricesBtn').addEventListener('click', () => {
      Object.keys(state.platforms).forEach((key) => {
        state.platforms[key].bossRate = Number(document.querySelector(`[data-boss-rate="${key}"]`).value) || 0;
        state.platforms[key].link = document.querySelector(`[data-link="${key}"]`).value.trim();
      });
      state.hive = state.hive || { accounts: [], rates: { worker: 0, agent: 0, boss: 0 } };
      state.hive.rates = {
        worker: Number($('hiveWorkerRateInput').value) || 0,
        agent: Number($('hiveAgentRateInput').value) || 0,
        boss: Number($('hiveBossRateInput').value) || 0,
      };
      T.saveState(state);
      render();
      toast('价格已保存');
    });

    $('saveOwnerRateBtn').addEventListener('click', () => {
      const ok = T.setAssigneeRate(state, {
        type: $('rateOwnerTypeInput').value,
        name: $('rateOwnerNameInput').value,
        platform: $('ratePlatformInput').value,
        rate: $('rateValueInput').value,
      });
      if (!ok) return toast('请把类型、完整名字、平台和单价填完整');
      T.saveState(state);
      render();
      toast('单人价格已保存');
    });

    $('clearOwnerRateBtn').addEventListener('click', () => {
      const ok = T.setAssigneeRate(state, {
        type: $('rateOwnerTypeInput').value,
        name: $('rateOwnerNameInput').value,
        platform: $('ratePlatformInput').value,
        rate: '',
      });
      if (!ok) return toast('请把类型、完整名字和平台填完整');
      T.saveState(state);
      render();
      toast('单人价格已清除');
    });

    $('resetPricesBtn').addEventListener('click', async () => {
      if (!await confirmDialog('确定恢复默认价格？')) return;
      state.platforms = T.restoreState({ platforms: T.DEFAULT_PLATFORMS }).platforms;
      state.hive = { ...(state.hive || {}), accounts: (state.hive && state.hive.accounts) || [], rates: { worker: 0, agent: 0, boss: 0 } };
      T.saveState(state);
      render();
    });

    $('exportBtn').addEventListener('click', () => {
      $('backupText').value = T.serializeState(state);
      copyText($('backupText').value);
    });

    $('importBackupBtn').addEventListener('click', () => {
      try {
        const result = T.importBackupState(state, $('backupText').value);
        state = result.state;
        T.saveState(state);
        render();
        toast(result.mode === 'accounts' ? `已从片段导入/更新 ${result.count} 个账号` : '备份已导入');
      } catch (error) {
        toast(`导入失败：${error.message || error}。请尽量从“导出备份”的第一行完整复制；如果是旧页面数据，可以先点“扫描本页旧数据”。`);
      }
    });

    $('scanStorageBtn').addEventListener('click', renderStorageScan);

    $('clearToolDataBtn').addEventListener('click', async () => {
      const ok = await confirmDialog('确定清空本工具数据？\n这会删除当前浏览器里的账号、分配、回传和价格设置。\n清空前请先导出备份，避免白忙一场。', '确认清空');
      if (!ok) return;
      localStorage.removeItem(T.STORAGE_KEY);
      localStorage.removeItem('settlement-tool-state-v1');
      state = T.createDefaultState();
      if (!state.days[state.selectedDate]) state.days[state.selectedDate] = { returns: [] };
      render();
      toast('本工具数据已清空，可以重新编辑');
    });

    $('storageScanBox').addEventListener('click', async (event) => {
      const index = event.target.dataset.restoreStorage;
      const copyIndex = event.target.dataset.copyStorage;
      if (copyIndex !== undefined) {
        const rows = window.__storageScanRows || [];
        const row = rows[Number(copyIndex)];
        if (!row) return toast('这条数据已经失效，请重新扫描');
        $('backupText').value = row.raw;
        return copyText(row.raw);
      }
      if (index === undefined) return;
      const rows = window.__storageScanRows || [];
      const row = rows[Number(index)];
      if (!row) return toast('这条数据已经失效，请重新扫描');
      if (!await confirmDialog(`确定恢复 ${row.key}？\n当前页面数据会被覆盖，恢复前建议先导出备份。`)) return;
      try {
        state = T.restoreState(row.raw);
        T.saveState(state);
        render();
        renderStorageScan();
        showInlineStatus('dataStatusBox', `已恢复 ${row.key}：账号 ${row.accounts} 个，分配 ${row.assignments} 条，代理 ${row.agents} 个，日数据 ${row.days} 天。`);
        toast(`已恢复：账号 ${row.accounts} 个，分配 ${row.assignments} 条`);
      } catch (error) {
        toast(`恢复失败：${error.message || error}`);
      }
    });

    $('saveCloudConfigBtn').addEventListener('click', () => {
      saveCloudConfig();
      toast('云配置已保存。同步密码不会保存，请自己记住。');
    });

    $('copyCloudSqlBtn').addEventListener('click', () => copyText($('cloudSqlText').value));

    $('uploadCloudBtn').addEventListener('click', async () => {
      try {
        await uploadCloudBackup();
      } catch (error) {
        toast(`上传失败：${friendlyCloudError(error)}`);
      }
    });

    $('downloadCloudBtn').addEventListener('click', async () => {
      if (!await confirmDialog('从云端同步会覆盖当前设备数据。\n继续前建议先导出备份，确定继续？')) return;
      try {
        await downloadCloudBackup();
      } catch (error) {
        toast(`同步失败：${friendlyCloudError(error)}`);
      }
    });

    $('backToTopBtn').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
      $('backToTopBtn').style.display = window.scrollY > 360 ? 'block' : 'none';
    }, { passive: true });

    if (!state.days[state.selectedDate]) state.days[state.selectedDate] = { returns: [], hiveReturns: [] };
    if (!state.days[state.selectedDate].returns) state.days[state.selectedDate].returns = [];
    if (!state.days[state.selectedDate].hiveReturns) state.days[state.selectedDate].hiveReturns = [];
    render();
  </script>
</body>
</html>
