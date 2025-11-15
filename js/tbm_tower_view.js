/**
 * TBM Tower View - Full Dynamic Vanilla JS
 * JSON data → Full UI generation
 */

let currentLanguage = 'ja';
let towerData = null;

/** JSONをロード */
async function loadTowerData() {
    try {
        const possiblePaths = [
            './tbm_tower_view_data.json',
            '../data/tbm_tower_view_data.json',
            './data/tbm_tower_view_data.json',
            'tbm_tower_view_data.json'
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
        
        towerData = await response.json();
        console.log(`データ読み込み成功: ${loadedPath}`);
        initializeTower();
    } catch (e) {
        console.error('データ読み込み失敗:', e);
        showError(`TBMタワーデータの読み込みに失敗しました。<br><small>エラー: ${e.message}</small>`);
    }
}

/** エラー表示 */
function showError(msg) {
    const container = document.querySelector('.max-w-\\[1800px\\]');
    if (container) {
        container.innerHTML = `
            <div class="bg-red-50 p-6 border border-red-200 rounded-lg text-center text-red-700 font-medium mt-8">
                ${msg}
                <div class="mt-4 text-sm text-gray-600">
                    <p>以下のいずれかにJSONファイルを配置してください：</p>
                    <ul class="mt-2 text-left inline-block">
                        <li>• ./tbm_tower_view_data.json</li>
                        <li>• ../data/tbm_tower_view_data.json</li>
                        <li>• ./data/tbm_tower_view_data.json</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

/** 初期化 */
function initializeTower() {
    if (!towerData) return;

    renderProjectList();
    renderTowerLayers();
    loadLanguagePreference();
    setupLayerToggle();
    
    // 最初のレイヤーをデフォルトで展開
    const firstLayer = document.querySelector('.tower-layer');
    if (firstLayer) {
        firstLayer.classList.add('expanded');
    }
}

/* ======================================================
   プロジェクト一覧（サイドバー）
   ====================================================== */
function renderProjectList() {
    const projectList = document.querySelector('aside ul');
    if (!projectList) return;

    // JSONからプロジェクトの総コストを計算（簡易版）
    const projectCosts = {
        'ecommerce': '¥95M',
        'coresystem': '¥450M',
        'rpa': '¥45M',
        'cloud': '¥280M',
        'subscription': '¥120M',
        'zerotrust': '¥180M'
    };

    projectList.innerHTML = towerData.projects.map(project => `
        <li class="project-item py-3 px-4 mb-2 rounded-lg cursor-pointer transition-all duration-300 border-l-4 border-transparent bg-gray-50 hover:bg-gray-100 hover:border-indigo-500 hover:translate-x-1" data-project="${project.id}" onclick="selectProject('${project.id}')">
            <div class="project-name text-sm text-gray-800 mb-1">
                <span class="lang-ja">${project.nameJA}</span>
                <span class="lang-en">${project.nameEN}</span>
            </div>
            <div class="project-status text-xs text-gray-500">${projectCosts[project.id] || '¥0M'}</div>
        </li>
    `).join('');
}

/* ======================================================
   タワーレイヤー生成
   ====================================================== */
function renderTowerLayers() {
    const mainContent = document.querySelector('main .space-y-1');
    if (!mainContent) return;

    mainContent.innerHTML = towerData.layers.map((layer, index) => {
        const layerConfig = getLayerConfig(layer.id);
        return createLayerHTML(layer, layerConfig);
    }).join('');
}

/** レイヤー設定を取得 */
function getLayerConfig(layerId) {
    const configs = {
        'solution': {
            gradient: 'from-purple-600 to-indigo-600',
            bgGradient: 'from-purple-50 to-indigo-50',
            borderColor: 'border-purple-500',
            totalCost: '¥12.5億'
        },
        'tower': {
            gradient: 'from-blue-600 to-cyan-600',
            bgGradient: 'from-blue-50 to-cyan-50',
            borderColor: 'border-blue-500',
            totalCost: '¥8.3億'
        },
        'costpool': {
            gradient: 'from-green-600 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-50',
            borderColor: 'border-green-500',
            totalCost: '¥5.7億'
        }
    };
    return configs[layerId] || configs['solution'];
}

/** レイヤーHTMLを生成 */
function createLayerHTML(layer, config) {
    const sectionsHTML = layer.sections.map(section => {
        if (layer.id === 'costpool') {
            return createCostPoolSection(section, config.borderColor);
        } else {
            return createStandardSection(section, config.borderColor);
        }
    }).join('');

    return `
        <div class="tower-layer mb-1 rounded-lg overflow-hidden">
            <div class="layer-header py-4 px-5 font-semibold text-sm text-center text-white cursor-pointer transition-all duration-300 flex justify-between items-center bg-gradient-to-r ${config.gradient} hover:brightness-110">
                <span class="lang-ja">${layer.nameJA}</span>
                <span class="lang-en">${layer.nameEN}</span>
                <div class="flex items-center gap-4">
                    <span class="font-bold">${config.totalCost}</span>
                    <svg class="expand-icon w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
            <div class="layer-content bg-gradient-to-r ${config.bgGradient} p-5">
                ${sectionsHTML}
            </div>
        </div>
    `;
}

/** 標準セクション生成 */
function createStandardSection(section, borderColor) {
    const gridCols = section.items.length <= 4 ? 'grid-cols-4' : 'grid-cols-5';
    
    return `
        <div class="mb-5">
            ${section.titleJA ? `
                <div class="text-sm font-semibold text-gray-700 mb-3">
                    <span class="lang-ja">${section.titleJA}</span>
                    <span class="lang-en">${section.titleEN}</span>
                </div>
            ` : ''}
            <div class="grid ${gridCols} gap-3">
                ${section.items.map(item => createItemCard(item, borderColor)).join('')}
            </div>
        </div>
    `;
}

/** コストプールセクション生成 */
function createCostPoolSection(section, borderColor) {
    const gridCols = section.items.length > 6 ? 'grid-cols-5' : 'grid-cols-4';
    
    return `
        <div class="mb-5">
            <div class="text-sm font-semibold text-gray-700 mb-3">
                <span class="lang-ja">${section.titleJA}</span>
                <span class="lang-en">${section.titleEN}</span>
                ${section.totalCost ? ` <span class="font-normal text-indigo-600">(${section.totalCost})</span>` : ''}
            </div>
            <div class="grid ${gridCols} gap-3">
                ${section.items.map(item => createCostPoolItemCard(item, borderColor)).join('')}
            </div>
        </div>
    `;
}

/** アイテムカード生成 */
function createItemCard(item, borderColor) {
    const projects = item.projects ? item.projects.join(',') : '';
    const nameJA = item.nameJA || item.name || '';
    const nameEN = item.nameEN || item.name || '';
    
    return `
        <div class="category-item bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderColor} cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105" data-projects="${projects}">
            <div class="item-name text-sm font-medium text-gray-700 mb-2">
                <span class="lang-ja">${nameJA}</span>
                <span class="lang-en">${nameEN}</span>
            </div>
            ${item.technology ? `<div class="text-xs text-gray-500 mb-2">${item.technology}</div>` : ''}
            <div class="item-cost text-lg font-bold text-gray-800">${item.cost}</div>
        </div>
    `;
}

/** コストプールアイテムカード生成 */
function createCostPoolItemCard(item, borderColor) {
    return `
        <div class="category-item bg-white p-3 rounded-lg shadow-sm border-l-4 ${borderColor} cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105">
            <div class="item-name text-xs font-medium text-gray-700 mb-2">
                <span class="lang-ja">${item.nameJA}</span>
                <span class="lang-en">${item.nameEN}</span>
            </div>
            <div class="item-cost text-base font-bold text-gray-800">${item.cost}</div>
        </div>
    `;
}

/* ======================================================
   プロジェクト選択処理
   ====================================================== */
function selectProject(projectId) {
    // すべてのハイライトをクリア
    document.querySelectorAll('.category-item').forEach(card => {
        card.classList.remove('highlighted', 'highlight-pulse');
    });
    
    // すべてのプロジェクト選択をクリア
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.remove('active', 'bg-gradient-to-br', 'from-indigo-100', 'to-purple-100', 'border-indigo-500', 'font-semibold');
        item.classList.add('bg-gray-50');
    });
    
    if (projectId) {
        // 選択されたプロジェクトをハイライト
        const selectedProjectItem = document.querySelector(`[data-project="${projectId}"]`);
        if (selectedProjectItem && selectedProjectItem.classList.contains('project-item')) {
            selectedProjectItem.classList.remove('bg-gray-50');
            selectedProjectItem.classList.add('active', 'bg-gradient-to-br', 'from-indigo-100', 'to-purple-100', 'border-indigo-500', 'font-semibold');
        }
        
        // 関連するアイテムをハイライト
        document.querySelectorAll('.category-item').forEach(card => {
            const projects = card.getAttribute('data-projects');
            if (projects && projects.includes(projectId)) {
                card.classList.add('highlighted', 'highlight-pulse');
            }
        });
        
        // タイトルを更新
        const project = towerData.projects.find(p => p.id === projectId);
        const selectedProjectSpan = document.getElementById('selectedProject');
        if (project && selectedProjectSpan) {
            selectedProjectSpan.textContent = currentLanguage === 'ja' 
                ? ` - ${project.nameJA}` 
                : ` - ${project.nameEN}`;
        }
    } else {
        const selectedProjectSpan = document.getElementById('selectedProject');
        if (selectedProjectSpan) {
            selectedProjectSpan.textContent = '';
        }
    }
}

function clearSelection() {
    selectProject(null);
}

/* ======================================================
   レイヤートグル設定
   ====================================================== */
function setupLayerToggle() {
    document.querySelectorAll('.layer-header').forEach(header => {
        header.addEventListener('click', function() {
            const layer = this.parentElement;
            layer.classList.toggle('expanded');
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
        btn.classList.remove('active', 'bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-500');
    });
    
    const clickedBtn = window.event?.target;
    if (clickedBtn) {
        clickedBtn.classList.remove('bg-gray-100', 'text-gray-500');
        clickedBtn.classList.add('active', 'bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-white');
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
        btn.classList.remove('active', 'bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-500');
        
        if ((saved === 'ja' && btn.textContent.trim().includes('日本語')) ||
            (saved === 'en' && btn.textContent.trim().includes('English'))) {
            btn.classList.remove('bg-gray-100', 'text-gray-500');
            btn.classList.add('active', 'bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-white');
        }
    });
}

/** Init */
document.addEventListener('DOMContentLoaded', loadTowerData);