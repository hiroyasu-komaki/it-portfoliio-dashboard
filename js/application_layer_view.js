/**
 * Application Layer Overview - Full Dynamic Vanilla JS
 * JSON data → Full UI generation
 */

let currentLanguage = 'ja';
let appData = null;

/** JSONをロード */
async function loadApplicationData() {
    try {
        const response = await fetch('../data/application_layer_view_data.json');
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
    main.innerHTML = `
        <div class="bg-red-50 p-6 border border-red-200 rounded-lg text-center text-red-700 font-medium">
            ${msg}
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
        li.className =
            'project-item p-3 mb-2 rounded-lg cursor-pointer transition-all duration-300 border-l-[3px] border-l-transparent bg-gray-50 hover:bg-gray-100 hover:border-l-gradient-start hover:translate-x-1';
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
    const eolColors = {
        'critical': 'bg-red-500',
        'warning': 'bg-amber-500',
        'safe': 'bg-green-500',
        'unknown': 'bg-gray-400'
    };
    const eolColor = eolColors[app.eolStatus] || eolColors['unknown'];

    const card = document.createElement('div');
    card.className =
        'app-card relative bg-gray-50 p-5 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1';
    card.dataset.projects = app.projects.join(' ');

    card.innerHTML = `
        <div class="eol-badge absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white ${eolColor}"
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
                        `<span class="app-tag inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">${tag}</span>`
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
    // Sidebar project highlight reset
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.remove(
            'active',
            'bg-gradient-to-br',
            'from-[rgba(102,126,234,0.1)]',
            'to-[rgba(118,75,162,0.1)]',
            'font-semibold'
        );
    });

    // App highlight reset
    document.querySelectorAll('.app-card').forEach(card => {
        card.classList.remove('highlighted', 'highlight-pulse');
    });

    if (projectId) {
        // Sidebar highlight
        const selectedItem = document.querySelector(`[data-project="${projectId}"]`);
        if (selectedItem) {
            selectedItem.classList.add(
                'active',
                'bg-gradient-to-br',
                'from-[rgba(102,126,234,0.1)]',
                'to-[rgba(118,75,162,0.1)]',
                'font-semibold'
            );
        }

        // Application highlight
        document.querySelectorAll('.app-card').forEach(card => {
            const projects = card.dataset.projects.split(' ');
            if (projects.includes(projectId)) {
                card.classList.add('highlighted', 'highlight-pulse');
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

    // --- 修正ポイント：evt が null でも動くようにする ---
    let targetBtn = evt?.target;

    // イベントが無ければ、対応する言語ボタンを自動選択
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
        btn.classList.remove(
            'active',
            'bg-gradient-to-br',
            'from-gradient-start',
            'to-gradient-end',
            'text-white'
        );
        btn.classList.add('bg-gray-100', 'text-gray-500');
    });

    // 対象ボタンをアクティブに
    targetBtn.classList.remove('bg-gray-100', 'text-gray-500');
    targetBtn.classList.add(
        'active',
        'bg-gradient-to-br',
        'from-gradient-start',
        'to-gradient-end',
        'text-white'
    );

    // 保存
    localStorage.setItem('preferredLanguage', lang);
}

/** 言語設定読み込み */
function loadLanguagePreference() {
    const saved = localStorage.getItem('preferredLanguage') || 'ja';
    setLanguage(saved, null);
}

/** Init */
document.addEventListener('DOMContentLoaded', loadApplicationData);
