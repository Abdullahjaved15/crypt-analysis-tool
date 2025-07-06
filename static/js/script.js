// Global variables
let currentCipher = 'caesar';
let monoalphabeticKey = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showCipherPanel('caesar');
    enhanceLoadingSpinner();
});

// Enhance loading spinner with better structure
function enhanceLoadingSpinner() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv && !loadingDiv.querySelector('.loading-text')) {
        loadingDiv.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">Processing...</div>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cipher = this.dataset.cipher;
            switchTab(cipher);
        });
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', function() {
        closeModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('frequency-modal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Operation change handlers
    setupOperationHandlers();
}

// Setup operation change handlers for dynamic UI
function setupOperationHandlers() {
    // Caesar operation change
    document.getElementById('caesar-operation').addEventListener('change', function() {
        const shiftGroup = document.getElementById('caesar-shift-group');
        if (this.value === 'brute-force') {
            shiftGroup.style.display = 'none';
        } else {
            shiftGroup.style.display = 'block';
        }
    });

    // Vigenère operation change
    document.getElementById('vigenere-operation').addEventListener('change', function() {
        const keyGroup = document.getElementById('vigenere-key-group');
        if (this.value === 'analyze') {
            keyGroup.style.display = 'none';
        } else {
            keyGroup.style.display = 'block';
        }
    });

    // Affine operation change
    document.getElementById('affine-operation').addEventListener('change', function() {
        const aGroup = document.getElementById('affine-a-group');
        const bGroup = document.getElementById('affine-b-group');
        if (this.value === 'brute-force') {
            aGroup.style.display = 'none';
            bGroup.style.display = 'none';
        } else {
            aGroup.style.display = 'block';
            bGroup.style.display = 'block';
        }
    });

    // Monoalphabetic operation change
    document.getElementById('mono-operation').addEventListener('change', function() {
        const keyGroup = document.getElementById('mono-key-group');
        if (this.value === 'analyze') {
            keyGroup.style.display = 'none';
        } else {
            keyGroup.style.display = 'block';
        }
    });
}

// Tab switching with enhanced animations
function switchTab(cipher) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-cipher="${cipher}"]`).classList.add('active');

    // Show cipher panel
    showCipherPanel(cipher);
    currentCipher = cipher;
}

// Show cipher panel with enhanced transitions
function showCipherPanel(cipher) {
    // Hide all panels
    document.querySelectorAll('.cipher-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Show selected panel with delay for smooth transition
    setTimeout(() => {
        document.getElementById(cipher).classList.add('active');
    }, 100);
}

// Enhanced utility functions
function showLoading(message = 'Processing...') {
    const loadingDiv = document.getElementById('loading');
    const loadingText = loadingDiv.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = message;
    }
    loadingDiv.classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

function showError(message) {
    alert('Error: ' + message);
}

function showSuccess(message) {
    // Create enhanced notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
        ${message}
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);
        z-index: 10001;
        max-width: 350px;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        border: 2px solid #16a34a;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

// Enhanced API request helper
async function makeRequest(url, data, loadingMessage = 'Processing...') {
    try {
        showLoading(loadingMessage);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        hideLoading();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        return result;
    } catch (error) {
        hideLoading();
        throw error;
    }
}

// Caesar Cipher Functions
async function processCaesar() {
    const operation = document.getElementById('caesar-operation').value;
    const input = document.getElementById('caesar-input').value.trim();
    const shift = parseInt(document.getElementById('caesar-shift').value);
    
    if (!input) {
        showError('Please enter some text');
        return;
    }

    try {
        let result;
        
        if (operation === 'encrypt') {
            result = await makeRequest('/api/caesar/encrypt', {
                plaintext: input,
                shift: shift
            }, 'Encrypting text...');
            document.getElementById('caesar-output').value = result.result;
            showSuccess('Text encrypted successfully!');
            
        } else if (operation === 'decrypt') {
            result = await makeRequest('/api/caesar/decrypt', {
                ciphertext: input,
                shift: shift
            }, 'Decrypting text...');
            document.getElementById('caesar-output').value = result.result;
            showSuccess('Text decrypted successfully!');
            
        } else if (operation === 'brute-force') {
            result = await makeRequest('/api/caesar/brute-force', {
                ciphertext: input
            }, 'Performing brute force attack...');
            displayBruteForceResults('caesar-results', result.results);
            showSuccess('Brute force attack completed!');
        }
        
    } catch (error) {
        showError(error.message);
    }
}

function clearCaesar() {
    document.getElementById('caesar-input').value = '';
    document.getElementById('caesar-output').value = '';
    document.getElementById('caesar-results').innerHTML = '';
    document.getElementById('caesar-results').classList.remove('active');
}

// Vigenère Cipher Functions
async function processVigenere() {
    const operation = document.getElementById('vigenere-operation').value;
    const input = document.getElementById('vigenere-input').value.trim();
    const key = document.getElementById('vigenere-key').value.trim();
    
    if (!input) {
        showError('Please enter some text');
        return;
    }

    if ((operation === 'encrypt' || operation === 'decrypt') && !key) {
        showError('Please enter a key');
        return;
    }

    try {
        let result;
        
        if (operation === 'encrypt') {
            result = await makeRequest('/api/vigenere/encrypt', {
                plaintext: input,
                key: key
            }, 'Encrypting with Vigenère cipher...');
            document.getElementById('vigenere-output').value = result.result;
            showSuccess('Text encrypted successfully!');
            
        } else if (operation === 'decrypt') {
            result = await makeRequest('/api/vigenere/decrypt', {
                ciphertext: input,
                key: key
            }, 'Decrypting with Vigenère cipher...');
            document.getElementById('vigenere-output').value = result.result;
            showSuccess('Text decrypted successfully!');
            
        } else if (operation === 'analyze') {
            result = await makeRequest('/api/vigenere/analyze', {
                ciphertext: input
            }, 'Analyzing ciphertext...');
            document.getElementById('vigenere-output').value = result.decrypted;
            displayAnalysisResult('vigenere-results', `Recovered Key: ${result.key}`);
            showSuccess('Cryptanalysis completed!');
        }
        
    } catch (error) {
        showError(error.message);
    }
}

function clearVigenere() {
    document.getElementById('vigenere-input').value = '';
    document.getElementById('vigenere-output').value = '';
    document.getElementById('vigenere-key').value = '';
    document.getElementById('vigenere-results').innerHTML = '';
    document.getElementById('vigenere-results').classList.remove('active');
}

// Affine Cipher Functions
async function processAffine() {
    const operation = document.getElementById('affine-operation').value;
    const input = document.getElementById('affine-input').value.trim();
    const a = parseInt(document.getElementById('affine-a').value);
    const b = parseInt(document.getElementById('affine-b').value);
    
    if (!input) {
        showError('Please enter some text');
        return;
    }

    try {
        let result;
        
        if (operation === 'encrypt') {
            result = await makeRequest('/api/affine/encrypt', {
                plaintext: input,
                a: a,
                b: b
            }, 'Encrypting with Affine cipher...');
            document.getElementById('affine-output').value = result.result;
            showSuccess('Text encrypted successfully!');
            
        } else if (operation === 'decrypt') {
            result = await makeRequest('/api/affine/decrypt', {
                ciphertext: input,
                a: a,
                b: b
            }, 'Decrypting with Affine cipher...');
            document.getElementById('affine-output').value = result.result;
            showSuccess('Text decrypted successfully!');
            
        } else if (operation === 'brute-force') {
            result = await makeRequest('/api/affine/brute-force', {
                ciphertext: input
            }, 'Performing comprehensive brute force attack...');
            displayAffineBruteForceResults('affine-results', result.results);
            showSuccess('Brute force attack completed!');
        }
        
    } catch (error) {
        showError(error.message);
    }
}

function clearAffine() {
    document.getElementById('affine-input').value = '';
    document.getElementById('affine-output').value = '';
    document.getElementById('affine-results').innerHTML = '';
    document.getElementById('affine-results').classList.remove('active');
}

// Playfair Cipher Functions
async function processPlayfair() {
    const operation = document.getElementById('playfair-operation').value;
    const input = document.getElementById('playfair-input').value.trim();
    const key = document.getElementById('playfair-key').value.trim();
    
    if (!input) {
        showError('Please enter some text');
        return;
    }

    if (!key) {
        showError('Please enter a key');
        return;
    }

    try {
        let result;
        
        if (operation === 'encrypt') {
            result = await makeRequest('/api/playfair/encrypt', {
                plaintext: input,
                key: key
            }, 'Encrypting with Playfair cipher...');
            document.getElementById('playfair-output').value = result.result;
            displayPlayfairSquare(result.square);
            showSuccess('Text encrypted successfully!');
            
        } else if (operation === 'decrypt') {
            result = await makeRequest('/api/playfair/decrypt', {
                ciphertext: input,
                key: key
            }, 'Decrypting with Playfair cipher...');
            document.getElementById('playfair-output').value = result.result;
            displayPlayfairSquare(result.square);
            showSuccess('Text decrypted successfully!');
        }
        
    } catch (error) {
        showError(error.message);
    }
}

function clearPlayfair() {
    document.getElementById('playfair-input').value = '';
    document.getElementById('playfair-output').value = '';
    document.getElementById('playfair-key').value = '';
    document.getElementById('playfair-square').innerHTML = '';
    document.getElementById('playfair-square').classList.remove('active');
    document.getElementById('playfair-results').innerHTML = '';
    document.getElementById('playfair-results').classList.remove('active');
}

// Monoalphabetic Cipher Functions
async function processMonoalphabetic() {
    const operation = document.getElementById('mono-operation').value;
    const input = document.getElementById('mono-input').value.trim();
    const customKey = document.getElementById('mono-key').value.trim();
    
    try {
        let result;
        
        if (operation === 'generate') {
            result = await makeRequest('/api/monoalphabetic/generate-key', {}, 'Generating random key...');
            monoalphabeticKey = result.key;
            displayMonoalphabeticKey(result.key);
            // Populate the custom key field with the generated key
            const keyString = Object.values(result.key).join('');
            document.getElementById('mono-key').value = keyString;
            showSuccess('Random substitution key generated successfully!');
            
        } else if (operation === 'encrypt') {
            // Check if we should use custom key or generated key
            let keyToUse = monoalphabeticKey;
            
            if (customKey) {
                // Validate and use custom key
                const keyValidation = await makeRequest('/api/monoalphabetic/validate-key', {
                    key: customKey
                }, 'Validating custom key...');
                keyToUse = keyValidation.key;
                monoalphabeticKey = keyToUse; // Store for future use
                displayMonoalphabeticKey(keyToUse);
            } else if (!monoalphabeticKey) {
                showError('Please either enter a custom key or generate a random key first.');
                return;
            }
            
            if (!input) {
                showError('Please enter some text to encrypt.');
                return;
            }
            
            result = await makeRequest('/api/monoalphabetic/encrypt', {
                plaintext: input,
                key: keyToUse
            }, 'Encrypting with substitution cipher...');
            document.getElementById('mono-output').value = result.result;
            showSuccess('Text encrypted successfully!');
            
        } else if (operation === 'decrypt') {
            // Check if we should use custom key or generated key
            let keyToUse = monoalphabeticKey;
            
            if (customKey) {
                // Validate and use custom key
                const keyValidation = await makeRequest('/api/monoalphabetic/validate-key', {
                    key: customKey
                }, 'Validating custom key...');
                keyToUse = keyValidation.key;
                monoalphabeticKey = keyToUse; // Store for future use
                displayMonoalphabeticKey(keyToUse);
            } else if (!monoalphabeticKey) {
                showError('Please either enter a custom key or generate a random key first.');
                return;
            }
            
            if (!input) {
                showError('Please enter some ciphertext to decrypt.');
                return;
            }
            
            result = await makeRequest('/api/monoalphabetic/decrypt', {
                ciphertext: input,
                key: keyToUse
            }, 'Decrypting with substitution cipher...');
            document.getElementById('mono-output').value = result.result;
            showSuccess('Text decrypted successfully!');
            
        } else if (operation === 'analyze') {
            if (!input) {
                showError('Please enter some ciphertext to analyze.');
                return;
            }
            if (input.length < 20) {
                showError('For better frequency analysis results, please enter at least 20 characters of ciphertext.');
                return;
            }
            result = await makeRequest('/api/monoalphabetic/analyze', {
                ciphertext: input
            }, 'Performing frequency analysis...');
            document.getElementById('mono-output').value = result.decrypted;
            displayMonoalphabeticMapping(result.mapping);
            showSuccess('Frequency analysis completed!');
        }
        
    } catch (error) {
        showError(error.message);
    }
}

function clearMonoalphabetic() {
    document.getElementById('mono-input').value = '';
    document.getElementById('mono-output').value = '';
    document.getElementById('mono-key').value = '';
    document.getElementById('mono-key-display').innerHTML = '';
    document.getElementById('mono-key-display').classList.remove('active');
    document.getElementById('mono-results').innerHTML = '';
    document.getElementById('mono-results').classList.remove('active');
    monoalphabeticKey = null;
}

// Rail Fence Cipher Functions
async function processRailFence() {
    const operation = document.getElementById('railfence-operation').value;
    const input = document.getElementById('railfence-input').value.trim();
    const rails = parseInt(document.getElementById('railfence-rails').value);
    
    if (!input) {
        showError('Please enter some text');
        return;
    }

    try {
        let result;
        
        if (operation === 'encrypt') {
            result = await makeRequest('/api/railfence/encrypt', {
                plaintext: input,
                rails: rails
            }, 'Encrypting with Rail Fence cipher...');
            document.getElementById('railfence-output').value = result.result;
            showSuccess('Text encrypted successfully!');
            
        } else if (operation === 'decrypt') {
            result = await makeRequest('/api/railfence/decrypt', {
                ciphertext: input,
                rails: rails
            }, 'Decrypting with Rail Fence cipher...');
            document.getElementById('railfence-output').value = result.result;
            showSuccess('Text decrypted successfully!');
        }
        
    } catch (error) {
        showError(error.message);
    }
}

function clearRailFence() {
    document.getElementById('railfence-input').value = '';
    document.getElementById('railfence-output').value = '';
    document.getElementById('railfence-results').innerHTML = '';
    document.getElementById('railfence-results').classList.remove('active');
}

// Frequency Analysis Function
async function analyzeFrequency(inputId) {
    const input = document.getElementById(inputId).value.trim();
    
    if (!input) {
        showError('Please enter some text to analyze');
        return;
    }

    try {
        const result = await makeRequest('/api/frequency-analysis', {
            text: input
        }, 'Generating frequency analysis...');
        
        displayFrequencyAnalysis(result.frequencies, result.chart);
        showSuccess('Frequency analysis generated!');
        
    } catch (error) {
        showError(error.message);
    }
}

// Enhanced Display Functions
function displayBruteForceResults(containerId, results) {
    const container = document.getElementById(containerId);
    
    let html = '<h3><i class="fas fa-search" style="margin-right: 10px; color: var(--primary-blue);"></i>Brute Force Results (Top 10)</h3>';
    html += '<div style="margin-bottom: 20px;">';
    html += '<p style="color: var(--gray-600); font-size: 0.95rem;">Results sorted by English frequency score (higher scores indicate better matches)</p>';
    html += '</div>';
    html += '<table class="results-table">';
    html += '<thead><tr><th>Rank</th><th>Shift</th><th>Score</th><th>Decrypted Text (First 50 chars)</th></tr></thead>';
    html += '<tbody>';
    
    results.slice(0, 10).forEach((result, index) => {
        const preview = result.decrypted.substring(0, 50) + (result.decrypted.length > 50 ? '...' : '');
        const rank = index + 1;
        const rowClass = rank <= 3 ? 'style="background: rgba(16, 185, 129, 0.1);"' : '';
        
        html += `<tr onclick="selectBruteForceResult('${containerId}', '${result.decrypted}')" ${rowClass}>`;
        html += `<td><strong>${rank}</strong></td>`;
        html += `<td><strong>${result.shift}</strong></td>`;
        html += `<td>${result.score.toFixed(4)}</td>`;
        html += `<td style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;">${preview}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    html += '<p style="margin-top: 15px; font-style: italic; color: var(--gray-600);"><em>💡 Click on any row to copy the result to output. Top 3 results are highlighted.</em></p>';
    
    container.innerHTML = html;
    container.classList.add('active');
}

function displayAffineBruteForceResults(containerId, results) {
    const container = document.getElementById(containerId);
    
    let html = `<h3><i class="fas fa-calculator" style="margin-right: 10px; color: var(--primary-blue);"></i>Affine Brute Force Results (All ${results.length} Combinations)</h3>`;
    html += '<div style="margin-bottom: 20px;">';
    html += '<p style="color: var(--gray-600); font-size: 0.95rem;">Showing all possible combinations sorted by English frequency score (higher is better)</p>';
    html += '</div>';
    
    // Create a scrollable container
    html += '<div style="max-height: 500px; overflow-y: auto; border: 1px solid var(--gray-200); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm);">';
    html += '<table class="results-table">';
    html += '<thead style="position: sticky; top: 0; z-index: 10;"><tr><th>Rank</th><th>Key (a,b)</th><th>Score</th><th>Decrypted Text (First 60 chars)</th></tr></thead>';
    html += '<tbody>';
    
    results.forEach((result, index) => {
        const preview = result.decrypted.substring(0, 60) + (result.decrypted.length > 60 ? '...' : '');
        const rank = index + 1;
        const rowClass = rank <= 5 ? 'style="background: rgba(16, 185, 129, 0.1);"' : '';
        
        html += `<tr onclick="selectBruteForceResult('${containerId}', '${result.decrypted}')" ${rowClass}>`;
        html += `<td><strong>${rank}</strong></td>`;
        html += `<td><strong>(${result.a}, ${result.b})</strong></td>`;
        html += `<td>${result.score.toFixed(6)}</td>`;
        html += `<td style="font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;">${preview}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    html += '</div>';
    
    // Add enhanced summary statistics
    html += '<div style="margin-top: 20px; padding: 20px; background: var(--gray-50); border-radius: var(--radius-xl); border: 1px solid var(--gray-200);">';
    html += '<h4 style="color: var(--primary-blue); margin-bottom: 15px;"><i class="fas fa-chart-bar" style="margin-right: 8px;"></i>Statistics</h4>';
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">';
    html += `<div><strong>Total Combinations:</strong> ${results.length}</div>`;
    html += `<div><strong>Best Score:</strong> ${results[0].score.toFixed(6)} (Key: ${results[0].a}, ${results[0].b})</div>`;
    html += `<div><strong>Worst Score:</strong> ${results[results.length-1].score.toFixed(6)}</div>`;
    html += `<div><strong>Average Score:</strong> ${(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(6)}</div>`;
    html += '</div>';
    html += '</div>';
    
    html += '<p style="margin-top: 20px; font-style: italic; color: var(--gray-600);"><em>💡 Click on any row to copy the result to output. Top 5 results are highlighted in green.</em></p>';
    
    container.innerHTML = html;
    container.classList.add('active');
}

function selectBruteForceResult(containerId, result) {
    const cipher = containerId.split('-')[0];
    document.getElementById(`${cipher}-output`).value = result;
    showSuccess('Result copied to output!');
}

function displayAnalysisResult(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<h3><i class="fas fa-key" style="margin-right: 10px; color: var(--success);"></i>Analysis Result</h3><p class="text-success" style="font-size: 1.1rem; font-weight: 500;">${message}</p>`;
    container.classList.add('active');
}

function displayPlayfairSquare(square) {
    const container = document.getElementById('playfair-square');
    
    let html = '<h3><i class="fas fa-th" style="margin-right: 10px; color: var(--primary-blue);"></i>Playfair 5×5 Grid</h3>';
    html += '<table>';
    
    for (let row of square) {
        html += '<tr>';
        for (let cell of row) {
            html += `<td>${cell}</td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    container.innerHTML = html;
    container.classList.add('active');
}

function displayMonoalphabeticKey(key) {
    const container = document.getElementById('mono-key-display');
    
    let html = '<h3><i class="fas fa-key" style="margin-right: 10px; color: var(--primary-blue);"></i>Generated Substitution Key</h3>';
    html += '<div class="key-mapping">';
    
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let char of alphabet) {
        html += `<div class="key-pair">${char} → ${key[char]}</div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
    container.classList.add('active');
}

function displayMonoalphabeticMapping(mapping) {
    const container = document.getElementById('mono-results');
    
    let html = '<h3><i class="fas fa-chart-line" style="margin-right: 10px; color: var(--primary-blue);"></i>Frequency Analysis Results</h3>';
    html += '<p style="color: var(--gray-600); margin-bottom: 20px; font-size: 1rem;">Mapping based on English letter frequencies (cipher → probable plaintext):</p>';
    html += '<div class="key-mapping">';
    
    // Sort by cipher letter for better readability
    const sortedMapping = Object.entries(mapping).sort(([a], [b]) => a.localeCompare(b));
    
    for (let [cipher, plain] of sortedMapping) {
        html += `<div class="key-pair">${cipher} → ${plain}</div>`;
    }
    
    html += '</div>';
    html += '<div style="margin-top: 20px; padding: 15px; background: var(--warning-light); border-radius: var(--radius-lg); border-left: 4px solid var(--warning);">';
    html += '<p style="color: var(--gray-700); font-size: 0.95rem; margin: 0;"><strong>⚠️ Note:</strong> This is an automated guess based on letter frequencies. For short texts or unusual letter distributions, the mapping may not be accurate. Manual adjustment may be required for better results.</p>';
    html += '</div>';
    
    container.innerHTML = html;
    container.classList.add('active');
}

function displayFrequencyAnalysis(frequencies, chartImage) {
    // Display chart
    document.getElementById('frequency-chart').src = 'data:image/png;base64,' + chartImage;
    
    // Display frequency data table
    const container = document.getElementById('frequency-data');
    
    let html = '<h4><i class="fas fa-table" style="margin-right: 8px; color: var(--primary-blue);"></i>Letter Frequencies</h4>';
    html += '<table>';
    html += '<thead><tr><th>Letter</th><th>Frequency</th><th>Percentage</th><th>Count</th></tr></thead>';
    html += '<tbody>';
    
    // Sort by frequency (descending)
    const sortedFreqs = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
    
    sortedFreqs.forEach(([letter, freq]) => {
        html += '<tr>';
        html += `<td><strong>${letter}</strong></td>`;
        html += `<td>${freq.toFixed(6)}</td>`;
        html += `<td><strong>${(freq * 100).toFixed(2)}%</strong></td>`;
        html += `<td>${Math.round(freq * 1000)}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Show modal
    document.getElementById('frequency-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('frequency-modal').classList.remove('active');
}

// Sample texts for testing
const sampleTexts = {
    caesar: "HELLO WORLD THIS IS A SAMPLE TEXT FOR TESTING THE CAESAR CIPHER WITH VARIOUS LETTERS AND PATTERNS",
    vigenere: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND DEMONSTRATES VIGENERE CIPHER ENCRYPTION",
    affine: "MATHEMATICS IS THE LANGUAGE OF THE UNIVERSE AND CRYPTOGRAPHY IS ITS SECRET DIALECT",
    playfair: "MEET ME AT MIDNIGHT NEAR THE OLD BRIDGE WHERE THE RIVER FLOWS QUIETLY",
    monoalphabetic: "CRYPTOGRAPHY IS THE SCIENCE OF CODES AND CIPHERS USED TO PROTECT SECRET INFORMATION FROM UNAUTHORIZED ACCESS AND MAINTAIN COMMUNICATION SECURITY",
    railfence: "WE ARE DISCOVERED FLEE AT ONCE BEFORE THE ENEMY FORCES ARRIVE AT OUR LOCATION"
};

// Add sample text function
function addSampleText(cipher) {
    const inputId = `${cipher}-input`;
    if (sampleTexts[cipher]) {
        document.getElementById(inputId).value = sampleTexts[cipher];
        showSuccess('Sample text added!');
    }
} 