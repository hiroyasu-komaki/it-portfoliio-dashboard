/**
 * プロジェクト鳥瞰図 - データローダー
 * Project Overview - Data Loader
 */

let currentLanguage = 'ja';
let projectData = null;

/**
 * JSONデータをフェッチ
 */
async function loadProjectData() {
    try {
        const response = await fetch('../data/project_view_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        projectData = await response.json();
        initializeApp();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        showError('データの読み込みに失敗しました。ページを再読み込みしてください。');
    }
}

/**
 * エラーメッセージを表示
 */
function showError(message) {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-red-800 font-medium">${message}</p>
            </div>
        `;
    }
}

/**
 * アプリケーションを初期化
 */
function initializeApp() {
    if (!projectData) return;
    
    renderDepartments();
    renderProjects();
    loadLanguagePreference();
}

/**
 * 部門リストをレンダリング
 */
function renderDepartments() {
    const departmentList = document.querySelector('aside ul');
    if (!departmentList) return;
    
    // 既存のリストをクリア（最初の「すべて」以外）
    const allItem = departmentList.firstElementChild;
    departmentList.innerHTML = '';
    
    // 「すべて」を追加
    const allDept = projectData.departments.find(d => d.id === 'all');
    if (allDept) {
        departmentList.appendChild(createAllDepartmentItem(allDept));
    }
    
    // 各部門を追加
    projectData.departments.forEach(dept => {
        if (dept.id !== 'all') {
            departmentList.appendChild(createDepartmentItem(dept));
        }
    });
}

/**
 * 「すべて」部門アイテムを作成
 */
function createAllDepartmentItem(dept) {
    const li = document.createElement('li');
    li.className = 'p-3 px-4 mb-2 rounded-lg cursor-pointer transition-all duration-300 border-l-[3px] border-transparent bg-gray-50 hover:bg-gray-100 hover:border-l-purple-500 hover:translate-x-1';
    li.onclick = () => clearSelection();
    
    li.innerHTML = `
        <div class="text-sm text-gray-800 mb-1">
            <span class="lang-ja">${dept.nameJA}</span>
            <span class="lang-en">${dept.nameEN}</span>
        </div>
        <div class="text-xs text-gray-500">
            <span class="lang-ja">${dept.projectCount}プロジェクト</span>
            <span class="lang-en">${dept.projectCount} Projects</span>
        </div>
    `;
    
    return li;
}

/**
 * 部門アイテムを作成
 */
function createDepartmentItem(dept) {
    const li = document.createElement('li');
    li.className = 'department-item p-3 px-4 mb-2 rounded-lg cursor-pointer transition-all duration-300 border-l-[3px] border-transparent bg-gray-50 hover:bg-gray-100 hover:border-l-purple-500 hover:translate-x-1';
    li.setAttribute('data-department', dept.id);
    li.onclick = () => selectDepartment(dept.id);
    
    li.innerHTML = `
        <div class="department-name text-sm text-gray-800 mb-1">
            <span class="lang-ja">${dept.nameJA}</span>
            <span class="lang-en">${dept.nameEN}</span>
        </div>
        <div class="department-count text-xs text-gray-500">
            <span class="lang-ja">${dept.projectCount}プロジェクト</span>
            <span class="lang-en">${dept.projectCount} Projects</span>
        </div>
    `;
    
    return li;
}

/**
 * プロジェクトカードをレンダリング
 */
function renderProjects() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <h2 class="text-xl font-bold text-gray-800 mb-5">
            <span class="lang-ja">プロジェクト一覧</span>
            <span class="lang-en">Project List</span>
            <span id="selectedDepartment" class="text-purple-600"></span>
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            ${projectData.projects.map(project => createProjectCard(project)).join('')}
        </div>
    `;
}

/**
 * プロジェクトカードを作成
 */
function createProjectCard(project) {
    const statusColors = {
        'on-track': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', progress: 'from-green-400 to-green-600' },
        'at-risk': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', progress: 'from-yellow-400 to-yellow-600' },
        'delayed': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', progress: 'from-red-400 to-red-600' },
        'completed': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', progress: 'from-blue-400 to-blue-600' },
        'planning': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', progress: 'from-gray-400 to-gray-600' }
    };
    
    const colors = statusColors[project.status] || statusColors['planning'];
    
    return `
        <div class="project-card bg-white p-5 rounded-xl shadow-sm border-2 border-gray-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02]" 
             data-department="${project.department}" 
             data-status="${project.status}">
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-base font-bold text-gray-900 flex-1 mr-2">
                    <span class="lang-ja">${project.nameJA}</span>
                    <span class="lang-en">${project.nameEN}</span>
                </h3>
                <span class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors.bg} ${colors.text} ${colors.border} border">
                    <span class="lang-ja">${project.statusLabelJA}</span>
                    <span class="lang-en">${project.statusLabelEN}</span>
                </span>
            </div>
            
            <div class="mb-4 space-y-2 text-xs">
                <div class="flex justify-between">
                    <span class="text-gray-500">
                        <span class="lang-ja">フェーズ</span>
                        <span class="lang-en">Phase</span>
                    </span>
                    <span class="text-gray-800 font-medium">
                        <span class="lang-ja">${project.phaseLabelJA}</span>
                        <span class="lang-en">${project.phaseLabelEN}</span>
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">
                        <span class="lang-ja">予算</span>
                        <span class="lang-en">Budget</span>
                    </span>
                    <span class="text-gray-800 font-medium">
                        <span class="lang-ja">${project.budgetJA}</span>
                        <span class="lang-en">${project.budgetEN}</span>
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">
                        <span class="lang-ja">進捗</span>
                        <span class="lang-en">Progress</span>
                    </span>
                    <span class="text-gray-800 font-medium">${project.progress}%</span>
                </div>
            </div>
            
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div class="h-full bg-gradient-to-r ${colors.progress} transition-all duration-500" style="width: ${project.progress}%;"></div>
            </div>
            
            <div class="text-xs space-y-2 text-gray-600">
                <div>
                    <strong class="text-gray-800">
                        <span class="lang-ja">期間:</span>
                        <span class="lang-en">Duration:</span>
                    </strong>
                    <span class="lang-ja">${project.durationJA}</span>
                    <span class="lang-en">${project.durationEN}</span>
                </div>
                <div>
                    <strong class="text-gray-800">
                        <span class="lang-ja">目標:</span>
                        <span class="lang-en">Goal:</span>
                    </strong>
                    <span class="lang-ja">${project.goalJA}</span>
                    <span class="lang-en">${project.goalEN}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * 言語を設定
 */
function setLanguage(lang) {
    currentLanguage = lang;
    document.body.setAttribute('data-lang', lang);
    
    // ボタンの状態を更新
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-gradient-to-br', 'from-purple-500', 'to-purple-700', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-500');
    });
    event.target.classList.remove('bg-gray-100', 'text-gray-500');
    event.target.classList.add('active', 'bg-gradient-to-br', 'from-purple-500', 'to-purple-700', 'text-white');
    
    // 設定を保存
    localStorage.setItem('preferredLanguage', lang);
}

/**
 * 部門を選択
 */
function selectDepartment(departmentId) {
    // すべてのハイライトをクリア
    document.querySelectorAll('.project-card').forEach(card => {
        card.classList.remove('highlighted', 'highlight-pulse');
    });
    
    // すべての部門選択をクリア
    document.querySelectorAll('.department-item').forEach(item => {
        item.classList.remove('active', 'bg-gradient-to-br', 'from-purple-500/10', 'to-purple-700/10', 'border-l-purple-500', 'font-semibold');
    });
    
    if (departmentId) {
        // 選択された部門をハイライト
        const selectedDeptItem = document.querySelector(`[data-department="${departmentId}"]`);
        if (selectedDeptItem && selectedDeptItem.classList.contains('department-item')) {
            selectedDeptItem.classList.add('active', 'bg-gradient-to-br', 'from-purple-500/10', 'to-purple-700/10', 'border-l-purple-500', 'font-semibold');
        }
        
        // 関連プロジェクトをハイライト
        document.querySelectorAll('.project-card').forEach(card => {
            const dept = card.getAttribute('data-department');
            if (dept === departmentId) {
                card.classList.add('highlighted', 'highlight-pulse');
                card.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)';
                card.style.borderColor = '#fbbf24';
            }
        });
        
        // タイトルを更新
        const dept = projectData.departments.find(d => d.id === departmentId);
        const selectedDeptSpan = document.getElementById('selectedDepartment');
        if (dept && selectedDeptSpan) {
            if (currentLanguage === 'ja') {
                selectedDeptSpan.textContent = ' - ' + dept.nameJA;
            } else {
                selectedDeptSpan.textContent = ' - ' + dept.nameEN;
            }
        }
    } else {
        document.getElementById('selectedDepartment').textContent = '';
        // すべてのプロジェクトカードをリセット
        document.querySelectorAll('.project-card').forEach(card => {
            card.style.background = '';
            card.style.borderColor = '';
        });
    }
}

/**
 * 選択をクリア
 */
function clearSelection() {
    selectDepartment(null);
}

/**
 * 言語設定を読み込み
 */
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'ja';
    currentLanguage = savedLang;
    if (savedLang === 'en') {
        document.body.setAttribute('data-lang', 'en');
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-gradient-to-br', 'from-purple-500', 'to-purple-700', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-500');
            if (btn.textContent.trim() === 'English') {
                btn.classList.remove('bg-gray-100', 'text-gray-500');
                btn.classList.add('active', 'bg-gradient-to-br', 'from-purple-500', 'to-purple-700', 'text-white');
            }
        });
    }
}

// ページ読み込み時にデータをフェッチ
document.addEventListener('DOMContentLoaded', loadProjectData);
