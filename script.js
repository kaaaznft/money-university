// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

// Show More Details Function
function showMore(elementId) {
    const element = document.getElementById(elementId);
    const button = event.target;
    
    if (element.classList.contains('show')) {
        element.classList.remove('show');
        button.textContent = '詳しく見る';
    } else {
        element.classList.add('show');
        button.textContent = '閉じる';
    }
}

// Generic Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Load exchange rates when opening the exchange rates modal
        if (modalId === 'exchange-rates-modal') {
            setTimeout(() => {
                loadExchangeRatesDashboard();
            }, 200);
        }
        
        // Load crypto data when opening crypto modal
        if (modalId === 'crypto-detail-modal') {
            setTimeout(() => {
                // Default to overview tab
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                document.querySelector('.tab-btn[data-tab="overview"]').classList.add('active');
                document.getElementById('overview-tab').classList.add('active');
            }, 100);
        }
    }
}

function openCompanyAnalysisModalToRules() {
    // Open the modal first
    openModal('company-analysis-modal');
    
    // Wait for modal to render, then scroll to the 7 rules section
    setTimeout(() => {
        const sevenRulesSection = document.querySelector('.seven-rules');
        if (sevenRulesSection) {
            sevenRulesSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Add temporary highlight to make it obvious
            sevenRulesSection.style.border = '2px solid #28a745';
            sevenRulesSection.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            sevenRulesSection.style.borderRadius = '8px';
            sevenRulesSection.style.transition = 'all 0.3s ease';
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                sevenRulesSection.style.border = '';
                sevenRulesSection.style.backgroundColor = '';
                sevenRulesSection.style.borderRadius = '';
            }, 3000);
        }
    }, 200);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Income Tax Modal Functions
function openIncomeTaxModal() {
    openModal('income-tax-modal');
}

function closeIncomeTaxModal() {
    closeModal('income-tax-modal');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Currency Detail Modal Functions
function openCurrencyDetailModal(currencyCode) {
    const currency = worldCurrencies.find(c => c.code === currencyCode);
    if (!currency) return;
    
    // Create modal content dynamically
    let modalContent = `
        <div class="modal-content-grid">
            <div class="modal-section">
                <h4>📍 基本情報</h4>
                <div class="currency-basic-info">
                    <div class="currency-info-row">
                        <span class="info-label">通貨名:</span>
                        <span class="info-value">${currency.name}</span>
                    </div>
                    <div class="currency-info-row">
                        <span class="info-label">通貨コード:</span>
                        <span class="info-value">${currency.code}</span>
                    </div>
                    <div class="currency-info-row">
                        <span class="info-label">通貨記号:</span>
                        <span class="info-value">${currency.symbol}</span>
                    </div>
                    <div class="currency-info-row">
                        <span class="info-label">使用国・地域:</span>
                        <span class="info-value">${currency.countries}</span>
                    </div>
                </div>
            </div>

            <div class="modal-section">
                <h4>📜 歴史・背景</h4>
                <p>${currency.history}</p>
            </div>

            <div class="modal-section">
                <h4>✨ 特徴</h4>
                <ul>
                    ${currency.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>

            <div class="modal-highlight">
                <h4>💡 興味深い事実</h4>
                <p>${currency.facts}</p>
            </div>
        </div>
    `;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('currency-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'currency-detail-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${currency.flag} ${currency.name}の詳細</h2>
                <span class="modal-close" onclick="closeModal('currency-detail-modal')">&times;</span>
            </div>
            <div class="modal-body">
                ${modalContent}
            </div>
        </div>
    `;
    
    openModal('currency-detail-modal');
}

// Floating Glossary Search Functions
function openGlossarySearch() {
    openModal('glossary-search-modal');
    document.getElementById('floating-search-input').focus();
}

function searchGlossaryFloat() {
    const searchTerm = document.getElementById('floating-search-input').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('floating-search-results');
    
    if (!searchTerm) {
        resultsDiv.innerHTML = '<p class="search-prompt">調べたい単語を入力してください</p>';
        return;
    }
    
    const filteredWords = glossaryWords.filter(word => 
        word.term.toLowerCase().includes(searchTerm) ||
        word.reading.toLowerCase().includes(searchTerm) ||
        word.meaning.toLowerCase().includes(searchTerm)
    );
    
    if (filteredWords.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">該当する単語が見つかりませんでした</p>';
        return;
    }
    
    resultsDiv.innerHTML = filteredWords.map(word => `
        <div class="floating-word-card">
            <div class="floating-word-header">
                <div class="floating-word-info">
                    <h4>${word.term}</h4>
                    <span class="floating-word-reading">${word.reading}</span>
                </div>
                <span class="floating-word-category category-${word.category}">${word.category}</span>
            </div>
            <div class="floating-word-meaning">${word.meaning}</div>
        </div>
    `).join('');
}

function searchQuickTerm(term) {
    document.getElementById('floating-search-input').value = term;
    searchGlossaryFloat();
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide floating buttons based on scroll
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const floatingBtn = document.getElementById('floating-glossary-btn');
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Show floating glossary button after 300px scroll
    if (currentScroll > 300) {
        floatingBtn.classList.add('show');
    } else {
        floatingBtn.classList.remove('show');
    }
    
    // Show scroll top button after 500px scroll
    if (currentScroll > 500) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
    
    // Hide buttons when scrolling down quickly, show when scrolling up
    if (currentScroll > lastScrollTop && currentScroll > 600) {
        floatingBtn.classList.add('hide');
        scrollTopBtn.classList.add('hide');
    } else {
        floatingBtn.classList.remove('hide');
        scrollTopBtn.classList.remove('hide');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// Enhanced Income Tax Calculator
function calculateIncomeTax() {
    const income = parseFloat(document.getElementById('income').value);
    const deductions = parseFloat(document.getElementById('deductions').value) || 120;
    const resultDiv = document.getElementById('income-tax-result');
    
    if (isNaN(income) || income <= 0) {
        resultDiv.innerHTML = '<span style="color: #dc3545;">正しい年収を入力してください</span>';
        return;
    }
    
    // 課税所得の計算
    const taxableIncome = Math.max(0, income - deductions);
    
    // 所得税の税率表（令和5年度）
    const taxBrackets = [
        { max: 195, rate: 0.05, deduction: 0 },
        { max: 330, rate: 0.10, deduction: 9.75 },
        { max: 695, rate: 0.20, deduction: 42.75 },
        { max: 900, rate: 0.23, deduction: 63.6 },
        { max: 1800, rate: 0.33, deduction: 153.6 },
        { max: 4000, rate: 0.40, deduction: 279.6 },
        { max: Infinity, rate: 0.45, deduction: 479.6 }
    ];
    
    let incomeTax = 0;
    
    for (let bracket of taxBrackets) {
        if (taxableIncome <= bracket.max) {
            incomeTax = Math.max(0, taxableIncome * bracket.rate - bracket.deduction);
            break;
        }
    }
    
    // 住民税の計算（所得割10% + 均等割5000円）
    const residentTax = taxableIncome > 0 ? taxableIncome * 0.10 + 0.5 : 0;
    
    // 復興特別所得税（所得税の2.1%）
    const reconstructionTax = incomeTax * 0.021;
    
    const totalTax = incomeTax + residentTax + reconstructionTax;
    const netIncome = income - totalTax;
    const totalTaxRate = income > 0 ? ((totalTax / income) * 100).toFixed(1) : 0;
    
    resultDiv.innerHTML = `
        <div style="line-height: 1.8;">
            <strong>💰 税金計算結果</strong><br>
            年収: ${income.toLocaleString()}万円<br>
            所得控除: ${deductions.toLocaleString()}万円<br>
            課税所得: ${taxableIncome.toLocaleString()}万円<br><br>
            <strong>各種税金</strong><br>
            所得税: ${incomeTax.toFixed(1)}万円<br>
            復興特別所得税: ${reconstructionTax.toFixed(1)}万円<br>
            住民税: ${residentTax.toFixed(1)}万円<br>
            <strong>税金合計: ${totalTax.toFixed(1)}万円</strong><br>
            実効税率: ${totalTaxRate}%<br>
            手取り（概算）: ${netIncome.toFixed(1)}万円
        </div>
    `;
}

// Property Tax Calculator
function calculatePropertyTax() {
    const propertyValue = parseFloat(document.getElementById('property-value').value);
    const propertyType = document.getElementById('property-type').value;
    const resultDiv = document.getElementById('property-tax-result');
    
    if (isNaN(propertyValue) || propertyValue <= 0) {
        resultDiv.innerHTML = '<span style="color: #dc3545;">正しい評価額を入力してください</span>';
        return;
    }
    
    let taxableValue = propertyValue;
    let specialReduction = "";
    
    // 物件種別による軽減措置
    switch(propertyType) {
        case 'residential-small':
            taxableValue = propertyValue / 6; // 小規模住宅用地特例
            specialReduction = "小規模住宅用地特例（1/6軽減）";
            break;
        case 'residential':
            taxableValue = propertyValue / 3; // 一般住宅用地特例
            specialReduction = "一般住宅用地特例（1/3軽減）";
            break;
        case 'commercial':
        case 'building':
            taxableValue = propertyValue; // 軽減なし
            specialReduction = "軽減措置なし";
            break;
    }
    
    // 固定資産税（標準税率1.4%）
    const propertyTax = taxableValue * 0.014;
    
    // 都市計画税（最大0.3%、住宅用地のみ）
    let cityPlanningTax = 0;
    if (propertyType.includes('residential')) {
        cityPlanningTax = taxableValue * 0.003;
    }
    
    const totalTax = propertyTax + cityPlanningTax;
    
    resultDiv.innerHTML = `
        <div style="line-height: 1.8;">
            <strong>🏠 固定資産税計算結果</strong><br>
            評価額: ${propertyValue.toLocaleString()}万円<br>
            課税標準額: ${taxableValue.toLocaleString()}万円<br>
            軽減措置: ${specialReduction}<br><br>
            <strong>税額</strong><br>
            固定資産税: ${propertyTax.toLocaleString()}円<br>
            都市計画税: ${cityPlanningTax.toLocaleString()}円<br>
            <strong>年税額合計: ${totalTax.toLocaleString()}円</strong>
        </div>
    `;
}

// Car Tax Calculator
function calculateCarTax() {
    const carType = document.getElementById('car-type').value;
    const carAge = document.getElementById('car-age').value;
    const resultDiv = document.getElementById('car-tax-result');
    
    // 自動車税額表
    const carTaxRates = {
        'kei': 10800, // 軽自動車税
        '1000': 25000,
        '1500': 30500,
        '2000': 36000,
        '2500': 43500,
        '3000': 50000,
        '3500': 57000,
        '4000': 64500,
        '4500': 74500,
        '6000': 86000,
        '6001': 111000
    };
    
    let baseTax = carTaxRates[carType];
    let finalTax = baseTax;
    let ageInfo = "";
    
    // 13年超の重課税
    if (carAge === 'old' && carType !== 'kei') {
        finalTax = Math.floor(baseTax * 1.15);
        ageInfo = "13年超重課税（15%増）";
    } else if (carAge === 'old' && carType === 'kei') {
        finalTax = 12900; // 軽自動車の重課税
        ageInfo = "13年超重課税";
    } else {
        ageInfo = "標準税率";
    }
    
    const carTypeName = carType === 'kei' ? '軽自動車' : 
                       `普通車 ${carType === '6001' ? '6000cc超' : carType + 'cc以下'}`;
    
    resultDiv.innerHTML = `
        <div style="line-height: 1.8;">
            <strong>🚗 自動車税計算結果</strong><br>
            車種: ${carTypeName}<br>
            基本税額: ${baseTax.toLocaleString()}円<br>
            課税区分: ${ageInfo}<br>
            <strong>年税額: ${finalTax.toLocaleString()}円</strong><br><br>
            <small>※エコカー減税等の特例措置は含まれていません</small>
        </div>
    `;
}

// Exchange Rate Calculator with Real-time API
async function calculateExchange() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('from-currency').value.toLowerCase();
    const toCurrency = document.getElementById('to-currency').value.toLowerCase();
    const resultDiv = document.getElementById('exchange-result');
    
    if (isNaN(amount) || amount <= 0) {
        resultDiv.innerHTML = '<span style="color: #dc3545;">正しい金額を入力してください</span>';
        return;
    }
    
    if (fromCurrency === toCurrency) {
        resultDiv.innerHTML = '<span style="color: #dc3545;">異なる通貨を選択してください</span>';
        return;
    }
    
    // Show loading state
    resultDiv.innerHTML = `
        <div style="line-height: 1.8; text-align: center;">
            <strong>📈 リアルタイム為替レートを取得中...</strong><br>
            <div style="margin: 10px 0;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #228B22; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
            </div>
        </div>
    `;
    
    try {
        // Get real-time exchange rates from free API
        const rate = await getRealTimeExchangeRate(fromCurrency, toCurrency);
        
        if (rate === null) {
            throw new Error('レートの取得に失敗しました');
        }
        
        const convertedAmount = amount * rate;
        
        const currencySymbols = {
            'jpy': '¥',
            'usd': '$',
            'eur': '€',
            'gbp': '£',
            'cny': '¥',
            'krw': '₩'
        };
        
        const fromSymbol = currencySymbols[fromCurrency] || '';
        const toSymbol = currencySymbols[toCurrency] || '';
        
        resultDiv.innerHTML = `
            <div style="line-height: 1.8;">
                <strong>💱 リアルタイム両替結果</strong><br>
                ${fromSymbol}${amount.toLocaleString()} ${fromCurrency.toUpperCase()}<br>
                ↓ (レート: 1 ${fromCurrency.toUpperCase()} = ${rate.toFixed(6)} ${toCurrency.toUpperCase()})<br>
                <strong style="color: #228B22;">${toSymbol}${convertedAmount.toFixed(2)} ${toCurrency.toUpperCase()}</strong>
                <br><br>
                <small style="color: #666;">✅ 最新の為替レートを使用（データ提供: Currency API）</small>
            </div>
        `;
    } catch (error) {
        console.error('Exchange rate fetch error:', error);
        
        // Fallback to cached rates if API fails
        const fallbackRate = getFallbackExchangeRate(fromCurrency, toCurrency);
        
        if (fallbackRate) {
            const convertedAmount = amount * fallbackRate;
            const currencySymbols = {
                'jpy': '¥',
                'usd': '$',
                'eur': '€',
                'gbp': '£',
                'cny': '¥',
                'krw': '₩'
            };
            
            const fromSymbol = currencySymbols[fromCurrency] || '';
            const toSymbol = currencySymbols[toCurrency] || '';
            
            resultDiv.innerHTML = `
                <div style="line-height: 1.8;">
                    <strong>⚠️ 概算両替結果</strong><br>
                    ${fromSymbol}${amount.toLocaleString()} ${fromCurrency.toUpperCase()}<br>
                    ↓ (レート: 1 ${fromCurrency.toUpperCase()} = ${fallbackRate} ${toCurrency.toUpperCase()})<br>
                    ${toSymbol}${convertedAmount.toFixed(2)} ${toCurrency.toUpperCase()}
                    <br><br>
                    <small style="color: #ff6b6b;">※ APIエラーのため概算レートを使用しています。実際の取引では最新のレートをご確認ください。</small>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="color: #dc3545; text-align: center; line-height: 1.8;">
                    <strong>❌ 為替レートの取得に失敗しました</strong><br>
                    <small>しばらく時間を置いてから再度お試しください</small>
                </div>
            `;
        }
    }
}

// Get real-time exchange rate from free API
async function getRealTimeExchangeRate(fromCurrency, toCurrency) {
    const primaryUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency}.json`;
    const fallbackUrl = `https://latest.currency-api.pages.dev/v1/currencies/${fromCurrency}.json`;
    
    try {
        // Try primary API first
        let response = await fetch(primaryUrl);
        
        if (!response.ok) {
            // Try fallback API
            response = await fetch(fallbackUrl);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if the target currency exists in the response
        if (data[fromCurrency] && data[fromCurrency][toCurrency]) {
            return data[fromCurrency][toCurrency];
        } else {
            throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        }
    } catch (error) {
        console.error('API fetch error:', error);
        return null;
    }
}

// Fallback exchange rates (used when API fails)
function getFallbackExchangeRate(fromCurrency, toCurrency) {
    const fallbackRates = {
        'jpy': { 'usd': 0.0067, 'eur': 0.0061, 'gbp': 0.0053, 'cny': 0.048, 'krw': 8.85 },
        'usd': { 'jpy': 149.50, 'eur': 0.91, 'gbp': 0.79, 'cny': 7.15, 'krw': 1320.50 },
        'eur': { 'jpy': 164.20, 'usd': 1.10, 'gbp': 0.87, 'cny': 7.86, 'krw': 1452.30 },
        'gbp': { 'jpy': 188.70, 'usd': 1.27, 'eur': 1.15, 'cny': 9.03, 'krw': 1668.90 },
        'cny': { 'jpy': 20.90, 'usd': 0.14, 'eur': 0.127, 'gbp': 0.111, 'krw': 184.80 },
        'krw': { 'jpy': 0.113, 'usd': 0.00076, 'eur': 0.00069, 'gbp': 0.0006, 'cny': 0.0054 }
    };
    
    return fallbackRates[fromCurrency] && fallbackRates[fromCurrency][toCurrency] ? fallbackRates[fromCurrency][toCurrency] : null;
}

// Quiz System
const quizQuestions = [
    {
        question: "日本の消費税率は何%でしょうか？",
        options: [8, 10, 12, 15],
        correct: 1,
        explanation: "日本の消費税率は10%です。軽減税率対象品目は8%が適用されます。"
    },
    {
        question: "所得税の課税方式は何でしょうか？",
        options: ["比例税率", "累進税率", "定額税率", "逆進税率"],
        correct: 1,
        explanation: "所得税は累進税率を採用しており、所得が高いほど税率が高くなります。"
    },
    {
        question: "為替レートが「1ドル＝150円」の時、100ドルは何円でしょうか？",
        options: ["1,500円", "15,000円", "150円", "1,50円"],
        correct: 1,
        explanation: "100ドル × 150円/ドル = 15,000円になります。"
    },
    {
        question: "中央銀行の主な役割として正しくないものはどれでしょうか？",
        options: ["通貨の発行", "金利政策", "税金の徴収", "物価の安定"],
        correct: 2,
        explanation: "税金の徴収は政府（税務署など）の役割で、中央銀行の役割ではありません。"
    },
    {
        question: "インフレーションとは何でしょうか？",
        options: ["物価が下がること", "物価が上がること", "金利が上がること", "為替が変動すること"],
        correct: 1,
        explanation: "インフレーションとは継続的に物価が上昇する現象のことです。"
    }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

function displayQuestion() {
    const question = quizQuestions[currentQuestion];
    const questionDiv = document.getElementById('quiz-question');
    
    let optionsHtml = '';
    question.options.forEach((option, index) => {
        optionsHtml += `<button class="quiz-option" onclick="selectAnswer(${currentQuestion}, ${index})">${option}</button>`;
    });
    
    questionDiv.innerHTML = `
        <h3>質問${currentQuestion + 1}: ${question.question}</h3>
        <div class="quiz-options">
            ${optionsHtml}
        </div>
    `;
    
    document.getElementById('quiz-result').innerHTML = '';
    document.getElementById('next-question').style.display = 'none';
    document.getElementById('restart-quiz').style.display = 'none';
    answered = false;
}

function selectAnswer(questionIndex, selectedIndex) {
    if (answered) return;
    
    const question = quizQuestions[questionIndex];
    const options = document.querySelectorAll('.quiz-option');
    const resultDiv = document.getElementById('quiz-result');
    
    answered = true;
    
    // すべてのオプションを無効化
    options.forEach((option, index) => {
        option.style.pointerEvents = 'none';
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== question.correct) {
            option.classList.add('incorrect');
        }
    });
    
    // 結果表示
    if (selectedIndex === question.correct) {
        score++;
        resultDiv.innerHTML = `
            <div style="color: #28a745; font-weight: bold;">
                ✅ 正解！ ${question.explanation}
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div style="color: #dc3545; font-weight: bold;">
                ❌ 不正解。正解は「${question.options[question.correct]}」です。<br>
                ${question.explanation}
            </div>
        `;
    }
    
    // スコア更新
    document.getElementById('score').textContent = score;
    
    // 次の質問ボタンまたは結果表示
    if (currentQuestion < quizQuestions.length - 1) {
        document.getElementById('next-question').style.display = 'inline-block';
    } else {
        showFinalScore();
    }
}

function nextQuestion() {
    currentQuestion++;
    displayQuestion();
}

function showFinalScore() {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    let message = '';
    
    if (percentage >= 80) {
        message = '🎉 素晴らしい！金融の知識がしっかり身についていますね！';
    } else if (percentage >= 60) {
        message = '👍 良く理解できています！もう少し学習を続けましょう。';
    } else {
        message = '📚 基本から復習してみましょう。きっと理解が深まります！';
    }
    
    document.getElementById('quiz-result').innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <h3>クイズ完了！</h3>
            <p>スコア: ${score} / ${quizQuestions.length} (${percentage}%)</p>
            <p>${message}</p>
        </div>
    `;
    
    document.getElementById('restart-quiz').style.display = 'inline-block';
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    document.getElementById('score').textContent = score;
    displayQuestion();
}

// Enhanced Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            scrollToSection(target);
        }
    });
});

// Utility function for smooth scrolling to sections
function scrollToSection(targetElement) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = targetElement.offsetTop - headerHeight - 20;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// Enhanced setLearningMode function with improved scrolling
function setLearningModeWithScroll(mode, scrollToTarget = true) {
    setLearningMode(mode);
    
    // If scrolling is requested and not 'all' mode, scroll to the first relevant section
    if (scrollToTarget && mode !== 'all') {
        setTimeout(() => {
            let targetSection = null;
            
            switch(mode) {
                case 'currency':
                    targetSection = document.getElementById('currency');
                    break;
                case 'tax':
                    targetSection = document.getElementById('tax');
                    break;
                case 'glossary':
                    targetSection = document.getElementById('glossary');
                    break;
            }
            
            if (targetSection) {
                scrollToSection(targetSection);
            }
        }, 150);
    }
}

// Header Background on Scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(34, 139, 34, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#228B22';
        header.style.backdropFilter = 'none';
    }
});

// Intersection Observer for Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card, .calculator-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Initialize quiz
    displayQuestion();
});

// Input validation and formatting
document.addEventListener('DOMContentLoaded', function() {
    const incomeInput = document.getElementById('income');
    const amountInput = document.getElementById('amount');
    
    // Format number inputs
    [incomeInput, amountInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                // Remove non-numeric characters except decimal point
                this.value = this.value.replace(/[^0-9.]/g, '');
                
                // Prevent multiple decimal points
                const parts = this.value.split('.');
                if (parts.length > 2) {
                    this.value = parts[0] + '.' + parts.slice(1).join('');
                }
            });
        }
    });
    
    // Enter key handling for calculators
    if (incomeInput) {
        incomeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateIncomeTax();
            }
        });
    }
    
    if (amountInput) {
        amountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateExchange();
            }
        });
    }
});

// Error handling for missing elements
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

// Accessibility improvements
document.addEventListener('DOMContentLoaded', function() {
    // Add ARIA labels
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.setAttribute('aria-label', 'メニューを開く');
        navToggle.setAttribute('aria-expanded', 'false');
    }
    
    // Update aria-expanded on menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navToggle.setAttribute('aria-label', isExpanded ? 'メニューを開く' : 'メニューを閉じる');
        });
    }
    
    // Add keyboard navigation for quiz options
    document.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('quiz-option')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.click();
            }
        }
    });
});

// Performance optimization: Lazy loading for images (if any are added later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// World Currency Data and Display
const worldCurrencies = [
    {
        name: "日本円",
        code: "JPY",
        symbol: "¥",
        flag: "🇯🇵",
        countries: "日本",
        description: "日本の法定通貨",
        history: "現在の日本円制度は1871年（明治4年）の新貨条例により始まりました。戦後の1949年に1ドル=360円の固定レートが設定され、1973年に変動相場制に移行しました。",
        features: [
            "世界第3位の取引量を誇る主要通貨",
            "安全資産として世界的に認識",
            "低金利政策で知られる",
            "紙幣は日本銀行券として発行"
        ],
        facts: "日本円は世界で最も偽造が困難な通貨の一つとされており、特に1万円札の透かしや特殊インクなどの技術は高く評価されています。"
    },
    {
        name: "米ドル",
        code: "USD",
        symbol: "$",
        flag: "🇺🇸",
        countries: "アメリカ、エクアドル、エルサルバドル、パナマなど",
        description: "世界の基軸通貨",
        history: "1792年の造幣法により米ドルが誕生しました。1944年のブレトン・ウッズ協定により金本位制の下で国際基軸通貨となり、1971年のニクソン・ショックで金本位制から離脱した後も基軸通貨の地位を維持しています。",
        features: [
            "世界の外貨準備の約60%を占める",
            "国際貿易の約40%で使用される",
            "石油取引の主要決済通貨（ペトロダラー）",
            "世界最大の金融市場を持つ"
        ],
        facts: "「In God We Trust」（我々は神を信じる）は1956年から米ドル紙幣に印刷されており、アメリカの国家モットーでもあります。"
    },
    {
        name: "ユーロ",
        code: "EUR",
        symbol: "€",
        flag: "🇪🇺",
        countries: "ドイツ、フランス、イタリア、スペイン、オランダなど19カ国",
        description: "欧州連合の統一通貨",
        history: "1999年に電子通貨として導入され、2002年から紙幣・硬貨の流通が開始されました。欧州統合の象徴として、複数の独立国が共通通貨を使用する史上最大の通貨統合プロジェクトです。",
        features: [
            "世界第2位の取引量を持つ通貨",
            "19カ国・約3億4千万人が使用",
            "ユーロ建て債券市場は世界第2位",
            "欧州中央銀行（ECB）が金融政策を統括"
        ],
        facts: "ユーロ紙幣のデザインは実在しない建築物をモチーフにしており、特定の国に偏らないよう配慮されています。橋や門などのデザインは「協力」と「開放性」を象徴しています。"
    },
    {
        name: "英ポンド",
        code: "GBP",
        symbol: "£",
        flag: "🇬🇧",
        countries: "イギリス（イングランド、スコットランド、ウェールズ、北アイルランド）",
        description: "世界最古の現存する通貨の一つ",
        history: "起源は8世紀のアングロサクソン時代まで遡ります。現在の形態は1694年のイングランド銀行設立とともに確立されました。19世紀から20世紀初頭まで国際基軸通貨として機能していました。",
        features: [
            "1200年以上の歴史を持つ",
            "世界第4位の取引量",
            "ロンドンは世界最大の外国為替市場",
            "Brexit後も国際金融の重要拠点"
        ],
        facts: "ポンド記号「£」はラテン語の「libra」（天秤）に由来し、これは重量の単位でもありました。1ポンド＝約453.6グラムという重量単位も、この通貨から来ています。"
    },
    {
        name: "中国元",
        code: "CNY",
        symbol: "¥",
        flag: "🇨🇳",
        countries: "中華人民共和国",
        description: "中華人民共和国の法定通貨",
        history: "現在の人民元は1948年に中国人民銀行により発行が開始されました。改革開放政策以降、段階的に国際化が進み、2016年にはIMFの特別引出権（SDR）の構成通貨に加わりました。",
        features: [
            "世界第2位の経済大国の通貨",
            "「一帯一路」政策で国際化を推進",
            "デジタル人民元（DCEP）を世界に先駆けて開発",
            "資本取引に一定の規制がある"
        ],
        facts: "人民元の紙幣には毛沢東の肖像が使われており、これは1999年の第5版紙幣から統一されました。また、「元」「圓」「块」などの複数の呼び方があります。"
    },
    {
        name: "カナダドル",
        code: "CAD",
        symbol: "C$",
        flag: "🇨🇦",
        countries: "カナダ",
        description: "カナダの法定通貨",
        history: "1858年にカナダ州の通貨として導入され、1867年のカナダ連邦成立とともに全国通貨となりました。1970年に変動相場制に移行し、資源国通貨として注目されています。",
        features: [
            "コモディティ通貨として知られる",
            "原油価格との相関が高い",
            "世界で最も安全な紙幣技術を持つ",
            "2011年からプラスチック製紙幣を導入"
        ],
        facts: "カナダの紙幣は2011年からポリマー（プラスチック）製になり、偽造防止と耐久性が大幅に向上しました。また、カナダは世界で初めて色付きの硬貨を発行した国でもあります。"
    },
    {
        name: "オーストラリアドル",
        code: "AUD",
        symbol: "A$",
        flag: "🇦🇺",
        countries: "オーストラリア、ナウル、ツバル、キリバス",
        description: "南太平洋地域の主要通貨",
        history: "1966年にオーストラリア・ポンドに代わって導入されました。1983年に変動相場制に移行し、資源国通貨として国際市場で取引されています。",
        features: [
            "世界初のプラスチック製紙幣を導入（1988年）",
            "鉱物資源価格と連動しやすい",
            "アジア太平洋地域の主要通貨",
            "高金利通貨として人気"
        ],
        facts: "オーストラリアは1988年に世界で初めてプラスチック製の紙幣を導入した国です。現在では30カ国以上がオーストラリアの技術を使用してプラスチック製紙幣を発行しています。"
    },
    {
        name: "スイスフラン",
        code: "CHF",
        symbol: "Fr",
        flag: "🇨🇭",
        countries: "スイス、リヒテンシュタイン",
        description: "安全資産として人気の通貨",
        history: "1850年にスイス連邦の統一通貨として導入されました。第二次世界大戦中に中立を保ったスイスの通貨として、安全資産としての地位を確立しました。",
        features: [
            "世界最強の安全資産通貨の一つ",
            "インフレ率が非常に低い",
            "政治的安定性が高い",
            "プライベートバンキングの中心地"
        ],
        facts: "スイスフランは「CHF」と表記されますが、これは「Confoederatio Helvetica Franc」の略で、ラテン語でスイス連邦を意味します。スイスの公用語が4つあるため、中立的なラテン語が使われています。"
    },
    {
        name: "シンガポールドル",
        code: "SGD",
        symbol: "S$",
        flag: "🇸🇬",
        countries: "シンガポール",
        description: "東南アジアの金融ハブの通貨",
        history: "1967年にマレーシア・シンガポールドルから分離して誕生しました。シンガポールの急速な経済発展とともに、東南アジア地域の主要通貨となりました。",
        features: [
            "東南アジアの金融センターの通貨",
            "通貨バスケット制による安定性",
            "世界第13位の取引量",
            "アジア太平洋地域のハブ通貨"
        ],
        facts: "シンガポールドルの紙幣には6つの言語（英語、中国語、マレー語、タミル語、アラビア語、ジャウィ文字）で額面が記載されており、多民族国家シンガポールの特徴を表しています。"
    },
    {
        name: "韓国ウォン",
        code: "KRW",
        symbol: "₩",
        flag: "🇰🇷",
        countries: "韓国",
        description: "大韓民国の法定通貨",
        history: "現在の韓国ウォンは1962年に導入されました（旧ウォンの1000分の1の価値）。1997年のアジア通貨危機を経て、現在は変動相場制のもとで取引されています。",
        features: [
            "世界第16位の取引量",
            "IT・半導体産業の成長と連動",
            "北朝鮮ウォンとは別の通貨",
            "1、5、10、50、100、500ウォン硬貨が流通"
        ],
        facts: "韓国では1000ウォン未満の少額決済はほぼ完全にカードや電子決済に移行しており、現金使用率が世界で最も低い国の一つです。また、韓国ウォンの記号「₩」は「Won」の頭文字Wに由来します。"
    },
    {
        name: "インドルピー",
        code: "INR",
        symbol: "₹",
        flag: "🇮🇳",
        countries: "インド",
        description: "世界最大の人口を持つ国の通貨",
        history: "ルピーの語源は古代サンスクリット語の「銀」を意味する「ルーパ」に由来します。現在のインドルピーは1947年の独立とともに確立され、1993年に変動相場制に移行しました。",
        features: [
            "世界最大の民主主義国家の通貨",
            "IT・ソフトウェア産業の成長で注目",
            "モディ政権下でデジタル化を推進",
            "2016年に高額紙幣廃止を実施"
        ],
        facts: "2016年11月、インド政府は突然500ルピー札と1000ルピー札の廃止を発表し、国民に新紙幣への交換を求めました。この政策は腐敗撲滅とデジタル決済促進を目的としていました。"
    },
    {
        name: "ブラジルレアル",
        code: "BRL",
        symbol: "R$",
        flag: "🇧🇷",
        countries: "ブラジル",
        description: "南米最大の経済国の通貨",
        history: "現在のレアルは1994年に導入され、それまでの激しいインフレーションを抑制することに成功しました。「レアル計画」として知られる経済安定化政策の一環として生まれました。",
        features: [
            "南米最大の経済圏の通貨",
            "コモディティ価格に影響を受けやすい",
            "BRICs諸国の一つ",
            "サッカーワールドカップ、オリンピック開催国"
        ],
        facts: "ブラジルレアルの名前は、ポルトガル語・スペイン語で「王の」「現実の」という意味の「real」に由来します。過去には「レアル・デ・オウロ」（金のレアル）という通貨も存在していました。"
    }
];

function displayWorldCurrencies() {
    const currencyGrid = document.getElementById('currency-grid');
    if (!currencyGrid) return;
    
    currencyGrid.innerHTML = '';
    
    worldCurrencies.forEach(currency => {
        const currencyCard = document.createElement('div');
        currencyCard.className = 'currency-card';
        currencyCard.setAttribute('tabindex', '0');
        currencyCard.setAttribute('role', 'button');
        currencyCard.setAttribute('aria-label', `${currency.name}の詳細を表示`);
        
        currencyCard.innerHTML = `
            <div class="currency-header">
                <div class="currency-flag">${currency.flag}</div>
                <div class="currency-info">
                    <h3>${currency.name}</h3>
                    <div class="currency-code">${currency.code}</div>
                </div>
            </div>
            <div class="currency-details">
                <p><span class="currency-symbol">${currency.symbol}</span>${currency.description}</p>
                <div class="currency-countries">主要使用国・地域: ${currency.countries}</div>
                <button class="card-btn currency-detail-btn" onclick="openCurrencyDetailModal('${currency.code}')">詳しく見る</button>
            </div>
        `;
        
        // Add click animation and modal display
        currencyCard.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Show currency detail modal
            showCurrencyModal(currency);
        });
        
        // Keyboard accessibility
        currencyCard.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        currencyGrid.appendChild(currencyCard);
    });
}

// Currency Modal Functions
function showCurrencyModal(currency) {
    const modal = document.getElementById('currency-modal');
    
    // Populate modal content
    document.getElementById('modal-currency-name').textContent = currency.name;
    document.getElementById('modal-flag').textContent = currency.flag;
    document.getElementById('modal-code').textContent = currency.code;
    document.getElementById('modal-symbol').textContent = currency.symbol;
    document.getElementById('modal-countries').textContent = currency.countries;
    document.getElementById('modal-history').textContent = currency.history;
    document.getElementById('modal-facts').textContent = currency.facts;
    
    // Populate features list
    const featuresList = document.getElementById('modal-features');
    featuresList.innerHTML = '';
    currency.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeCurrencyModal() {
    const modal = document.getElementById('currency-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Glossary Data and Management
let glossaryData = [
    {
        id: 1,
        word: "GDP",
        reading: "ジーディーピー",
        meaning: "国内総生産（Gross Domestic Product）。一定期間内に国内で生産されたすべての最終財・サービスの市場価値の合計。国の経済規模を測る重要な指標です。",
        category: "経済"
    },
    {
        id: 2,
        word: "インフレーション",
        reading: "インフレーション",
        meaning: "物価が継続的に上昇する現象。お金の価値が下がり、同じ商品を買うのにより多くのお金が必要になります。適度なインフレは経済成長の証拠とされています。",
        category: "経済"
    },
    {
        id: 3,
        word: "デフレーション",
        reading: "デフレーション",
        meaning: "物価が継続的に下落する現象。お金の価値が上がりますが、企業の売上減少や雇用悪化を招く可能性があります。日本は長期間デフレに悩まされました。",
        category: "経済"
    },
    {
        id: 4,
        word: "為替レート",
        reading: "かわせレート",
        meaning: "異なる通貨を交換する際の比率。例えば「1ドル=150円」という具合に表されます。国際貿易や投資に大きな影響を与える重要な指標です。",
        category: "通貨"
    },
    {
        id: 5,
        word: "累進課税",
        reading: "るいしんかぜい",
        meaning: "所得が多いほど高い税率が適用される税制システム。日本の所得税がこの方式を採用しており、所得の再分配機能を持っています。",
        category: "税金"
    },
    {
        id: 6,
        word: "消費税",
        reading: "しょうひぜい",
        meaning: "商品やサービスの購入時に課される税金。現在の日本では標準税率10%、軽減税率8%が適用されています。",
        category: "税金"
    },
    {
        id: 7,
        word: "複利",
        reading: "ふくり",
        meaning: "元本に利息を加えた金額に対して、さらに利息が計算される仕組み。「お金がお金を生む」効果により、長期投資では大きな威力を発揮します。",
        category: "投資"
    },
    {
        id: 8,
        word: "分散投資",
        reading: "ぶんさんとうし",
        meaning: "投資先を複数に分けてリスクを軽減する投資手法。「卵を一つのかごに盛るな」という格言で表現されることもあります。",
        category: "投資"
    },
    {
        id: 9,
        word: "中央銀行",
        reading: "ちゅうおうぎんこう",
        meaning: "国の金融政策を担う銀行。日本では日本銀行（日銀）がこれに当たります。通貨発行、金利政策、物価安定などの重要な役割を担っています。",
        category: "銀行"
    },
    {
        id: 10,
        word: "金利",
        reading: "きんり",
        meaning: "お金を借りる際に支払う利息の割合、または預金に対して受け取る利息の割合。経済活動や個人の資産形成に大きな影響を与えます。",
        category: "銀行"
    },
    {
        id: 11,
        word: "インボイス制度",
        reading: "インボイスせいど",
        meaning: "消費税の仕入税額控除を受けるために必要な「適格請求書」を発行・保存する制度。2023年10月から開始され、事業者には適格請求書発行事業者の登録が求められます。",
        category: "税金"
    },
    {
        id: 12,
        word: "欠損金",
        reading: "けっそんきん",
        meaning: "法人税法上の赤字のこと。事業年度で収益よりも費用や損失が上回った場合に発生します。一定の要件下で翌年度以降の所得と相殺することができます。",
        category: "税金"
    },
    {
        id: 13,
        word: "繰越控除制度",
        reading: "くりこしこうじょせいど",
        meaning: "欠損金を翌年度以降に繰り越して、将来の所得から控除できる制度。法人は最大10年間、個人事業主は最大3年間の繰越が可能です。",
        category: "税金"
    },
    {
        id: 14,
        word: "基礎控除",
        reading: "きそこうじょ",
        meaning: "所得税や住民税の計算において、すべての納税者に一律で認められる控除。令和2年分以降、所得税の基礎控除額は48万円（合計所得金額2400万円以下の場合）となっています。",
        category: "税金"
    }
];

let isAdminMode = false;
let nextGlossaryId = Math.max(...glossaryData.map(item => item.id)) + 1;

// Learning Mode Control
let currentMode = 'all'; // 'all', 'currency', 'tax', 'investment', 'glossary'

function setLearningMode(mode) {
    currentMode = mode;
    
    // Show/hide content sections
    const currencyContent = document.querySelectorAll('.currency-content');
    const taxContent = document.querySelectorAll('.tax-content');
    const investmentContent = document.querySelectorAll('.investment-content');
    const glossaryContent = document.querySelectorAll('.glossary-content');
    const calculatorSection = document.getElementById('calculator');
    const quizSection = document.getElementById('quiz');
    const heroSection = document.querySelector('.hero');
    
    // Hide all first
    [...currencyContent, ...taxContent, ...investmentContent, ...glossaryContent].forEach(section => {
        section.classList.add('content-hidden');
    });
    
    // Hide calculator and quiz for specific modes
    if (calculatorSection) calculatorSection.classList.add('content-hidden');
    if (quizSection) quizSection.classList.add('content-hidden');
    
    let targetSection = null;
    
    // Show relevant content based on mode and set target section for scrolling
    switch(mode) {
        case 'currency':
            currencyContent.forEach(section => {
                section.classList.remove('content-hidden');
            });
            // Hide hero section for specific learning modes
            if (heroSection) heroSection.classList.add('content-hidden');
            targetSection = document.getElementById('currency');
            break;
        case 'tax':
            taxContent.forEach(section => {
                section.classList.remove('content-hidden');
            });
            // Hide hero section for specific learning modes
            if (heroSection) heroSection.classList.add('content-hidden');
            targetSection = document.getElementById('tax');
            break;
        case 'investment':
            investmentContent.forEach(section => {
                section.classList.remove('content-hidden');
            });
            // Hide hero section for specific learning modes
            if (heroSection) heroSection.classList.add('content-hidden');
            targetSection = document.getElementById('investment');
            break;
        case 'glossary':
            glossaryContent.forEach(section => {
                section.classList.remove('content-hidden');
            });
            // Hide hero section for specific learning modes
            if (heroSection) heroSection.classList.add('content-hidden');
            targetSection = document.getElementById('glossary');
            break;
        case 'all':
        default:
            [...currencyContent, ...taxContent, ...investmentContent, ...glossaryContent].forEach(section => {
                section.classList.remove('content-hidden');
            });
            // Show calculator and quiz only in 'all' mode
            if (calculatorSection) calculatorSection.classList.remove('content-hidden');
            if (quizSection) quizSection.classList.remove('content-hidden');
            // Show hero section in 'all' mode
            if (heroSection) heroSection.classList.remove('content-hidden');
            // For 'all' mode, scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
    }
    
    // Smooth scroll to the target section with header offset
    if (targetSection) {
        setTimeout(() => {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }, 100); // Small delay to ensure content is visible before scrolling
    }
}

// Glossary Functions
function displayGlossary(filteredData = null) {
    const glossaryGrid = document.getElementById('glossary-grid');
    if (!glossaryGrid) return;
    
    const dataToShow = filteredData || glossaryData;
    glossaryGrid.innerHTML = '';
    
    dataToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glossary-card';
        
        card.innerHTML = `
            <div class="glossary-word">
                <div class="word-info">
                    <h3>${item.word}</h3>
                    <div class="word-reading">${item.reading}</div>
                </div>
                <div class="word-category category-${item.category}">${item.category}</div>
            </div>
            <div class="word-meaning">${item.meaning}</div>
            ${isAdminMode ? `
            <div class="word-actions">
                <button class="edit-btn" onclick="editWord(${item.id})">編集</button>
                <button class="delete-btn" onclick="deleteWord(${item.id})">削除</button>
            </div>
            ` : ''}
        `;
        
        glossaryGrid.appendChild(card);
    });
}

function searchGlossary() {
    const searchTerm = document.getElementById('glossary-search').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayGlossary();
        return;
    }
    
    const filteredData = glossaryData.filter(item => 
        item.word.toLowerCase().includes(searchTerm) ||
        item.reading.toLowerCase().includes(searchTerm) ||
        item.meaning.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    
    displayGlossary(filteredData);
}

function showPasswordPrompt() {
    document.getElementById('password-prompt').style.display = 'flex';
    document.getElementById('admin-password').focus();
}

function hidePasswordPrompt() {
    document.getElementById('password-prompt').style.display = 'none';
    document.getElementById('admin-password').value = '';
}

function verifyPassword() {
    const password = document.getElementById('admin-password').value;
    
    if (password === '1111') {
        isAdminMode = true;
        hidePasswordPrompt();
        showAddWordForm();
        displayGlossary(); // Refresh to show admin buttons
        
        // Show success message
        alert('管理者モードが有効になりました。単語の追加・編集・削除が可能です。');
    } else {
        alert('パスワードが間違っています。');
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
}

function showAddWordForm() {
    document.getElementById('add-word-form').style.display = 'block';
    document.getElementById('new-word').focus();
}

function hideAddWordForm() {
    document.getElementById('add-word-form').style.display = 'none';
    clearAddWordForm();
}

function clearAddWordForm() {
    document.getElementById('new-word').value = '';
    document.getElementById('new-reading').value = '';
    document.getElementById('new-meaning').value = '';
    document.getElementById('new-category').value = '通貨';
}

function addNewWord() {
    const word = document.getElementById('new-word').value.trim();
    const reading = document.getElementById('new-reading').value.trim();
    const meaning = document.getElementById('new-meaning').value.trim();
    const category = document.getElementById('new-category').value;
    
    if (!word || !reading || !meaning) {
        alert('すべての項目を入力してください。');
        return;
    }
    
    // Check for duplicate words
    if (glossaryData.some(item => item.word.toLowerCase() === word.toLowerCase())) {
        alert('この単語は既に登録されています。');
        return;
    }
    
    const newWord = {
        id: nextGlossaryId++,
        word: word,
        reading: reading,
        meaning: meaning,
        category: category
    };
    
    glossaryData.push(newWord);
    glossaryData.sort((a, b) => a.word.localeCompare(b.word, 'ja'));
    
    displayGlossary();
    hideAddWordForm();
    
    alert(`「${word}」を単語帳に追加しました。`);
}

function editWord(id) {
    const word = glossaryData.find(item => item.id === id);
    if (!word) return;
    
    const newWord = prompt('単語:', word.word);
    if (newWord === null) return;
    
    const newReading = prompt('読み方:', word.reading);
    if (newReading === null) return;
    
    const newMeaning = prompt('意味・解説:', word.meaning);
    if (newMeaning === null) return;
    
    const categories = ['通貨', '税金', '投資', '経済', '銀行', 'その他'];
    const newCategory = prompt(`カテゴリ (${categories.join(', ')}):`, word.category);
    if (newCategory === null) return;
    
    if (!categories.includes(newCategory)) {
        alert('有効なカテゴリを選択してください。');
        return;
    }
    
    word.word = newWord.trim() || word.word;
    word.reading = newReading.trim() || word.reading;
    word.meaning = newMeaning.trim() || word.meaning;
    word.category = newCategory.trim() || word.category;
    
    displayGlossary();
    alert('単語を更新しました。');
}

function deleteWord(id) {
    const word = glossaryData.find(item => item.id === id);
    if (!word) return;
    
    if (confirm(`「${word.word}」を削除しますか？この操作は取り消せません。`)) {
        glossaryData = glossaryData.filter(item => item.id !== id);
        displayGlossary();
        alert('単語を削除しました。');
    }
}

// Update the existing DOMContentLoaded event listener to include currency display
document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code...
    
    // Initialize world currencies display
    displayWorldCurrencies();
    
    // Initialize quiz
    displayQuestion();
    
    // Initialize glossary
    displayGlossary();
    
    // Initialize learning mode
    setLearningMode('all');
    
    // Add event listeners for mode switching with scrolling
    document.querySelectorAll('.mode-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const mode = this.getAttribute('data-mode');
            
            // Update active navigation link
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            
            // Close mobile menu if open
            const navMenu = document.getElementById('nav-menu');
            const navToggle = document.getElementById('nav-toggle');
            if (navMenu && navToggle) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
            
            setLearningMode(mode);
            
            // Add smooth scroll to target section after mode change
            if (mode !== 'all') {
                setTimeout(() => {
                    let targetSection = null;
                    
                    switch(mode) {
                        case 'currency':
                            targetSection = document.getElementById('currency');
                            break;
                        case 'tax':
                            targetSection = document.getElementById('tax');
                            break;
                        case 'investment':
                            targetSection = document.getElementById('investment');
                            break;
                        case 'glossary':
                            targetSection = document.getElementById('glossary');
                            break;
                    }
                    
                    if (targetSection) {
                        scrollToSection(targetSection);
                    }
                }, 150);
            }
        });
    });
    
    // Add event listeners for calculator and quiz links
    document.querySelectorAll('a[href="#calculator"], a[href="#quiz"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Hide all learning content sections
                const currencyContent = document.querySelectorAll('.currency-content');
                const taxContent = document.querySelectorAll('.tax-content');
                const investmentContent = document.querySelectorAll('.investment-content');
                const glossaryContent = document.querySelectorAll('.glossary-content');
                const heroSection = document.querySelector('.hero');
                const calculatorSection = document.getElementById('calculator');
                const quizSection = document.getElementById('quiz');
                
                [...currencyContent, ...taxContent, ...investmentContent, ...glossaryContent].forEach(section => {
                    section.classList.add('content-hidden');
                });
                
                if (heroSection) {
                    heroSection.classList.add('content-hidden');
                }
                
                // Hide both calculator and quiz, then show only the target
                if (calculatorSection) calculatorSection.classList.add('content-hidden');
                if (quizSection) quizSection.classList.add('content-hidden');
                
                // Show only the target section
                targetSection.classList.remove('content-hidden');
                
                // Update active navigation link
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
                
                // Close mobile menu if open
                const navMenu = document.getElementById('nav-menu');
                const navToggle = document.getElementById('nav-toggle');
                if (navMenu && navToggle) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
                
                // Scroll to the section
                scrollToSection(targetSection);
            }
        });
    });
    
    // Add modal event listeners
    const modal = document.getElementById('currency-modal');
    const closeBtn = document.getElementById('modal-close');
    
    // Close modal when clicking the X button
    closeBtn.addEventListener('click', closeCurrencyModal);
    
    // Close modal when clicking outside the modal content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCurrencyModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeCurrencyModal();
        }
    });
    
    // Add search functionality with Enter key and auto-search on input
    const glossarySearchInput = document.getElementById('glossary-search');
    if (glossarySearchInput) {
        glossarySearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchGlossary();
            }
        });
        
        // Auto-search on input change with debounce
        let searchTimeout;
        glossarySearchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchGlossary();
            }, 300);
        });
    }
    
    // Add password input Enter key support
    const adminPasswordInput = document.getElementById('admin-password');
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyPassword();
            }
        });
    }
    
    // Initialize theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Check for saved theme preference or default to light mode
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeToggleIcon(currentTheme);
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeToggleIcon(newTheme);
        });
    }
});

// Theme toggle icon update function
function updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', 
            theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'
        );
    }
}

// Currency swap function
function swapCurrencies() {
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    
    if (fromCurrency && toCurrency) {
        // Get current values
        const fromValue = fromCurrency.value;
        const toValue = toCurrency.value;
        
        // Swap values
        fromCurrency.value = toValue;
        toCurrency.value = fromValue;
        
        // Add visual feedback
        const swapBtn = document.querySelector('.swap-btn');
        if (swapBtn) {
            swapBtn.style.transform = 'rotate(360deg) scale(1.1)';
            setTimeout(() => {
                swapBtn.style.transform = '';
            }, 300);
        }
        
        // If there's already a result, recalculate automatically
        const resultDiv = document.getElementById('exchange-result');
        if (resultDiv && resultDiv.innerHTML.trim() && !resultDiv.innerHTML.includes('正しい')) {
            calculateExchange();
        }
    }
}

// Call lazy loading function
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Exchange rates dashboard functions
async function loadExchangeRatesDashboard() {
    const tableDiv = document.getElementById('exchange-rates-table');
    const lastUpdatedDiv = document.getElementById('last-updated-dashboard');
    const refreshBtn = document.querySelector('.refresh-btn');
    
    // Show loading state
    tableDiv.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">🔄</div>
            <span>リアルタイムレートを取得中...</span>
        </div>
    `;
    
    // Disable refresh button temporarily
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.querySelector('.refresh-icon').style.animation = 'spin 1s linear infinite';
    }
    
    try {
        const currencies = [
            { code: 'USD', name: '米ドル', flag: '🇺🇸' },
            { code: 'EUR', name: 'ユーロ', flag: '🇪🇺' },
            { code: 'GBP', name: '英ポンド', flag: '🇬🇧' },
            { code: 'CNY', name: '人民元', flag: '🇨🇳' },
            { code: 'KRW', name: 'ウォン', flag: '🇰🇷' },
            { code: 'AUD', name: '豪ドル', flag: '🇦🇺' },
            { code: 'CAD', name: '加ドル', flag: '🇨🇦' },
            { code: 'CHF', name: 'スイスフラン', flag: '🇨🇭' }
        ];
        
        const rates = await fetchMultipleExchangeRates(currencies);
        
        if (rates && Object.keys(rates).length > 0) {
            let tableHTML = `
                <div class="rates-grid">
                    <div class="rates-header">
                        <div class="header-cell">通貨</div>
                        <div class="header-cell">100JPY</div>
                        <div class="header-cell">1,000JPY</div>
                        <div class="header-cell">10,000JPY</div>
                    </div>
            `;
            
            currencies.forEach(currency => {
                const rate = rates[currency.code];
                if (rate) {
                    const rate100 = rate * 100;
                    const rate1000 = rate * 1000;
                    const rate10000 = rate * 10000;
                    const symbol = getCurrencySymbol(currency.code);
                    
                    tableHTML += `
                        <div class="rate-row">
                            <div class="currency-cell">
                                <span class="currency-flag">${currency.flag}</span>
                                <div class="currency-info">
                                    <div class="currency-name">${currency.name}</div>
                                    <div class="currency-code">${currency.code}</div>
                                </div>
                            </div>
                            <div class="rate-cell">
                                ${symbol}${rate100.toFixed(rate100 < 1 ? 4 : 2)}
                            </div>
                            <div class="rate-cell">
                                ${symbol}${rate1000.toFixed(rate1000 < 1 ? 4 : 2)}
                            </div>
                            <div class="rate-cell highlight">
                                ${symbol}${rate10000.toFixed(rate10000 < 1 ? 2 : 0)}
                            </div>
                        </div>
                    `;
                }
            });
            
            tableHTML += '</div>';
            tableDiv.innerHTML = tableHTML;
            
            const currentTime = new Date().toLocaleString('ja-JP');
            lastUpdatedDiv.innerHTML = `<small>最終更新: ${currentTime}</small>`;
        } else {
            throw new Error('Failed to fetch exchange rates');
        }
    } catch (error) {
        console.error('Exchange rates dashboard error:', error);
        
        tableDiv.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <div class="error-message">
                    <strong>為替レートの取得に失敗しました</strong><br>
                    <small>インターネット接続を確認してから再度お試しください</small>
                </div>
            </div>
        `;
        
        lastUpdatedDiv.innerHTML = `<small style="color: #dc3545;">取得失敗</small>`;
    } finally {
        // Re-enable refresh button
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.querySelector('.refresh-icon').style.animation = '';
        }
    }
}

function getCurrencySymbol(currencyCode) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CNY': '¥',
        'KRW': '₩',
        'AUD': 'A$',
        'CAD': 'C$',
        'CHF': 'CHF'
    };
    return symbols[currencyCode] || currencyCode;
}

async function fetchMultipleExchangeRates(currencies) {
    const baseCurrency = 'jpy';
    const apis = [
        // Primary: Fawaz Ahmed's currency API
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency}.json`,
        
        // Fallback
        `https://latest.currency-api.pages.dev/v1/currencies/${baseCurrency}.json`
    ];
    
    for (const apiUrl of apis) {
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                continue; // Try next API
            }
            
            const data = await response.json();
            
            if (data[baseCurrency]) {
                const rates = {};
                currencies.forEach(currency => {
                    const rate = data[baseCurrency][currency.code.toLowerCase()];
                    if (rate) {
                        rates[currency.code] = rate;
                    }
                });
                return rates;
            }
        } catch (error) {
            console.warn(`API ${apiUrl} failed:`, error);
            continue; // Try next API
        }
    }
    
    return null; // All APIs failed
}

async function fetchRealTimeExchangeRate(fromCurrency, toCurrency) {
    const apiKey = 'free'; // Using free tier
    const baseUrl = 'https://v6.exchangerate-api.com/v6';
    
    // Try multiple free APIs in order
    const apis = [
        // Primary: Exchange Rate API (free tier)
        `${baseUrl}/${apiKey}/pair/${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}`,
        
        // Fallback: Fawaz Ahmed's currency API
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency}.json`,
        
        // Another fallback
        `https://latest.currency-api.pages.dev/v1/currencies/${fromCurrency}.json`
    ];
    
    for (const apiUrl of apis) {
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                continue; // Try next API
            }
            
            const data = await response.json();
            
            // Handle different API response formats
            if (data.conversion_rate) {
                // Exchange Rate API format
                return data.conversion_rate;
            } else if (data[fromCurrency] && data[fromCurrency][toCurrency]) {
                // Fawaz Ahmed API format
                return data[fromCurrency][toCurrency];
            }
        } catch (error) {
            console.warn(`API ${apiUrl} failed:`, error);
            continue; // Try next API
        }
    }
    
    return null; // All APIs failed
}

// Crypto functionality
let cryptoCurrentPeriod = 24;
let cryptoPrevRanks = {};
let cryptoCachedData = [];

const cryptoIds = [
    'bitcoin','ethereum','tether','ripple','binancecoin',
    'solana','usd-coin','tron','dogecoin','cardano'
];

const cryptoTerms = [
    { term: 'ブロックチェーン', definition: '分散型台帳技術。取引記録を複数のコンピューターで共有・管理する仕組み' },
    { term: 'マイニング', definition: '仮想通貨の取引を検証し、新しいブロックを生成する作業。報酬として仮想通貨を獲得' },
    { term: 'ウォレット', definition: '仮想通貨を保管・管理するためのデジタル財布' },
    { term: 'DeFi', definition: 'Decentralized Finance（分散型金融）の略。中央管理者なしで動作する金融サービス' },
    { term: 'スマートコントラクト', definition: '条件が満たされると自動的に実行されるプログラム化された契約' },
    { term: 'トークン', definition: 'ブロックチェーン上で発行されるデジタル資産の総称' },
    { term: 'ステーキング', definition: '仮想通貨を預けることでネットワークの維持に貢献し、報酬を得る仕組み' },
    { term: 'NFT', definition: 'Non-Fungible Token（非代替性トークン）。唯一性を持つデジタル資産' }
];

const cryptoQuizData = [
    {
        question: 'ビットコインを発明したとされる人物の名前は？',
        options: ['サトシ・ナカモト', 'ヴィタリック・ブテリン', 'チャーリー・リー', 'ライアン・X・チャールズ'],
        correct: 0
    },
    {
        question: 'ブロックチェーンの最も重要な特徴は何ですか？',
        options: ['高速処理', '分散管理', '低コスト', '匿名性'],
        correct: 1
    },
    {
        question: 'イーサリアムの主な特徴は何ですか？',
        options: ['プライバシー重視', 'スマートコントラクト', '高速決済', '省エネルギー'],
        correct: 1
    },
    {
        question: 'DeFiとは何の略ですか？',
        options: ['Digital Finance', 'Decentralized Finance', 'Distributed Finance', 'Direct Finance'],
        correct: 1
    },
    {
        question: 'NFTの正式名称は？',
        options: ['New Financial Token', 'Non-Fungible Token', 'Network Function Token', 'Next Generation Token'],
        correct: 1
    }
];

async function loadCryptoTable() {
    const endpoint = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=1h,24h`;
    
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        
        data.sort((a, b) => b.market_cap - a.market_cap);
        
        const tbody = document.getElementById('crypto-table-body');
        tbody.innerHTML = '';
        
        const updatedText = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
        const lastUpdatedEl = document.getElementById('crypto-last-updated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = `最終更新: ${updatedText}`;
        }
        
        const newRanks = Object.fromEntries(data.map((c, i) => [c.id, i + 1]));
        cryptoPrevRanks = newRanks;
        cryptoCachedData = data;
        
        renderCryptoRows();
    } catch (error) {
        console.error('CoinGecko API Error:', error);
        const tbody = document.getElementById('crypto-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6">データ取得に失敗しました</td></tr>';
        }
    }
}

function renderCryptoRows() {
    const tbody = document.getElementById('crypto-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    cryptoCachedData.forEach((coin, idx) => {
        const row = document.createElement('tr');
        const pct = getCryptoPercentChange(coin);
        
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>
                <img src="${coin.image}" alt="${coin.symbol}" class="crypto-icon">
                ${coin.name}
            </td>
            <td>${coin.symbol.toUpperCase()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td>$${coin.current_price.toFixed(2)}</td>
            <td>
                <span class="change-badge ${pct >= 0 ? 'up' : 'down'}">
                    ${pct.toFixed(2)}%
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getCryptoPercentChange(coin) {
    if (cryptoCurrentPeriod === 1) {
        return coin.price_change_percentage_1h_in_currency || coin.price_change_percentage_1h || 0;
    }
    if (cryptoCurrentPeriod === 24) {
        return coin.price_change_percentage_24h_in_currency || coin.price_change_percentage_24h || 0;
    }
    
    // 4h calculation
    const prices = coin.sparkline_in_7d?.price;
    if (Array.isArray(prices) && prices.length > 5) {
        const latest = prices[prices.length - 1];
        const earlier = prices[prices.length - 5];
        return (latest - earlier) / earlier * 100;
    }
    return 0;
}

function initCryptoModal() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab pane
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId + '-tab').classList.add('active');
            
            // Load content if needed
            if (tabId === 'market') {
                loadCryptoTable();
            } else if (tabId === 'glossary') {
                loadCryptoGlossary();
            }
        });
    });
    
    // Period selection
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            cryptoCurrentPeriod = parseInt(this.getAttribute('data-period'));
            
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const header = document.getElementById('period-header');
            if (header) {
                header.textContent = `${cryptoCurrentPeriod}${cryptoCurrentPeriod === 1 ? '時間' : cryptoCurrentPeriod === 4 ? '時間' : '時間'}変動`;
            }
            
            renderCryptoRows();
        });
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-crypto');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadCryptoTable);
    }
    
    // Quiz functionality
    const startQuizBtn = document.getElementById('start-crypto-quiz');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startCryptoQuiz);
    }
}

function loadCryptoGlossary() {
    const glossaryGrid = document.getElementById('crypto-glossary-grid');
    if (!glossaryGrid) return;
    
    glossaryGrid.innerHTML = '';
    
    cryptoTerms.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glossary-card';
        card.innerHTML = `
            <div class="glossary-word">${item.term}</div>
            <div class="glossary-meaning">${item.definition}</div>
        `;
        glossaryGrid.appendChild(card);
    });
}

let currentCryptoQuiz = 0;
let cryptoQuizScore = 0;

function startCryptoQuiz() {
    currentCryptoQuiz = 0;
    cryptoQuizScore = 0;
    
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-question-container').style.display = 'block';
    
    showCryptoQuizQuestion();
}

function showCryptoQuizQuestion() {
    if (currentCryptoQuiz >= cryptoQuizData.length) {
        showCryptoQuizResult();
        return;
    }
    
    const question = cryptoQuizData[currentCryptoQuiz];
    const questionEl = document.getElementById('crypto-quiz-question');
    const optionsEl = document.getElementById('crypto-quiz-options');
    
    if (questionEl) {
        questionEl.textContent = `問題 ${currentCryptoQuiz + 1}: ${question.question}`;
    }
    
    if (optionsEl) {
        optionsEl.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'quiz-option';
            optionEl.textContent = option;
            optionEl.addEventListener('click', () => handleCryptoQuizAnswer(index, question.correct));
            optionsEl.appendChild(optionEl);
        });
    }
}

function handleCryptoQuizAnswer(selected, correct) {
    const options = document.querySelectorAll('.quiz-option');
    
    options.forEach((option, index) => {
        if (index === correct) {
            option.classList.add('correct');
        } else if (index === selected && selected !== correct) {
            option.classList.add('incorrect');
        }
        option.style.pointerEvents = 'none';
    });
    
    if (selected === correct) {
        cryptoQuizScore++;
    }
    
    setTimeout(() => {
        currentCryptoQuiz++;
        showCryptoQuizQuestion();
    }, 1500);
}

function showCryptoQuizResult() {
    const percentage = Math.round((cryptoQuizScore / cryptoQuizData.length) * 100);
    const scoreEl = document.getElementById('crypto-quiz-score');
    
    if (scoreEl) {
        scoreEl.innerHTML = `
            クイズ完了！<br>
            正解数: ${cryptoQuizScore}/${cryptoQuizData.length} (${percentage}%)<br>
            <button class="btn btn-secondary" onclick="restartCryptoQuiz()" style="margin-top: 1rem;">もう一度</button>
        `;
    }
    
    document.getElementById('crypto-quiz-question').textContent = '';
    document.getElementById('crypto-quiz-options').innerHTML = '';
}

function restartCryptoQuiz() {
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-question-container').style.display = 'none';
    document.getElementById('crypto-quiz-score').innerHTML = '';
}

// Initialize exchange rates dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load exchange rates dashboard when calculator section is visible
    const calculatorSection = document.getElementById('calculator');
    if (calculatorSection && !calculatorSection.classList.contains('content-hidden')) {
        setTimeout(() => {
            loadExchangeRatesDashboard();
        }, 1000);
    }
    
    // Initialize crypto modal functionality
    initCryptoModal();
});

// Function to scroll to calculator section (便利ツール)
function scrollToCalculatorSection() {
    const calculatorSection = document.getElementById('calculator');
    if (calculatorSection) {
        // Show the calculator section if hidden
        const currencyContent = document.querySelectorAll('.currency-content');
        const taxContent = document.querySelectorAll('.tax-content');
        const investmentContent = document.querySelectorAll('.investment-content');
        const glossaryContent = document.querySelectorAll('.glossary-content');
        const heroSection = document.querySelector('.hero');
        const quizSection = document.getElementById('quiz');
        
        [...currencyContent, ...taxContent, ...investmentContent, ...glossaryContent].forEach(section => {
            section.classList.add('content-hidden');
        });
        
        if (heroSection) heroSection.classList.add('content-hidden');
        if (quizSection) quizSection.classList.add('content-hidden');
        
        calculatorSection.classList.remove('content-hidden');
        
        // Update active navigation link
        document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
        });
        
        const calculatorNavLink = document.querySelector('a[href="#calculator"]');
        if (calculatorNavLink) {
            calculatorNavLink.classList.add('active');
        }
        
        // Scroll to the section
        scrollToSection(calculatorSection);
        
        // Find and highlight the exchange rate card, then open modal
        setTimeout(() => {
            const exchangeRateCards = document.querySelectorAll('.calculator-card');
            let exchangeRateCard = null;
            
            // Find the exchange rate card by looking for the specific h3 text
            exchangeRateCards.forEach(card => {
                const h3 = card.querySelector('h3');
                if (h3 && h3.textContent.includes('リアルタイム為替レート')) {
                    exchangeRateCard = card;
                }
            });
            
            if (exchangeRateCard) {
                // Highlight the card
                exchangeRateCard.style.border = '3px solid #28a745';
                exchangeRateCard.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.3)';
                exchangeRateCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Open the exchange rates modal after highlighting
                setTimeout(() => {
                    openModal('exchange-rates-modal');
                    
                    // Remove highlight after modal opens
                    setTimeout(() => {
                        exchangeRateCard.style.border = '';
                        exchangeRateCard.style.boxShadow = '';
                        exchangeRateCard.style.transition = 'all 0.5s ease';
                    }, 1000);
                }, 1500);
            }
        }, 500);
    }
}