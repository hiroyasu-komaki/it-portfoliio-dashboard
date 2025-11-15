/**
 * IT Portfolio Management Dashboard - Dynamic Data Loading
 * JSON data → Full UI generation
 */

let currentLanguage = 'ja';
let dashboardData = null;

/** JSONをロード */
async function loadDashboardData() {
    try {
        const response = await fetch('../data/it_portfolio_dashboard_data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        dashboardData = await response.json();
        initializeDashboard();
    } catch (e) {
        console.error('データ読み込み失敗:', e);
        showError('ダッシュボードデータの読み込みに失敗しました。');
    }
}

/** エラー表示 */
function showError(msg) {
    const container = document.querySelector('.max-w-\\[1400px\\]');
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
   メトリクスカード（4つの統計カード）
   ====================================================== */
function renderMetrics() {
    const metricsContainer = document.querySelector('.grid.grid-cols-\\[repeat\\(auto-fit\\,minmax\\(250px\\,1fr\\)\\)\\]');
    if (!metricsContainer) return;

    const { metrics } = dashboardData;
    
    metricsContainer.innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-ja">総プロジェクト数</div>
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-en">Total Projects</div>
            <div class="text-4xl font-bold text-gray-800 mb-1">${metrics.totalProjects.value}</div>
            <div class="text-xs text-gray-400 lang-ja">進行中: ${metrics.totalProjects.inProgress} | 計画中: ${metrics.totalProjects.planned}</div>
            <div class="text-xs text-gray-400 lang-en">In Progress: ${metrics.totalProjects.inProgress} | Planned: ${metrics.totalProjects.planned}</div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-ja">総投資額</div>
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-en">Total Investment</div>
            <div class="text-4xl font-bold text-gray-800 mb-1">${metrics.totalInvestment.value}</div>
            <div class="text-xs text-gray-400 lang-ja">予算執行率: ${metrics.totalInvestment.budgetUtilization}</div>
            <div class="text-xs text-gray-400 lang-en">Budget Utilization: ${metrics.totalInvestment.budgetUtilization}</div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500">
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-ja">平均ROI</div>
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-en">Average ROI</div>
            <div class="text-4xl font-bold text-gray-800 mb-1">${metrics.averageROI.value}</div>
            <div class="text-xs text-gray-400 lang-ja">目標: ${metrics.averageROI.target}</div>
            <div class="text-xs text-gray-400 lang-en">Target: ${metrics.averageROI.target}</div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-ja">高リスクPJ</div>
            <div class="text-gray-500 text-xs mb-2 uppercase tracking-wide lang-en">High Risk Projects</div>
            <div class="text-4xl font-bold text-gray-800 mb-1">${metrics.highRiskProjects.value}</div>
            <div class="text-xs text-gray-400 lang-ja">要注意プロジェクト</div>
            <div class="text-xs text-gray-400 lang-en">Requires Attention</div>
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
    
    const budgetHTML = `
        <h2 class="text-lg font-semibold text-gray-800 mb-5 pb-2.5 border-b-2 border-gray-200 lang-ja">予算配分 (Run/Grow/Transform)</h2>
        <h2 class="text-lg font-semibold text-gray-800 mb-5 pb-2.5 border-b-2 border-gray-200 lang-en">Budget Allocation (Run/Grow/Transform)</h2>
        
        <div class="space-y-6">
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">Run (維持・運用)</div>
                    <div class="text-sm text-gray-700 lang-en">Run (Maintenance & Operations)</div>
                    <div class="text-sm font-semibold text-gray-800">${budgetAllocation.run.percent}% (${budgetAllocation.run.amount})</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" style="width: ${budgetAllocation.run.percent}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">Grow (改善・拡大)</div>
                    <div class="text-sm text-gray-700 lang-en">Grow (Improvement & Expansion)</div>
                    <div class="text-sm font-semibold text-gray-800">${budgetAllocation.grow.percent}% (${budgetAllocation.grow.amount})</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: ${budgetAllocation.grow.percent}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">Transform (変革)</div>
                    <div class="text-sm text-gray-700 lang-en">Transform (Transformation)</div>
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
    
    const strategicHTML = `
        <h2 class="text-lg font-semibold text-gray-800 mb-5 pb-2.5 border-b-2 border-gray-200 lang-ja">戦略目標別投資</h2>
        <h2 class="text-lg font-semibold text-gray-800 mb-5 pb-2.5 border-b-2 border-gray-200 lang-en">Investment by Strategic Goal</h2>
        
        <div class="space-y-6">
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">顧客体験向上</div>
                    <div class="text-sm text-gray-700 lang-en">Customer Experience Enhancement</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.customerExperience}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: ${strategicInvestment.customerExperience}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">業務効率化</div>
                    <div class="text-sm text-gray-700 lang-en">Operational Efficiency</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.operationalEfficiency}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" style="width: ${strategicInvestment.operationalEfficiency}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">新規事業創出</div>
                    <div class="text-sm text-gray-700 lang-en">New Business Development</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.newBusiness}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full" style="width: ${strategicInvestment.newBusiness}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">セキュリティ強化</div>
                    <div class="text-sm text-gray-700 lang-en">Security Enhancement</div>
                    <div class="text-sm font-semibold text-gray-800">${strategicInvestment.security}%</div>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full" style="width: ${strategicInvestment.security}%;"></div>
                </div>
            </div>
            
            <div>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-700 lang-ja">基盤刷新</div>
                    <div class="text-sm text-gray-700 lang-en">Infrastructure Renewal</div>
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

    const statusConfig = {
        onTrack: {
            classJA: 'bg-green-100 text-green-800',
            textJA: '順調',
            classEN: 'bg-green-100 text-green-800',
            textEN: 'On Track',
            barColor: 'bg-green-500'
        },
        caution: {
            classJA: 'bg-amber-100 text-amber-800',
            textJA: '注意',
            classEN: 'bg-amber-100 text-amber-800',
            textEN: 'Caution',
            barColor: 'bg-amber-500'
        },
        delayed: {
            classJA: 'bg-red-100 text-red-800',
            textJA: '遅延',
            classEN: 'bg-red-100 text-red-800',
            textEN: 'Delayed',
            barColor: 'bg-red-500'
        }
    };

    const goalMapping = {
        'CX Enhancement': { ja: '顧客体験向上', en: 'Customer Experience' },
        'Infrastructure Renewal': { ja: '基盤刷新', en: 'Infrastructure' },
        'Operational Efficiency': { ja: '業務効率化', en: 'Efficiency' },
        'New Business Creation': { ja: '新規事業創出', en: 'New Business' },
        'Security Enhancement': { ja: 'セキュリティ強化', en: 'Security' }
    };

    tbody.innerHTML = dashboardData.projects.map(project => {
        const status = statusConfig[project.status];
        const goal = goalMapping[project.goal] || { ja: project.goal, en: project.goal };
        
        return `
            <tr class="hover:bg-gray-50 transition-colors duration-200">
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="lang-ja">${project.nameJA}</span>
                    <span class="lang-en">${project.nameEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="py-1 px-3 rounded-xl text-xs font-semibold ${status.classJA} lang-ja">${status.textJA}</span>
                    <span class="py-1 px-3 rounded-xl text-xs font-semibold ${status.classEN} lang-en">${status.textEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">${project.budget}</td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <div class="flex items-center gap-2">
                        <span class="text-xs">${project.progress}%</span>
                        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                            <div class="h-full ${status.barColor} rounded-full" style="width: ${project.progress}%;"></div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="lang-ja">${goal.ja}</span>
                    <span class="lang-en">${goal.en}</span>
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

    const statusConfig = {
        overload: {
            classJA: 'bg-red-100 text-red-800',
            textJA: '過負荷',
            classEN: 'bg-red-100 text-red-800',
            textEN: 'Overloaded',
            barColor: 'bg-red-500'
        },
        high: {
            classJA: 'bg-amber-100 text-amber-800',
            textJA: '高稼働',
            classEN: 'bg-amber-100 text-amber-800',
            textEN: 'High Load',
            barColor: 'bg-amber-500'
        },
        optimal: {
            classJA: 'bg-green-100 text-green-800',
            textJA: '適正',
            classEN: 'bg-green-100 text-green-800',
            textEN: 'Optimal',
            barColor: 'bg-green-500'
        },
        available: {
            classJA: 'bg-green-100 text-green-800',
            textJA: '余裕あり',
            classEN: 'bg-green-100 text-green-800',
            textEN: 'Available',
            barColor: 'bg-green-500'
        }
    };

    tbody.innerHTML = dashboardData.resourceAllocation.map(resource => {
        const currentStatus = statusConfig[resource.current];
        const threeMonthsStatus = statusConfig[resource.threeMonths];
        const endOfTermStatus = statusConfig[resource.endOfTerm];
        
        // 稼働率に応じた色を決定
        let utilizationColor = 'bg-green-500';
        if (resource.utilization >= 90) {
            utilizationColor = 'bg-red-500';
        } else if (resource.utilization >= 80) {
            utilizationColor = 'bg-amber-500';
        }
        
        return `
            <tr class="hover:bg-gray-50 transition-colors duration-200">
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="lang-ja">${resource.roleJA}</span>
                    <span class="lang-en">${resource.roleEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="lang-ja">${resource.available}名</span>
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
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${currentStatus.classJA} lang-ja">${currentStatus.textJA}</span>
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${currentStatus.classEN} lang-en">${currentStatus.textEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${threeMonthsStatus.classJA} lang-ja">${threeMonthsStatus.textJA}</span>
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${threeMonthsStatus.classEN} lang-en">${threeMonthsStatus.textEN}</span>
                </td>
                <td class="py-3 px-2 border-b border-gray-100">
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${endOfTermStatus.classJA} lang-ja">${endOfTermStatus.textJA}</span>
                    <span class="py-1 px-2.5 rounded-lg text-xs font-semibold ${endOfTermStatus.classEN} lang-en">${endOfTermStatus.textEN}</span>
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

    const levelConfig = {
        high: 'border-red-500',
        medium: 'border-amber-500',
        low: 'border-green-500'
    };

    riskContainer.innerHTML = dashboardData.risks.map(risk => {
        const borderClass = levelConfig[risk.level] || 'border-gray-500';
        const levelText = risk.level === 'high' ? '高' : risk.level === 'medium' ? '中' : '低';
        const levelTextEN = risk.level.charAt(0).toUpperCase() + risk.level.slice(1);
        
        return `
            <li class="p-4 rounded-lg border-l-4 ${borderClass} bg-gray-50">
                <div class="font-semibold text-sm text-gray-800 mb-1 lang-ja">【${levelText}】${risk.titleJA}</div>
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

    const levelConfig = {
        low: 'border-green-500',
        medium: 'border-amber-500',
        high: 'border-red-500'
    };

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
function setLanguage(lang) {
    currentLanguage = lang;
    document.body.setAttribute('data-lang', lang);
    
    // ボタン状態更新
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-500');
    });
    
    // クリックされたボタンをアクティブに
    const clickedBtn = event?.target;
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
document.addEventListener('DOMContentLoaded', loadDashboardData);