/**
 * Data Layer Overview - Full Dynamic Vanilla JS
 * JSON data → Full UI generation
 */

let currentLanguage = 'ja';
let dataLayerData = null;

/** JSONをロード */
async function loadDataLayerData() {
    try {
        const possiblePaths = [
            './data_layer_view_data.json',
            '../data/data_layer_view_data.json',
            './data/data_layer_view_data.json',
            'data_layer_view_data.json'
        ];
        
        let response = null;
        let loadedPath = '';
        
        for (const path of possiblePaths) {
            try {
                response = await fetch(path);
                if (response.ok) {
                    loadedPath = path;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!response || !response.ok) {
            throw new Error('JSONファイルが見つかりません。ファイルパスを確認してください。');
        }
        
        dataLayerData = await response.json();
        console.log(`データ読み込み成功: ${loadedPath}`);
        initializeDataLayer();
    } catch (e) {
        console.error('データ読み込み失敗:', e);
        showError(`データレイヤーデータの読み込みに失敗しました。<br><small>エラー: ${e.message}</small>`);
    }
}

/** エラー表示 */
function showError(msg) {
    const container = document.querySelector('.max-w-7xl');
    if (container) {
        container.innerHTML = `
            <div class="bg-red-50 p-6 border border-red-200 rounded-lg text-center text-red-700 font-medium mt-8">
                ${msg}
                <div class="mt-4 text-sm text-gray-600">
                    <p>以下のいずれかにJSONファイルを配置してください：</p>
                    <ul class="mt-2 text-left inline-block">
                        <li>• ./data_layer_view_data.json</li>
                        <li>• ../data/data_layer_view_data.json</li>
                        <li>• ./data/data_layer_view_data.json</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

/** 初期化 */
function initializeDataLayer() {
    if (!dataLayerData) return;

    renderProjectList();
    renderStats();
    renderDataSources();
    loadLanguagePreference();
    setupProjectClickHandlers();
}

/* ======================================================
   プロジェクト一覧（サイドバー）
   ====================================================== */
function renderProjectList() {
    const projectList = document.getElementById('projectList');
    if (!projectList) return;

    projectList.innerHTML = dataLayerData.projects.map(project => `
        <li class="project-item p-3 px-4 mb-2 rounded-lg cursor-pointer transition-all duration-300 border-l-[3px] border-transparent bg-gray-50 hover:bg-gray-100 hover:border-l-purple-500 hover:translate-x-1" data-project="${project.id}">
            <div class="text-sm text-gray-800 mb-1">
                <span class="lang-ja">${project.nameJA}</span>
                <span class="lang-en">${project.nameEN}</span>
            </div>
            <div class="text-xs text-gray-500">
                <span class="lang-ja">進捗: ${project.progress}% | ${project.statusJA}</span>
                <span class="lang-en">Progress: ${project.progress}% | ${project.statusEN}</span>
            </div>
        </li>
    `).join('');
}

/* ======================================================
   統計カード
   ====================================================== */
function renderStats() {
    const statsContainer = document.querySelector('.grid.grid-cols-\\[repeat\\(auto-fit\\,minmax\\(200px\\,1fr\\)\\)\\]');
    if (!statsContainer) return;

    const { stats } = dataLayerData;
    
    statsContainer.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <span class="lang-ja">総データ基盤数</span>
                <span class="lang-en">Total Data Foundations</span>
            </div>
            <div class="text-2xl font-bold text-gray-800">${stats.totalDataSources}</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <span class="lang-ja">トランザクションDB</span>
                <span class="lang-en">Transaction DB</span>
            </div>
            <div class="text-2xl font-bold text-gray-800">${stats.transactionDb}</div>
            <div class="text-xs text-gray-400 mt-1">
                <span class="lang-ja">業務処理用</span>
                <span class="lang-en">Operational</span>
            </div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <span class="lang-ja">マスタDB</span>
                <span class="lang-en">Master DB</span>
            </div>
            <div class="text-2xl font-bold text-gray-800">${stats.masterDb}</div>
            <div class="text-xs text-gray-400 mt-1">
                <span class="lang-ja">基準情報</span>
                <span class="lang-en">Reference Data</span>
            </div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <span class="lang-ja">ログ/履歴DB</span>
                <span class="lang-en">Log/History DB</span>
            </div>
            <div class="text-2xl font-bold text-gray-800">${stats.logDb}</div>
            <div class="text-xs text-gray-400 mt-1">
                <span class="lang-ja">監査・分析用</span>
                <span class="lang-en">Audit & Analytics</span>
            </div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <span class="lang-ja">分析基盤</span>
                <span class="lang-en">Analytics</span>
            </div>
            <div class="text-2xl font-bold text-gray-800">${stats.dwh}</div>
            <div class="text-xs text-gray-400 mt-1">
                <span class="lang-ja">DWH・BI用</span>
                <span class="lang-en">DWH & BI</span>
            </div>
        </div>
    `;
}

/* ======================================================
   データソース一覧（セクション別）
   ====================================================== */
function renderDataSources() {
    // セクションごとにデータソースをグループ化
    const sections = {
        'ecommerce': {
            titleJA: 'ECサイトデータ基盤',
            titleEN: 'E-Commerce Data Foundation',
            icon: '🛒'
        },
        'coresystem': {
            titleJA: '基幹システムデータ基盤',
            titleEN: 'Core System Data Foundation',
            icon: '🏢'
        },
        'rpa': {
            titleJA: 'RPAデータ基盤',
            titleEN: 'RPA Data Foundation',
            icon: '🤖'
        },
        'subscription': {
            titleJA: 'サブスクリプションサービスデータ基盤',
            titleEN: 'Subscription Service Data Foundation',
            icon: '🔄'
        },
        'dwh': {
            titleJA: '全社データ分析基盤',
            titleEN: 'Enterprise Analytics Platform',
            icon: '📊'
        },
        'backup': {
            titleJA: 'バックアップ・アーカイブ',
            titleEN: 'Backup & Archive',
            icon: '💾'
        }
    };

    // メインコンテンツエリアを取得
    const mainContent = document.querySelector('main.bg-white');
    if (!mainContent) return;

    // 既存のデータソースセクションを削除（統計カードとヘッダーは残す）
    const existingSections = mainContent.querySelectorAll('.my-8.py-4.border-t-2');
    existingSections.forEach(section => {
        const nextGrid = section.nextElementSibling;
        if (nextGrid && nextGrid.classList.contains('grid')) {
            nextGrid.remove();
        }
        section.remove();
    });

    // 各セクションのデータソースを生成
    Object.keys(sections).forEach(sectionKey => {
        const sectionData = sections[sectionKey];
        const dataSources = dataLayerData.dataSources.filter(ds => ds.section === sectionKey);
        
        if (dataSources.length === 0) return;

        // セクションヘッダーを作成
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'my-8 py-4 border-t-2 border-gray-200';
        sectionHeader.innerHTML = `
            <div class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div class="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 rounded-md text-white text-sm">${sectionData.icon}</div>
                <span class="lang-ja">${sectionData.titleJA}</span>
                <span class="lang-en">${sectionData.titleEN}</span>
            </div>
        `;

        // データソースグリッドを作成
        const dataGrid = document.createElement('div');
        dataGrid.className = 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 mt-5';
        dataGrid.innerHTML = dataSources.map(ds => createDataSourceCard(ds)).join('');

        mainContent.appendChild(sectionHeader);
        mainContent.appendChild(dataGrid);
    });
}

/* ======================================================
   データソースカード生成
   ====================================================== */
function createDataSourceCard(dataSource) {
    const projectsAttr = dataSource.projects.join(' ');
    
    // 詳細情報の生成
    let detailsHTML = '';
    
    if (dataSource.size) {
        detailsHTML += `
            <div class="detail-item bg-white p-2 px-2.5 rounded-md border border-gray-200">
                <div class="text-[10px] text-gray-400 mb-0.5">
                    <span class="lang-ja">容量</span>
                    <span class="lang-en">Size</span>
                </div>
                <div class="text-sm font-semibold text-gray-800">${dataSource.size}</div>
            </div>
        `;
    }
    
    if (dataSource.records) {
        detailsHTML += `
            <div class="detail-item bg-white p-2 px-2.5 rounded-md border border-gray-200">
                <div class="text-[10px] text-gray-400 mb-0.5">
                    <span class="lang-ja">レコード数</span>
                    <span class="lang-en">Records</span>
                </div>
                <div class="text-sm font-semibold text-gray-800">${dataSource.records}</div>
            </div>
        `;
    }
    
    if (dataSource.memory) {
        detailsHTML += `
            <div class="detail-item bg-white p-2 px-2.5 rounded-md border border-gray-200">
                <div class="text-[10px] text-gray-400 mb-0.5">
                    <span class="lang-ja">メモリ</span>
                    <span class="lang-en">Memory</span>
                </div>
                <div class="text-sm font-semibold text-gray-800">${dataSource.memory}</div>
            </div>
        `;
    }
    
    if (dataSource.pipelines) {
        detailsHTML += `
            <div class="detail-item bg-white p-2 px-2.5 rounded-md border border-gray-200">
                <div class="text-[10px] text-gray-400 mb-0.5">
                    <span class="lang-ja">パイプライン数</span>
                    <span class="lang-en">Pipelines</span>
                </div>
                <div class="text-sm font-semibold text-gray-800">${dataSource.pipelines}</div>
            </div>
        `;
    }
    
    // 実装情報がある場合は追加
    if (dataSource.implementation && !detailsHTML.includes('実装')) {
        detailsHTML = `
            <div class="detail-item bg-white p-2 px-2.5 rounded-md border border-gray-200">
                <div class="text-[10px] text-gray-400 mb-0.5">
                    <span class="lang-ja">実装</span>
                    <span class="lang-en">Implementation</span>
                </div>
                <div class="text-sm font-semibold text-gray-800">${dataSource.implementation}</div>
            </div>
        ` + detailsHTML;
    }

    return `
        <div class="data-card bg-gray-50 border-2 border-gray-200 rounded-xl p-5 transition-all duration-400 relative overflow-hidden hover:shadow-lg hover:-translate-y-1" data-projects="${projectsAttr}">
            <div class="flex items-start gap-3 mb-4">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-2xl flex-shrink-0">${dataSource.icon}</div>
                <div class="flex-1">
                    <div class="text-base font-semibold text-gray-800 mb-1">
                        <span class="lang-ja">${dataSource.nameJA}</span>
                        <span class="lang-en">${dataSource.nameEN}</span>
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wide">
                        <span class="lang-ja">${dataSource.typeJA}</span>
                        <span class="lang-en">${dataSource.typeEN}</span>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2.5 mb-3">
                ${detailsHTML}
            </div>
        </div>
    `;
}

/* ======================================================
   プロジェクト選択処理
   ====================================================== */
function selectProject(projectId) {
    // すべてのハイライトをクリア
    document.querySelectorAll('.data-card').forEach(card => {
        card.classList.remove('highlighted', 'highlight-pulse');
    });
    
    // すべてのプロジェクト選択をクリア
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (projectId) {
        // 選択されたプロジェクトをハイライト
        const selectedProjectItem = document.querySelector(`[data-project="${projectId}"]`);
        if (selectedProjectItem) {
            selectedProjectItem.classList.add('active');
        }
        
        // 関連するデータリソースをハイライト
        document.querySelectorAll('.data-card').forEach(card => {
            const projects = card.getAttribute('data-projects');
            if (projects && projects.includes(projectId)) {
                card.classList.add('highlighted', 'highlight-pulse');
            }
        });
        
        // タイトルを更新
        const project = dataLayerData.projects.find(p => p.id === projectId);
        const selectedProjectSpan = document.getElementById('selectedProject');
        if (project && selectedProjectSpan) {
            selectedProjectSpan.textContent = currentLanguage === 'ja' 
                ? ` - ${project.nameJA}` 
                : ` - ${project.nameEN}`;
        }
    } else {
        document.getElementById('selectedProject').textContent = '';
    }
}

function clearSelection() {
    selectProject(null);
}

/* ======================================================
   プロジェクトクリックハンドラー設定
   ====================================================== */
function setupProjectClickHandlers() {
    document.querySelectorAll('.project-item').forEach(item => {
        item.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            selectProject(projectId);
        });
    });
}

/* ======================================================
   言語切り替え
   ====================================================== */
function setLanguage(lang) {
    currentLanguage = lang;
    document.body.setAttribute('data-lang', lang);
    
    // ボタン状態更新
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const clickedBtn = window.event?.target;
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // 設定を保存
    localStorage.setItem('preferredLanguage', lang);
}

/** 言語設定読み込み */
function loadLanguagePreference() {
    const saved = localStorage.getItem('preferredLanguage') || 'ja';
    currentLanguage = saved;
    document.body.setAttribute('data-lang', saved);
    
    // 保存された言語に応じてボタンを更新
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if ((saved === 'ja' && btn.textContent.trim().includes('日本語')) ||
            (saved === 'en' && btn.textContent.trim().includes('English'))) {
            btn.classList.add('active');
        }
    });
}

/** Init */
document.addEventListener('DOMContentLoaded', loadDataLayerData);