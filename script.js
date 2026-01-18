const KEYWORDS = [
    'ALIAS', 'BLEND', 'BOOL', 'BOUNCE', 'CAP', 'CASE', 'CORE', 'DECI', 'DOUBLE',
    'DROP', 'ELSE', 'EMOJI', 'EMPTY', 'ENUM', 'FAM', 'FIXED', 'FOR', 'GRAB',
    'IF', 'IMPORT', 'LENGTH', 'LETT', 'MAXI', 'MINI', 'MATIC', 'NEXT', 'NOCAP',
    'NORM', 'NUMBS', 'OUT', 'SHADY', 'SPILL', 'STAY', 'STRUCT', 'SWIM', 'SWITCH',
    'TAG', 'TEXT', 'VIBE', 'WHILE', 'ZAVED'
];

const FUNCTIONS = ['avg', 'ascending', 'descending', 'max', 'min', 'findString'];

function updateLineNumbers() {
    const editor = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    const lines = editor.value.split('\n').length;
    lineNumbers.textContent = Array.from({length: lines}, (_, i) => i + 1).join('\n');
}

function syncScroll() {
    const editor = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    lineNumbers.scrollTop = editor.scrollTop;
}

function copyCode() {
    const editor = document.getElementById('codeEditor');
    editor.select();
    document.execCommand('copy');
}

function clearResults() {
    const resultsDiv = document.getElementById('analyzerResults');
    resultsDiv.innerHTML = `
        <div class="placeholder-text">
            System is ready to analyze!<br>
            Please enter a code to analyze.
        </div>
    `;
}

function analyzeCode() {
    const code = document.getElementById('codeEditor').value.trim();
    
    if (!code) {
        showModal('error', 'NO CODE ENTERED', 'Please enter Z-LANG code to analyze.');
        return;
    }

    const errors = performSyntaxAnalysis(code);
    displayResults(errors);
    
    if (errors.length > 0) {
        showModal('error', 'SYNTAX ERROR DETECTED!', 'There is an error in the code.');
    } else {
        showModal('success', 'SYNTAX SUCCESSFULLY ANALYZED!', 'No syntax errors found in the code.');
    }
}

function performSyntaxAnalysis(code) {
    const lines = code.split('\n');
    const errors = [];

    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('//')) return;

        // Check for missing semicolon
        if (!trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}')) {
            errors.push({
                line: lineNum,
                description: 'Missing semicolon at end of statement'
            });
        }

        // Check for invalid variable declaration
        if (trimmedLine.startsWith('LETT') || trimmedLine.startsWith('Lett')) {
            const parts = trimmedLine.split(/\s+/);
            if (parts[0] !== 'LETT') {
                errors.push({
                    line: lineNum,
                    description: 'Invalid keyword - use LETT (uppercase)'
                });
            }
            if (parts.length < 2) {
                errors.push({
                    line: lineNum,
                    description: 'Missing variable name after LETT'
                });
            }
        }

        // Check for unmatched parentheses
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            errors.push({
                line: lineNum,
                description: 'Unmatched parentheses'
            });
        }

        // Check for unmatched braces
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push({
                line: lineNum,
                description: 'Unmatched braces'
            });
        }

        // Check for invalid assignment
        if (line.includes('=') && !line.includes('==')) {
            const beforeEquals = line.split('=')[0].trim();
            if (!beforeEquals || beforeEquals.split(/\s+/).length > 2) {
                errors.push({
                    line: lineNum,
                    description: 'Invalid assignment syntax'
                });
            }
        }
    });

    return errors;
}

function displayResults(errors) {
    const resultsDiv = document.getElementById('analyzerResults');
    
    if (errors.length === 0) {
        resultsDiv.innerHTML = `
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Line</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="2" style="text-align: center; padding: 40px; color: #00d964;">
                            <svg style="width: 24px; height: 24px; display: inline-block; vertical-align: middle; margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            No syntax errors detected
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    } else {
        let tableHTML = `
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Line</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        errors.forEach(error => {
            tableHTML += `
                <tr class="error-row">
                    <td class="line-number-cell">Line ${error.line}</td>
                    <td class="error-text">${error.description}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        resultsDiv.innerHTML = tableHTML;
    }
}

function showModal(type, title, message) {
    const modal = document.getElementById('modal');
    const icon = document.getElementById('modalIcon');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');

    if (type === 'error') {
        icon.className = 'modal-icon error';
        icon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    } else {
        icon.className = 'modal-icon success';
        icon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
    }

    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Initialize line numbers
updateLineNumbers();