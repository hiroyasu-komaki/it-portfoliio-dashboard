/**
 * IT Portfolio Management Dashboard - Dynamic Data Loading (Config対応版)
 * JSON data → Full UI generation
 */

let currentLanguage = window.APP_CONFIG?.defaultLanguage || 'ja';
let dashboardData = null;
const config = window.APP_CONFIG;
const i18n = window.I18N;

/** YAML設定とJSONをロード */
async function loadDashboardData() {
    try {
        // 1. YAML設定を読み込み
        await window.loadConfig();
        
        // 2. データパスを取得してJSONを読み込み
        const dataPath = window.getDataPath('it_portfolio_dashboard');
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        dashboardData = await response.json();
        
        initializeDashboard();
    } catch (e) {
        console.error('データ読み込み失敗:', e);
        showError(window.getText(currentLanguage, 'itPortfolioDashboard.messages.loadError'));
    }
}

/** エラー表示 */
function showError(msg) {
    const container = document.querySelector('.max-w-\\[1600px\\]');
    if (container) {
        container.innerHTML = `
            <div class="bg-red-50 p-6 border border-red-200 rounded-lg text-center text-red-700 font-medium mt-8">
                ${msg}
            </div>
        `;
    }
}

/** 初期化 */
function initializeDashboard() {
    if (!dashboardData) return;

    renderMetrics();
    renderBudgetAllocation();
    renderStrategicInvestment();
    renderProjectsTable();
    renderResourceAllocation();
    renderRisks();
    renderMilestones();
    loadLanguagePreference();
}

/* ======================================================
   メトリクスカード(4つの統計カード)
   ====================================================== */
function renderMetrics() {
    const metricsContainer = document.querySelector('.grid.grid-cols-\\[repeat\\(auto-fit\\,minmax\\(250px\\,1fr\\)\\)\\]');
    if (!metricsContainer) return;

    const { metrics } = dashboardData;
    const t = (path) => {
        return {
            ja: window.getText('ja', `itPortfolioDashboard.${path}`),
            en: window.getText('en', `itPortfolioDashboard.${path}`)
        };
    };
    
    metricsContainer.innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-ja">${t('metrics.totalProjects').ja}</div>
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-en">${t('metrics.totalProjects').en}</div>
            <div class="text-4xl font-bold text-gray-800 mb-1">${metrics.totalProjects.value}</div>
            <div class="text-xs text-gray-400 lang-ja">${t('metrics.inProgress').ja}${metrics.totalProjects.inProgress} | ${t('metrics.planned').ja}${metrics.totalProjects.planned}</div>
            <div class="text-xs text-gray-400 lang-en">${t('metrics.inProgress').en}${metrics.totalProjects.inProgress} | ${t('metrics.planned').en}${metrics.totalProjects.planned}</div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-ja">${t('metrics.totalInvestment').ja}</div>
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-en">${t('metrics.totalInvestment').en}</div>
            <div class="text-4xl font-bold text-gray-800 mb-1">${metrics.totalInvestment.value}</div>
            <div class="text-xs text-gray-400 lang-ja">${t('metrics.budgetUtilization').ja}${metrics.totalInvestment.budgetUtilization}</div>
            <div class="text-xs text-gray-400 lang-en">${t('metrics.budgetUtilization').en}${metrics.totalInvestment.budgetUtilization}</div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500">
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-ja">${t('metrics.averageROI').ja}</div>
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-en">${t('metrics.averageROI').en}</div>
            <div class="text-4xl font-bold text-gray-800 mb-1">${metrics.averageROI.value}</div>
            <div class="text-xs text-gray-400 lang-ja">${t('metrics.target').ja}${metrics.averageROI.target}</div>
            <div class="text-xs text-gray-400 lang-en">${t('metrics.target').en}${metrics.averageROI.target}</div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-ja">${t('metrics.highRiskProjects').ja}</div>
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-en">${t('metrics.highRiskProjects').en}</div>
            <div class="text-4xl font-bold text-gray-800 mb-1">${metrics.highRiskProjects.value}</div>
            <div class="text-xs text-gray-400 lang-ja">${t('metrics.requiresAttention').ja}</div>
            <div class="text-xs text-gray-400 lang-en">${t('metrics.requiresAttention').en}</div>
        </div>
    `;
}

/* ======================================================
   予算配分 (Run/Grow/Transform)
   ====================================================== */
function renderBudgetAllocation() {
    const container = document.querySelector('.grid.grid-cols-2 .bg-white');
    if (!container) return;

    const { budgetAllocation } = dashboardData;
    const t = (path) => {
        return {
            ja: window.getText('ja', `itPortfolioDashboard.${path}`),
            en: window.getText('en', `itPortfolioDashboard.${path}`)
        };
    };
    
    const budgetHTML = `
        <h2 class="text-lg font-semibold text-gray-800 mb-5 pb-2.5 border-b-2 border-gray-200 lang-ja">${t('budget.title').ja}</h2>
        <h2 class="text-lg font-semibold text-gray-800 mb-5 pb-2.5 border-b-2 border-gray-200 lang-en">${t('budget.title').en}</h2>
        
        <div class="space-y-6">
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">${t('budget.run').ja}</div>
                    <div class="text-sm text-gray-700 lang-en">${t('budget.run').en}</div>
                    <div class="text-sm font-semibold text-gray-800">${budgetAllocation.run.percent}% (${budgetAllocation.run.amount})</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" style="width: ${budgetAllocation.run.percent}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">${t('budget.grow').ja}</div>
                    <div class="text-sm text-gray-700 lang-en">${t('budget.grow').en}</div>
                    <div class="text-sm font-semibold text-gray-800">${budgetAllocation.grow.percent}% (${budgetAllocation.grow.amount})</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: ${budgetAllocation.grow.percent}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">${t('budget.transform').ja}</div>
                    <div class="text-sm text-gray-700 lang-en">${t('budget.transform').en}</div>
                    <div class="text-sm font-semibold text-gray-800">${budgetAllocation.transform.percent}% (${budgetAllocation.transform.amount})</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full" style="width: ${budgetAllocation.transform.percent}%;"></div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = budgetHTML;
}

/* ======================================================
   戦略目標別投資
   ====================================================== */
function renderStrategicInvestment() {
    const containers = document.querySelectorAll('.grid.grid-cols-2 .bg-white');
    if (containers.length < 2) return;
    
    const container = containers[1];
    const { strategicInvestment } = dashboardData;
    const t = (path) => {
        return {
            ja: window.getText('ja', `itPortfolioDashboard.${path}`),
            en: window.getText('en', `itPortfolioDashboard.${path}`)
        };
    };
    
    const strategicHTML = `
        <h2 class="text-lg font-semibold text-gray-800 mb-5 pb-2.5 border-b-2 border-gray-200 lang-ja">${t('strategic.title').ja}</h2>
        <h2 class="text-lg font-semibold text-gray-800 mb-5 pb-2.5 border-b-2 border-gray-200 lang-en">${t('strategic.title').en}</h2>
        
        <div class="space-y-6">
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">${t('strategic.customerExperience').ja}</div>
                    <div class="text-sm text-gray-700 lang-en">${t('strategic.customerExperience').en}</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.customerExperience}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: ${strategicInvestment.customerExperience}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">${t('strategic.operationalEfficiency').ja}</div>
                    <div class="text-sm text-gray-700 lang-en">${t('strategic.operationalEfficiency').en}</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.operationalEfficiency}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" style="width: ${strategicInvestment.operationalEfficiency}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">${t('strategic.newBusiness').ja}</div>
                    <div class="text-sm text-gray-700 lang-en">${t('strategic.newBusiness').en}</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.newBusiness}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full" style="width: ${strategicInvestment.newBusiness}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">${t('strategic.security').ja}</div>
                    <div class="text-sm text-gray-700 lang-en">${t('strategic.security').en}</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.security}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full" style="width: ${strategicInvestment.security}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">${t('strategic.infrastructure').ja}</div>
                    <div class="text-sm text-gray-700 lang-en">${t('strategic.infrastructure').en}</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.infrastructure}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-red-500 rounded-full" style="width: ${strategicInvestment.infrastructure}%;"></div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = strategicHTML;
}

/* ======================================================
   主要プロジェクト一覧テーブル
   ====================================================== */
function renderProjectsTable() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    const statusConfig = config.dashboardStatusColors;
    const goalMapping = {
        'CX Enhancement': 'customerExperience',
        'Infrastructure Renewal': 'infrastructure',
        'Operational Efficiency': 'operationalEfficiency',
        'New Business Creation': 'newBusiness',
        'Security Enhancement': 'security'
    };

    tbody.innerHTML = dashboardData.projects.map(project => {
        const status = statusConfig[project.status];
        const statusTextJA = window.getText('ja', `itPortfolioDashboard.projectTable.${project.status}`);
        const statusTextEN = window.getText('en', `itPortfolioDashboard.projectTable.${project.status}`);
        
        const goalKey = goalMapping[project.goal] || 'customerExperience';
        const goalJA = window.getText('ja', `itPortfolioDashboard.goals.${goalKey}`);
        const goalEN = window.getText('en', `itPortfolioDashboard.goals.${goalKey}`);
        
        return `
            <tr class="hover:bg-gray-50 transition-colors duration-200">
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="lang-ja">${project.nameJA}</span>
                    <span class="lang-en">${project.nameEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="py-1 px-3 rounded-xl text-xs font-semibold ${status.bg} ${status.text} lang-ja">${statusTextJA}</span>
                    <span class="py-1 px-3 rounded-xl text-xs font-semibold ${status.bg} ${status.text} lang-en">${statusTextEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">${project.budget}</td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <div class="flex items-center gap-2">
                        <span class="text-xs">${project.progress}%</span>
                        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                            <div class="h-full ${status.bar} rounded-full" style="width: ${project.progress}%;"></div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="lang-ja">${goalJA}</span>
                    <span class="lang-en">${goalEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">${project.roiForecast}</td>
            </tr>
        `;
    }).join('');
}

/* ======================================================
   人的リソース配置状況
   ====================================================== */
function renderResourceAllocation() {
    const tables = document.querySelectorAll('table');
    if (tables.length < 2) return;
    
    const tbody = tables[1].querySelector('tbody');
    if (!tbody) return;

    const statusConfig = config.resourceStatusColors;

    tbody.innerHTML = dashboardData.resourceAllocation.map(resource => {
        const currentStatus = statusConfig[resource.current];
        const threeMonthsStatus = statusConfig[resource.threeMonths];
        const endOfTermStatus = statusConfig[resource.endOfTerm];
        
        const currentTextJA = window.getText('ja', `itPortfolioDashboard.resources.${resource.current}`);
        const currentTextEN = window.getText('en', `itPortfolioDashboard.resources.${resource.current}`);
        const threeMonthsTextJA = window.getText('ja', `itPortfolioDashboard.resources.${resource.threeMonths}`);
        const threeMonthsTextEN = window.getText('en', `itPortfolioDashboard.resources.${resource.threeMonths}`);
        const endOfTermTextJA = window.getText('ja', `itPortfolioDashboard.resources.${resource.endOfTerm}`);
        const endOfTermTextEN = window.getText('en', `itPortfolioDashboard.resources.${resource.endOfTerm}`);
        
        // 稼働率に応じた色を決定
        let utilizationColor = 'bg-green-500';
        if (resource.utilization >= 90) {
            utilizationColor = 'bg-red-500';
        } else if (resource.utilization >= 80) {
            utilizationColor = 'bg-amber-500';
        }
        
        const peopleTextJA = window.getText('ja', 'itPortfolioDashboard.resources.people');
        
        return `
            <tr class="hover:bg-gray-50 transition-colors duration-200">
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="lang-ja">${resource.roleJA}</span>
                    <span class="lang-en">${resource.roleEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="lang-ja">${resource.available}${peopleTextJA}</span>
                    <span class="lang-en">${resource.available}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <div class="flex items-center gap-2">
                        <span class="text-xs">${resource.utilization}%</span>
                        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                            <div class="h-full ${utilizationColor} rounded-full" style="width: ${resource.utilization}%;"></div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${currentStatus.bg} ${currentStatus.text} lang-ja">${currentTextJA}</span>
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${currentStatus.bg} ${currentStatus.text} lang-en">${currentTextEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${threeMonthsStatus.bg} ${threeMonthsStatus.text} lang-ja">${threeMonthsTextJA}</span>
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${threeMonthsStatus.bg} ${threeMonthsStatus.text} lang-en">${threeMonthsTextEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${endOfTermStatus.bg} ${endOfTermStatus.text} lang-ja">${endOfTermTextJA}</span>
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${endOfTermStatus.bg} ${endOfTermStatus.text} lang-en">${endOfTermTextEN}</span>
                </td>
            </tr>
        `;
    }).join('');
}

/* ======================================================
   主要リスク・課題
   ====================================================== */
function renderRisks() {
    const grids = document.querySelectorAll('.grid.grid-cols-2');
    if (grids.length < 2) return;
    
    const riskContainer = grids[1].querySelector('.bg-white ul');
    if (!riskContainer) return;

    const levelConfig = config.riskLevelColors;

    riskContainer.innerHTML = dashboardData.risks.map(risk => {
        const borderClass = levelConfig[risk.level] || 'border-gray-500';
        const levelTextJA = window.getText('ja', `itPortfolioDashboard.risks.${risk.level}`);
        const levelTextEN = window.getText('en', `itPortfolioDashboard.risks.${risk.level}`);
        
        return `
            <li class="p-4 rounded-lg border-l-4 ${borderClass} bg-gray-50">
                <div class="font-semibold text-sm text-gray-800 mb-1 lang-ja">【${levelTextJA}】${risk.titleJA}</div>
                <div class="font-semibold text-sm text-gray-800 mb-1 lang-en">[${levelTextEN}] ${risk.titleEN}</div>
                <div class="text-xs text-gray-600 lang-ja">${risk.descriptionJA}</div>
                <div class="text-xs text-gray-600 lang-en">${risk.descriptionEN}</div>
            </li>
        `;
    }).join('');
}

/* ======================================================
   今後の重要マイルストーン
   ====================================================== */
function renderMilestones() {
    const grids = document.querySelectorAll('.grid.grid-cols-2');
    if (grids.length < 2) return;
    
    const containers = grids[1].querySelectorAll('.bg-white');
    if (containers.length < 2) return;
    
    const milestoneContainer = containers[1].querySelector('ul');
    if (!milestoneContainer) return;

    const levelConfig = config.riskLevelColors;

    milestoneContainer.innerHTML = dashboardData.milestones.map(milestone => {
        const borderClass = levelConfig[milestone.level] || 'border-gray-500';
        const date = new Date(milestone.date);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
        const dateStrEN = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `
            <li class="p-4 rounded-lg border-l-4 ${borderClass} bg-gray-50">
                <div class="font-semibold text-sm text-gray-800 mb-1 lang-ja">${dateStr}: ${milestone.titleJA}</div>
                <div class="font-semibold text-sm text-gray-800 mb-1 lang-en">${dateStrEN}: ${milestone.titleEN}</div>
                <div class="text-xs text-gray-600 lang-ja">${milestone.descriptionJA}</div>
                <div class="text-xs text-gray-600 lang-en">${milestone.descriptionEN}</div>
            </li>
        `;
    }).join('');
}

/* ======================================================
   言語切り替え
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
    
    // 設定を保存
    localStorage.setItem('preferredLanguage', lang);
}

/** 言語設定読み込み */
function loadLanguagePreference() {
    const saved = localStorage.getItem('preferredLanguage') || config.defaultLanguage;
    setLanguage(saved, null);
}

/** Init */
document.addEventListener('DOMContentLoaded', loadDashboardData);