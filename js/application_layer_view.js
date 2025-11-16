/**
 * Application Layer Overview - Full Dynamic Vanilla JS
 * JSON data → Full UI generation (Config対応版)
 */

let currentLanguage = window.APP_CONFIG?.defaultLanguage || 'ja';
let appData = null;
const config = window.APP_CONFIG;
const i18n = window.I18N;

/** YAML設定とJSONをロード */
async function loadApplicationData() {
    try {
        // 1. YAML設定を読み込み
        await window.loadConfig();
        
        // 2. データパスを取得してJSONを読み込み
        const dataPath = window.getDataPath('application_layer_view');
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        appData = await response.json();
        
        initializeApp();
    } catch (e) {
        console.error('データ読み込み失敗:', e);
        showError('アプリケーションデータの読み込みに失敗しました。');
    }
}

/** エラー表示 */
function showError(msg) {
    const main = document.querySelector('main');
    const errorMsg = msg || getText(currentLanguage, 'messages.loadError');
    main.innerHTML = `
        <div class="bg-red-50 p-6 border border-red-200 rounded-lg text-center text-red-700 font-medium">
            ${errorMsg}
        </div>
    `;
}

/** 初期化 */
function initializeApp() {
    if (!appData) return;

    renderProjectList();
    renderApplicationGrid();
    loadLanguagePreference();
}

/* ======================================================
   Sidebar: プロジェクト一覧
   ====================================================== */
function renderProjectList() {
    const list = document.querySelector('.project-list');
    list.innerHTML = '';

    appData.projects.forEach(project => {
        const li = document.createElement('li');
        const preset = config.stylePresets.projectItem;
        li.className = `${preset.base} ${preset.hover}`;
        li.dataset.project = project.id;

        li.innerHTML = `
            <div class="project-name text-sm text-gray-800 mb-1">
                <span class="lang-ja">${project.nameJA}</span>
                <span class="lang-en">${project.nameEN}</span>
            </div>
            <div class="project-status text-xs text-gray-500">
                <span class="lang-ja">${project.statusJA} - ${project.progress}%</span>
                <span class="lang-en">${project.statusEN} - ${project.progress}%</span>
            </div>
        `;

        li.addEventListener('click', () => selectProject(project.id));
        list.appendChild(li);
    });
}

/* ======================================================
   Main: アプリケーション一覧（カード生成）
   ====================================================== */
function renderApplicationGrid() {
    const grid = document.querySelector('.app-grid');
    grid.innerHTML = '';

    appData.applications.forEach(app => {
        const card = createApplicationCard(app);
        grid.appendChild(card);
    });
}

/** アプリカード生成 */
function createApplicationCard(app) {
    const eolColor = config.eolColors[app.eolStatus] || config.eolColors['unknown'];
    const cardPreset = config.stylePresets.card;

    const card = document.createElement('div');
    card.className = `app-card ${cardPreset.base} ${cardPreset.hover}`;
    card.dataset.projects = app.projects.join(' ');

    card.innerHTML = `
        <div class="eol-badge absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white ${eolColor.bg}"
             title="${app.eolDate} / ${app.eolDateEN}"></div>

        <div class="app-icon text-3xl mb-3">${app.icon}</div>

        <div class="app-name text-base font-semibold text-gray-800 mb-1.5">
            <span class="lang-ja">${app.nameJA}</span>
            <span class="lang-en">${app.nameEN}</span>
        </div>

        <div class="app-category text-xs text-gray-500 mb-3">
            <span class="lang-ja">${app.categoryJA}</span>
            <span class="lang-en">${app.categoryEN}</span>
        </div>

        <div class="app-tags flex flex-wrap gap-1.5">
            ${app.tags
                .map(
                    tag =>
                        `<span class="app-tag inline-block px-2 py-0.5 ${config.categoryColors.default} rounded text-[10px] font-medium">${tag}</span>`
                )
                .join('')}
        </div>
    `;
    return card;
}

/* ======================================================
   Project selection / highlight logic
   ====================================================== */
function selectProject(projectId) {
    const projectPreset = config.stylePresets.projectItem;
    const cardPreset = config.stylePresets.card;
    
    // Sidebar project highlight reset
    document.querySelectorAll('.project-item').forEach(item => {
        // activeクラスのみを削除（baseとhoverは保持）
        item.className = `${projectPreset.base} ${projectPreset.hover}`;
    });

    // App highlight reset
    document.querySelectorAll('.app-card').forEach(card => {
        card.className = `app-card ${cardPreset.base} ${cardPreset.hover}`;
    });

    if (projectId) {
        // Sidebar highlight
        const selectedItem = document.querySelector(`[data-project="${projectId}"]`);
        if (selectedItem) {
            selectedItem.className = `${projectPreset.base} ${projectPreset.hover} ${projectPreset.active}`;
        }

        // Application highlight
        document.querySelectorAll('.app-card').forEach(card => {
            const projects = card.dataset.projects.split(' ');
            if (projects.includes(projectId)) {
                card.className = `app-card ${cardPreset.base} ${cardPreset.hover} ${cardPreset.highlighted} highlight-pulse`;
            }
        });

        // Title update
        const project = appData.projects.find(p => p.id === projectId);
        const titleSpan = document.getElementById('selectedProject');

        if (project && titleSpan) {
            titleSpan.textContent =
                currentLanguage === 'ja'
                    ? ` - ${project.nameJA}`
                    : ` - ${project.nameEN}`;
        }
    } else {
        document.getElementById('selectedProject').textContent = '';
    }
}

/** 選択解除 */
function clearSelection() {
    selectProject(null);
}

/* ======================================================
   Language logic
   ====================================================== */
function setLanguage(lang, evt = null) {
    currentLanguage = lang;
    document.body.setAttribute('data-lang', lang);

    const buttonPreset = config.stylePresets.button;

    // イベントが無ければ、対応する言語ボタンを自動選択
    let targetBtn = evt?.target;
    if (!targetBtn) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (
                (lang === 'ja' && btn.textContent.includes('日本語')) ||
                (lang === 'en' && btn.textContent.includes('English'))
            ) {
                targetBtn = btn;
            }
        });
    }

    // ボタン状態リセット
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.className = `lang-btn ${buttonPreset.secondary}`;
    });

    // 対象ボタンをアクティブに
    if (targetBtn) {
        targetBtn.className = `lang-btn active ${buttonPreset.primary}`;
    }

    // 保存
    localStorage.setItem('preferredLanguage', lang);
}

/** 言語設定読み込み */
function loadLanguagePreference() {
    const saved = localStorage.getItem('preferredLanguage') || config.defaultLanguage;
    setLanguage(saved, null);
}

/**
 * テキスト取得ヘルパー
 */
function getText(lang, path) {
    return window.getText(lang, path);
}

/** Init */
document.addEventListener('DOMContentLoaded', loadApplicationData);