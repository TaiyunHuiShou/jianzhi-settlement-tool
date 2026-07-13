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
      patterns: [/^TN/i, /^1N-/i],
    },
    qunar: {
      name: '去哪儿',
      link: '',
      workerRate: 0,
      bossRate: 0,
      timeLabel: '',
      patterns: [/^uus-/i, /^uus/i],
    },
  };

  const STORAGE_KEY = 'settlement-tool-state-v2';
  const SCHEMA_VERSION = 3;
  const PLATFORM_ORDER = ['XX', 'qq', 'HH', 'TN', 'qunar'];
  const ALL_SETTLEMENT_PLATFORMS = [...PLATFORM_ORDER, 'hive'];
  const RATE_OVERRIDE_KEYS = [...PLATFORM_ORDER, 'hive'];
  const COOLDOWN_DAYS = 7;
  const DEFAULT_LABELS = {
    appTitle: '钛云账号结算管理平台',
    subtitle: '账号对应微信，回传自动算钱，每日数据一眼看清',
    bossName: '上游项目方',
  };
  const AGENT_SPARE_LABEL = '\u4ee3\u7406\u5907\u7528';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function createDefaultState() {
    return {
      version: 2,
      schemaVersion: SCHEMA_VERSION,
      selectedDate: today(),
      platforms: clone(DEFAULT_PLATFORMS),
      accounts: [],
      assignments: [],
      agents: [],
      labels: clone(DEFAULT_LABELS),
      rateOverrides: { worker: {}, agent: {} },
      accountAliases: {},
      assignmentTextTemplate: '',
      hive: { accounts: [], rates: { worker: 0, agent: 0, boss: 0 } },
      days: {},
    };
  }

  function normalizePlatformKey(value) {
    const text = String(value || '').trim();
    const lower = text.toLowerCase();
    if (!text) return '';
    if (lower === 'xx') return 'XX';
    if (lower === 'qq') return 'qq';
    if (lower === 'hh' || lower === 'hqq') return 'HH';
    if (lower === 'tn') return 'TN';
    if (lower === 'qunar' || lower === '去哪儿' || lower === '去哪哪儿') return 'qunar';
    return PLATFORM_ORDER.includes(text) ? text : '';
  }

  function platformDisplayName(platform) {
    const key = normalizePlatformKey(platform) || platform;
    return key === 'qunar' ? '去哪儿' : key === 'hive' ? '蜂箱' : key;
  }

  function normalizeAccountValue(value) {
    return String(value || '')
      .normalize('NFKC')
      .trim()
      .replace(/[‐‑‒–—―－_]/g, '-')
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .toLowerCase();
  }

  function accountMatchKey(value) {
    return normalizeAccountValue(value);
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
          normalizedAccount: accountMatchKey(account),
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
          normalizedAccount: accountMatchKey(account),
        };
      })
      .filter(Boolean);
  }

  function extractReturnAccount(line) {
    const text = String(line || '').normalize('NFKC');
    const tn = text.match(/\b1N-[A-Za-z0-9]+-[A-Za-z0-9._-]+\b/i);
    if (tn) return { account: tn[0], index: tn.index, rawLength: tn[0].length };
    const qunar = text.match(/\buu\s*S[\s_\-–—－]*\d+\b/i);
    if (qunar) return { account: qunar[0].replace(/\s+/g, ''), index: qunar.index, rawLength: qunar[0].length };
    const generic = text.match(/\b(?:XX|qq|HH|Hqq|TN)[A-Za-z0-9._-]*\b/i);
    if (generic) return { account: generic[0], index: generic.index, rawLength: generic[0].length };
    return null;
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
        const accountMatch = extractReturnAccount(line);
        if (accountMatch) {
          const account = accountMatch.account.trim();
          const afterAccount = line.slice(accountMatch.index + (accountMatch.rawLength || account.length));
          const numberMatch = afterAccount.match(/-?\d+/);
          if (numberMatch) {
            const count = Math.max(0, Number.parseInt(numberMatch[0], 10) || 0);
            rows.push({ account, normalizedAccount: accountMatchKey(account), count, platform: detectPlatform(account), source: line });
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
        normalizedAccount: accountMatchKey(item.account),
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
      accountAliases: state.accountAliases,
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
        const source = platforms[key];
        merged[key].workerRate = Number(source.workerRate) || 0;
        merged[key].bossRate = Math.max(0, Number(source.bossRate) || 0);
        merged[key].workerRateA = Math.max(0, Number(source.workerRateA ?? source.workerRate) || 0);
        merged[key].workerRateB = Math.max(0, Number(source.workerRateB ?? source.workerRate) || 0);
        merged[key].agentRateA = Math.max(0, Number(source.agentRateA ?? source.agentRate ?? source.workerRate) || 0);
        merged[key].agentRateB = Math.max(0, Number(source.agentRateB ?? source.agentRate ?? source.workerRate) || 0);
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
    const platform = normalizePlatformKey(account.platform) || detectPlatform(account.account);
    return {
      account: account.account,
      password: account.password || '',
      wechat: account.wechat || '',
      platform,
      normalizedAccount: account.normalizedAccount || accountMatchKey(account.account),
    };
  }

  function parseOwnerInput(value, fallbackType = 'worker') {
    const text = String(value || '').trim();
    const match = text.match(new RegExp(`^(?:合作方|${'\u4ee3\u7406'})[：:\\-\\s]*(.+)$`));
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

  function platformTierRate(platformConfig, ownerType, tier) {
    const cleanTier = tier === 'B' ? 'B' : 'A';
    if (ownerType === 'agent') {
      return Number(cleanTier === 'B' ? platformConfig.agentRateB : platformConfig.agentRateA) || 0;
    }
    return Number(cleanTier === 'B' ? platformConfig.workerRateB : platformConfig.workerRateA) || 0;
  }

  function buildRateSnapshot({ platforms, ownerType = 'worker', priceTier = 'A' }) {
    const config = normalizePlatformConfig(platforms);
    const snapshot = {};
    PLATFORM_ORDER.forEach((platform) => {
      snapshot[platform] = platformTierRate(config[platform] || {}, ownerType, priceTier);
    });
    return snapshot;
  }

  function rateForOwner({ type, name, platform, platforms, rateOverrides, fallbackRate, priceTier, rateSnapshot }) {
    const ownerType = type === 'agent' ? 'agent' : 'worker';
    const ownerName = String(name || '').trim();
    if (rateSnapshot && rateSnapshot[platform] !== undefined && rateSnapshot[platform] !== '') {
      return Number(rateSnapshot[platform]) || 0;
    }
    if (fallbackRate !== null && fallbackRate !== undefined && fallbackRate !== '') return Number(fallbackRate) || 0;
    const overrides = normalizeRateOverrides(rateOverrides);
    if (ownerName && overrides[ownerType] && overrides[ownerType][ownerName] && overrides[ownerType][ownerName][platform] !== undefined) {
      return Number(overrides[ownerType][ownerName][platform]) || 0;
    }
    const config = normalizePlatformConfig(platforms);
    return platformTierRate(config[platform] || {}, ownerType, priceTier);
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
      const prefix = status.assignment.assigneeType === 'agent' ? '合作方：' : '';
      return `${prefix}${status.assignment.assignee}`;
    }
    if (status.status === 'manual') return status.assignee;
    if (status.status === 'cooldown' && status.lastAssignment) {
      const prefix = status.lastAssignment.assigneeType === 'agent' ? '合作方：' : '';
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

  function createAssignment({ account, platform, assignee, assigneeType, startDate, rate, priceTier = 'A', rateSnapshot }) {
    return {
      id: `${account}-${assigneeType}-${assignee}-${startDate}-${Math.random().toString(36).slice(2, 8)}`,
      account,
      platform: normalizePlatformKey(platform) || detectPlatform(account),
      assignee,
      assigneeType,
      ownerType: assigneeType === 'agent' ? 'agent' : 'worker',
      ownerName: assignee,
      startDate,
      endDate: '',
      rate: rate === undefined || rate === '' ? null : Number(rate),
      priceTier: priceTier === 'B' ? 'B' : 'A',
      rateSnapshot: rateSnapshot || null,
    };
  }

  function assignAccountsToWorker(state, { wechat, startDate = today(), platforms = PLATFORM_ORDER, priceTier = 'A', accounts = [] }) {
    const name = String(wechat || '').trim();
    if (!name) return { assigned: [], missing: platforms.slice(), text: '' };
    state.assignments = Array.isArray(state.assignments) ? state.assignments : [];
    const selected = [];
    const missing = [];

    const wantedPlatforms = (platforms || PLATFORM_ORDER).map(normalizePlatformKey).filter(Boolean);
    const explicitAccounts = new Set(accounts || []);
    for (const platform of wantedPlatforms) {
      const candidate = explicitAccounts.size
        ? availableAccounts(state, startDate, [platform]).find((row) => explicitAccounts.has(row.account))
        : availableAccounts(state, startDate, [platform])[0];
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
        platform: candidate.platform,
        assignee: name,
        assigneeType: 'worker',
        startDate,
        priceTier,
        rateSnapshot: buildRateSnapshot({ platforms: state.platforms, ownerType: 'worker', priceTier }),
      }));
    });

    return { assigned: selected, missing: [], text: formatAssignmentText(selected, state.platforms) };
  }

  function accountByPlatformMap(state) {
    const map = new Map();
    (state.accounts || []).map(normalizeAccount).forEach((row) => {
      if (!map.has(row.account)) map.set(row.account, row);
    });
    return map;
  }

  function previewSpecifiedWorkerAssignment(state, { startDate = today(), platforms = PLATFORM_ORDER, accounts = {} }) {
    const accountMap = accountByPlatformMap(state);
    const selected = [];
    const missingPlatforms = [];
    const selectedPlatforms = [];
    const requested = (platforms || PLATFORM_ORDER).map(normalizePlatformKey).filter(Boolean);
    requested.forEach((platform) => {
      const accountValue = accounts && typeof accounts === 'object' ? accounts[platform] : '';
      const account = accountMap.get(String(accountValue || '').trim());
      if (!account || account.platform !== platform || accountStatus(state, account.account, startDate).status !== 'free') {
        missingPlatforms.push(platform);
        return;
      }
      selected.push(account);
      selectedPlatforms.push(platform);
    });
    return { selected, selectedPlatforms, missingPlatforms };
  }

  function assignSpecifiedAccountsToWorker(state, { wechat, startDate = today(), accounts = {}, priceTier = 'A', confirmed = false }) {
    const platforms = Object.keys(accounts || {}).map(normalizePlatformKey).filter(Boolean);
    const preview = previewSpecifiedWorkerAssignment(state, { startDate, platforms, accounts });
    if (!confirmed) return { ...preview, assigned: [] };
    if (!String(wechat || '').trim() || !preview.selected.length) return { ...preview, assigned: [] };
    state.assignments = Array.isArray(state.assignments) ? state.assignments : [];
    preview.selected.forEach((candidate) => {
      state.assignments.push(createAssignment({
        account: candidate.account,
        platform: candidate.platform,
        assignee: String(wechat || '').trim(),
        assigneeType: 'worker',
        startDate,
        priceTier,
        rateSnapshot: buildRateSnapshot({ platforms: state.platforms, ownerType: 'worker', priceTier }),
      }));
    });
    return {
      ...preview,
      assigned: preview.selected,
      text: formatAssignmentText(preview.selected, state.platforms),
    };
  }

  function assignAccountsToAgent(state, { agent, rate, startDate = today(), accounts = [], priceTier = 'A' }) {
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
        platform: account.platform,
        assignee: item.name,
        assigneeType: 'agent',
        startDate,
        rate: item.rate,
        priceTier,
        rateSnapshot: buildRateSnapshot({ platforms: state.platforms, ownerType: 'agent', priceTier }),
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

  function bindAccountAlias(state, { alias, account }) {
    const aliasKey = accountMatchKey(alias);
    const target = String(account || '').trim();
    if (!aliasKey || !target) return false;
    const exists = (state.accounts || []).some((row) => row.account === target);
    if (!exists) return false;
    state.accountAliases = state.accountAliases && typeof state.accountAliases === 'object' ? state.accountAliases : {};
    state.accountAliases[aliasKey] = target;
    return true;
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

  function importAccountsForAgent(state, { agent, rate, startDate = today(), text = '', platform = '', priceTier = 'A' }) {
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
      priceTier,
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

  function activeAssignmentGroup(state, { assignee, assigneeType = 'worker' }) {
    const name = String(assignee || '').trim();
    const type = assigneeType === 'agent' ? 'agent' : 'worker';
    return (state.assignments || []).filter((row) => !row.endDate && row.assigneeType === type && String(row.assignee || '').trim() === name);
  }

  function revokeAssignmentGroup(state, { assignee, assigneeType = 'worker' }) {
    const group = activeAssignmentGroup(state, { assignee, assigneeType });
    const ids = new Set(group.map((row) => row.id));
    state.assignments = (state.assignments || []).filter((row) => !ids.has(row.id));
    return { revoked: group };
  }

  function releaseAssignmentGroup(state, { assignee, assigneeType = 'worker', endDate = today() }) {
    const group = activeAssignmentGroup(state, { assignee, assigneeType });
    const immediate = [];
    const cooldown = [];
    group.forEach((row) => {
      if (!hasReturnForAccount(state, row.account)) {
        immediate.push(row);
      } else {
        row.endDate = endDate;
        cooldown.push(row);
      }
    });
    const immediateIds = new Set(immediate.map((row) => row.id));
    state.assignments = (state.assignments || []).filter((row) => !immediateIds.has(row.id));
    return { immediate, cooldown };
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
      return { recycled: false, reason: '这个账号不是合作方账号，不能回收到合作方备用仓库' };
    }
    state.assignments = (state.assignments || []).filter((row) => row.account !== account || row.endDate || row.assigneeType !== 'agent');
    item.wechat = AGENT_SPARE_LABEL;
    return { recycled: true, reason: '' };
  }

  function assignAgentSpareAccount(state, { account, agent, rate, startDate = today() }) {
    const name = String(agent || '').trim();
    if (!name) return { assigned: false, reason: '请填写合作方名称' };
    const item = (state.accounts || []).find((row) => row.account === account);
    if (!item) return { assigned: false, reason: '账号不存在' };
    if (accountStatus(state, account, startDate).status !== 'agent_spare') {
      return { assigned: false, reason: '这个账号不在合作方备用仓库' };
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
    const key = accountMatchKey(account);
    return Object.values(state.days || {}).some((day) => (day.returns || []).some((row) => accountMatchKey(row.account) === key && Number(row.count) > 0));
  }

  function noReturnWorkerWarnings(state, currentDate = today()) {
    const groups = new Map();
    (state.assignments || []).forEach((row) => {
      if (row.endDate || row.assigneeType === 'agent') return;
      const account = (state.accounts || []).map(normalizeAccount).find((item) => item.account === row.account);
      if (!account || !PLATFORM_ORDER.includes(account.platform)) return;
      const key = String(row.assignee || '').trim();
      if (!key) return;
      if (!groups.has(key)) groups.set(key, { ownerName: key, accounts: [], startDates: [] });
      groups.get(key).accounts.push(account);
      groups.get(key).startDates.push(row.startDate);
    });
    const returnsByDate = state.days || {};
    return [...groups.values()].map((group) => {
      const earliestStart = group.startDates.slice().sort()[0];
      if (dateToTime(currentDate) - dateToTime(earliestStart) < COOLDOWN_DAYS * 86400000) return null;
      let lastReturnDate = '';
      Object.entries(returnsByDate).forEach(([date, day]) => {
        const hasAny = (day.returns || []).some((row) => Number(row.count) > 0 && group.accounts.some((account) => accountMatchKey(account.account) === accountMatchKey(row.account)));
        if (hasAny && (!lastReturnDate || date > lastReturnDate)) lastReturnDate = date;
      });
      const fromDate = lastReturnDate || earliestStart;
      const days = Math.floor((dateToTime(currentDate) - dateToTime(fromDate)) / 86400000);
      if (lastReturnDate && days < COOLDOWN_DAYS) return null;
      if (!lastReturnDate && days < COOLDOWN_DAYS) return null;
      return {
        ownerName: group.ownerName,
        platforms: [...new Set(group.accounts.map((row) => row.platform))],
        accountCount: group.accounts.length,
        earliestStartDate: earliestStart,
        lastReturnDate,
        silentDays: days,
        accounts: group.accounts,
      };
    }).filter(Boolean);
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

  const DEFAULT_ASSIGNMENT_TEXT_TEMPLATE = [
    '您好，以下是为您分配的平台账号：',
    '',
    '姓名：{{姓名}}',
    '人员类型：{{人员类型}}',
    '价格档位：{{价格档位}}',
    '开始日期：{{开始日期}}',
    '',
    '{{账号列表}}',
    '',
    '请核对账号和密码，如有问题及时联系管理员。',
  ].join('\n');

  const TEMPLATE_VARIABLES = ['姓名', '人员类型', '价格档位', '开始日期', '平台', '账号', '密码', '单价', '链接', '当前时间', '管理员', '账号列表'];

  function accountListForTemplate(accounts, { platforms = DEFAULT_PLATFORMS, priceTier = 'A', personType = 'worker' } = {}) {
    const config = normalizePlatformConfig(platforms);
    const ownerType = personType === 'agent' || personType === '合作方' || personType === '\u4ee3\u7406' ? 'agent' : 'worker';
    return (accounts || []).map(normalizeAccount)
      .sort((a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform))
      .map((account) => {
        const cfg = config[account.platform] || {};
        const rate = platformTierRate(cfg, ownerType, priceTier === 'B' || /B$/.test(String(priceTier)) ? 'B' : 'A');
        return [
          `${platformDisplayName(account.platform)} / ${rate}元`,
          `账号：${account.account}`,
          `密码：${account.password || ''}`,
          `链接：${cfg.link || ''}`,
        ].join('\n');
      }).join('\n\n');
  }

  function renderAssignmentTemplate(template, context = {}) {
    const source = String(template || DEFAULT_ASSIGNMENT_TEXT_TEMPLATE);
    const accounts = context.accounts || [];
    const values = {
      姓名: context.name || context.wechat || '',
      人员类型: context.personType === 'agent' || context.personType === '\u4ee3\u7406' ? '合作方' : (context.personType || '执行人员'),
      价格档位: context.priceTier || '',
      开始日期: context.startDate || today(),
      平台: accounts[0] ? platformDisplayName(normalizeAccount(accounts[0]).platform) : '',
      账号: accounts[0] ? normalizeAccount(accounts[0]).account : '',
      密码: accounts[0] ? normalizeAccount(accounts[0]).password : '',
      单价: '',
      链接: accounts[0] ? ((normalizePlatformConfig(context.platforms || DEFAULT_PLATFORMS)[normalizeAccount(accounts[0]).platform] || {}).link || '') : '',
      当前时间: new Date().toLocaleString('zh-CN', { hour12: false }),
      管理员: context.manager || '',
      账号列表: accountListForTemplate(accounts, {
        platforms: context.platforms || DEFAULT_PLATFORMS,
        priceTier: context.priceTier,
        personType: context.personType,
      }),
    };
    return source.replace(/\{\{([^{}]+)\}\}/g, (match, name) => (
      Object.prototype.hasOwnProperty.call(values, name.trim()) ? values[name.trim()] : match
    ));
  }

  function unknownTemplateVariables(template) {
    const unknown = new Set();
    String(template || '').replace(/\{\{([^{}]+)\}\}/g, (match, name) => {
      const key = name.trim();
      if (!TEMPLATE_VARIABLES.includes(key)) unknown.add(key);
      return match;
    });
    return [...unknown];
  }

  function createAssignmentTextDraft(state, { generatedText, overrideText }) {
    return {
      template: state.assignmentTextTemplate || DEFAULT_ASSIGNMENT_TEXT_TEMPLATE,
      generatedText: String(generatedText || ''),
      text: overrideText !== undefined ? String(overrideText || '') : String(generatedText || ''),
    };
  }

  function resolveAccountFromReturn(accountMap, normalizedMap, aliasMap, rawAccount) {
    const text = String(rawAccount || '').trim();
    if (accountMap.has(text)) return accountMap.get(text);
    const lowerHit = [...accountMap.values()].filter((row) => String(row.account || '').toLowerCase() === text.toLowerCase());
    if (lowerHit.length === 1) return lowerHit[0];
    const key = accountMatchKey(text);
    const normalizedHit = normalizedMap.get(key) || [];
    if (normalizedHit.length === 1) return normalizedHit[0];
    const aliasAccount = aliasMap[key];
    if (aliasAccount && accountMap.has(aliasAccount)) return accountMap.get(aliasAccount);
    return null;
  }

  function calculateSettlement({ accounts = [], assignments = [], date = today(), returns = [], platforms = DEFAULT_PLATFORMS, rateOverrides = {}, accountAliases = {} }) {
    const config = normalizePlatformConfig(platforms);
    const accountMap = new Map();
    const normalizedMap = new Map();
    accounts.map(normalizeAccount).forEach((item) => {
      if (!item.account) return;
      accountMap.set(item.account, item);
      const key = accountMatchKey(item.account);
      if (!normalizedMap.has(key)) normalizedMap.set(key, []);
      normalizedMap.get(key).push(item);
    });
    const aliasMap = {};
    Object.entries(accountAliases || {}).forEach(([alias, target]) => {
      aliasMap[accountMatchKey(alias)] = String(target || '').trim();
    });

    const countMap = new Map();
    returns.forEach((item) => {
      if (!item.account) return;
      const matchedAccount = resolveAccountFromReturn(accountMap, normalizedMap, aliasMap, item.account);
      const account = matchedAccount ? matchedAccount.account : item.account;
      const previous = countMap.get(account) || { count: 0 };
      countMap.set(account, {
        account,
        rawAccount: item.account,
        count: Number(previous.count || 0) + (Number(item.count) || 0),
        platform: (matchedAccount && matchedAccount.platform) || item.platform || detectPlatform(item.account),
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
        priceTier: assignment && assignment.priceTier,
        rateSnapshot: assignment && assignment.rateSnapshot,
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
    const lines = [['合作方名称', '任务', '平台', '账号', '成功数', '失败数', '结算状态'].map(csvCell).join(',')];
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

  function formatAccountDetailsCsv(state, date = today()) {
    const lines = [['平台', '账号', '密码', '状态', '当前归属', '归属类型', '价格档位', '开始日期'].map(csvCell).join(',')];
    (state.accounts || [])
      .map(normalizeAccount)
      .sort((a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform) || a.account.localeCompare(b.account))
      .forEach((account) => {
        const status = accountStatus(state, account.account, date);
        const assignment = status.assignment || status.lastAssignment || null;
        const statusText = {
          assigned: '已分配',
          manual: '手动归属',
          cooldown: '7天隔离',
          agent_spare: '合作方备用',
          free: '空闲',
        }[status.status] || status.status;
        lines.push([
          account.platform || detectPlatform(account.account),
          account.account,
          account.password || '',
          statusText,
          accountOwnerLabel(state, account.account, date),
          assignment ? (assignment.assigneeType === 'agent' ? '合作方' : '执行人员') : (status.assigneeType === 'agent' ? '合作方' : (status.assigneeType === 'worker' ? '执行人员' : '')),
          assignment ? (assignment.priceTier || '') : '',
          assignment ? (assignment.startDate || '') : '',
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
    const required = ['合作方名称', '平台', '账号', '成功数'];
    const indexMap = {};
    header.forEach((name, index) => { indexMap[name] = index; });
    const errors = [];
    if (indexMap['合作方名称'] === undefined && indexMap['\u4ee3\u7406名称'] !== undefined) indexMap['合作方名称'] = indexMap['\u4ee3\u7406名称'];
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
        agent: String(cells[indexMap['合作方名称']] || '').trim(),
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

  function dedupeBy(items, keyFn) {
    const map = new Map();
    (items || []).forEach((item) => {
      const key = keyFn(item);
      if (!key) return;
      map.set(key, { ...map.get(key), ...item });
    });
    return [...map.values()];
  }

  function mergeFullStates(currentState, incomingState) {
    const current = restoreState(currentState);
    const incoming = restoreState(incomingState);
    const next = restoreState(current);
    next.platforms = normalizePlatformConfig({ ...current.platforms, ...incoming.platforms });
    next.accounts = dedupeBy(current.accounts.concat(incoming.accounts), (row) => accountMatchKey(row.account))
      .map(normalizeAccount)
      .sort((a, b) => a.account.localeCompare(b.account));
    next.assignments = dedupeBy(current.assignments.concat(incoming.assignments), (row) => row.id || `${row.account}:${row.assigneeType}:${row.assignee}:${row.startDate}:${row.endDate || ''}`);
    next.agents = dedupeBy(current.agents.concat(incoming.agents), (row) => String(row.name || '').trim());
    next.rateOverrides = normalizeRateOverrides({
      worker: { ...(current.rateOverrides && current.rateOverrides.worker), ...(incoming.rateOverrides && incoming.rateOverrides.worker) },
      agent: { ...(current.rateOverrides && current.rateOverrides.agent), ...(incoming.rateOverrides && incoming.rateOverrides.agent) },
    });
    next.accountAliases = { ...(current.accountAliases || {}), ...(incoming.accountAliases || {}) };
    next.assignmentTextTemplate = incoming.assignmentTextTemplate || current.assignmentTextTemplate || '';
    next.hive = normalizeHiveState({
      accounts: (current.hive.accounts || []).concat(incoming.hive.accounts || []),
      rates: { ...(current.hive.rates || {}), ...(incoming.hive.rates || {}) },
    });
    next.days = { ...(current.days || {}) };
    Object.entries(incoming.days || {}).forEach(([date, day]) => {
      const existing = next.days[date] || {};
      next.days[date] = {
        ...existing,
        ...day,
        returns: dedupeBy((existing.returns || []).concat(day.returns || []), (row) => accountMatchKey(row.account)),
        hiveReturns: dedupeBy((existing.hiveReturns || []).concat(day.hiveReturns || []), (row) => hiveKey(row.account)),
      };
    });
    return restoreState(next);
  }

  function exportFullBackup(state, cloudConfig = null) {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      state: restoreState(state),
      cloudConfig: cloudConfig || null,
    }, null, 2);
  }

  function parseFullBackupPayload(input) {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    if (parsed && parsed.state && isFullBackupObject(parsed.state)) return parsed;
    if (isFullBackupObject(parsed)) return { state: parsed, cloudConfig: parsed.cloudConfig || null };
    throw new Error('not full backup');
  }

  function importFullBackup(currentState, input, { mode = 'merge', restoreCloudConfig = false } = {}) {
    const payload = parseFullBackupPayload(input);
    const beforeBackup = serializeState(currentState);
    const incoming = restoreState(payload.state);
    const state = mode === 'overwrite' ? incoming : mergeFullStates(currentState, incoming);
    return {
      state,
      mode: mode === 'overwrite' ? 'overwrite' : 'merge',
      beforeBackup,
      cloudConfig: restoreCloudConfig ? (payload.cloudConfig || null) : null,
    };
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
    const state = {
      ...defaults,
      ...parsed,
      version: 2,
      schemaVersion: SCHEMA_VERSION,
      platforms: normalizePlatformConfig(parsed.platforms),
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts.map(normalizeAccount) : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments.map((row) => ({
        ...row,
        ownerType: row.ownerType || (row.assigneeType === 'agent' ? 'agent' : 'worker'),
        ownerName: row.ownerName || row.assignee || '',
        priceTier: row.priceTier === 'B' ? 'B' : 'A',
        rateSnapshot: row.rateSnapshot || (row.rate !== null && row.rate !== undefined
          ? { [normalizeAccount((parsed.accounts || []).find((account) => account.account === row.account) || { account: row.account }).platform]: Number(row.rate) || 0 }
          : null),
      })) : [],
      agents: Array.isArray(parsed.agents) ? parsed.agents : [],
      labels: normalizeLabels(parsed.labels),
      rateOverrides: normalizeRateOverrides(parsed.rateOverrides),
      accountAliases: parsed.accountAliases && typeof parsed.accountAliases === 'object' ? parsed.accountAliases : {},
      assignmentTextTemplate: String(parsed.assignmentTextTemplate || ''),
      hive: normalizeHiveState(parsed.hive),
      days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
    };
    delete state.cloudConfig;
    Object.values(state.days || {}).forEach((day) => {
      if (Array.isArray(day.returns)) {
        day.returns = day.returns.map((row) => ({
          ...row,
          normalizedAccount: row.normalizedAccount || accountMatchKey(row.account),
          platform: normalizePlatformKey(row.platform) || detectPlatform(row.account),
        }));
      }
    });
    return state;
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
    ALL_SETTLEMENT_PLATFORMS,
    COOLDOWN_DAYS,
    STORAGE_KEY,
    AGENT_SPARE_LABEL,
    DEFAULT_ASSIGNMENT_TEXT_TEMPLATE,
    TEMPLATE_VARIABLES,
    createDefaultState,
    normalizePlatformKey,
    platformDisplayName,
    normalizeAccountValue,
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
    formatAccountDetailsCsv,
    parseAgentReturnCsv,
    availableAccounts,
    accountStatus,
    accountOwnerLabel,
    inventorySummary,
    upsertAccounts,
    previewSpecifiedWorkerAssignment,
    assignSpecifiedAccountsToWorker,
    bindAccountAlias,
    renameAssignee,
    setAssigneeRate,
    buildRateSnapshot,
    assignAccountsToWorker,
    assignAccountsToAgent,
    importAccountsForAgent,
    releaseAssignment,
    releaseAssignmentGroup,
    revokeActiveAssignment,
    revokeAssignmentGroup,
    noReturnWorkerWarnings,
    recycleAgentAccount,
    assignAgentSpareAccount,
    deleteAccountSafely,
    updateAccount,
    formatAssignmentText,
    renderAssignmentTemplate,
    unknownTemplateVariables,
    createAssignmentTextDraft,
    serializeState,
    exportFullBackup,
    importFullBackup,
    mergeFullStates,
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

