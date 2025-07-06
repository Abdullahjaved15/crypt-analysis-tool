from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
import json
import math
import random
import string
from collections import Counter

app = Flask(__name__)
CORS(app)

# English letter frequencies for comparison
ENGLISH_FREQ = {
    'A': 0.08167, 'B': 0.01492, 'C': 0.02782, 'D': 0.04253, 'E': 0.12702,
    'F': 0.02228, 'G': 0.02015, 'H': 0.06094, 'I': 0.06966, 'J': 0.00153,
    'K': 0.00772, 'L': 0.04025, 'M': 0.02406, 'N': 0.06749, 'O': 0.07507,
    'P': 0.01929, 'Q': 0.00095, 'R': 0.05987, 'S': 0.06327, 'T': 0.09056,
    'U': 0.02758, 'V': 0.00978, 'W': 0.02360, 'X': 0.00150, 'Y': 0.01974,
    'Z': 0.00074
}

# Common English digraph frequencies
ENGLISH_DIGRAPHS = {
    'TH': 0.0388, 'HE': 0.0368, 'IN': 0.0228, 'ER': 0.0217, 'AN': 0.0214,
    'RE': 0.0174, 'ND': 0.0157, 'AT': 0.0157, 'ON': 0.0152, 'NT': 0.0146,
    'HA': 0.0142, 'ES': 0.0139, 'ST': 0.0138, 'EN': 0.0132, 'ED': 0.0128,
    'TO': 0.0128, 'IT': 0.0123, 'OU': 0.0123, 'EA': 0.0120, 'HI': 0.0119
}

# Helper functions
def clean_text(text):
    """Remove non-alphabetic characters and convert to uppercase"""
    return ''.join(c.upper() for c in text if c.isalpha())

def frequency_analysis(text):
    """Calculate letter frequencies in text"""
    text = clean_text(text)
    freq = Counter(text)
    total = sum(freq.values())
    return {char: count/total for char, count in freq.items()}

def generate_frequency_chart(ciphertext, language_freq=None):
    """Generate frequency distribution chart and return as base64 image"""
    cipher_freq = frequency_analysis(ciphertext)
    chars = sorted(cipher_freq.keys())
    values = [cipher_freq[char] for char in chars]

    # Create figure with smaller size
    plt.figure(figsize=(8, 4))
    
    # Create bar plot with adjusted width and style
    plt.bar(chars, values, alpha=0.7, label='Ciphertext', color='skyblue', width=0.6)

    if language_freq:
        lang_values = [language_freq.get(char, 0) for char in chars]
        plt.plot(chars, lang_values, color='red', marker='o', linewidth=2, markersize=4, label='Expected (English)')

    plt.title('Letter Frequency Analysis', fontsize=12, pad=10)
    plt.xlabel('Letters', fontsize=10)
    plt.ylabel('Frequency', fontsize=10)
    plt.legend(fontsize=9)
    plt.grid(True, alpha=0.3)
    plt.xticks(fontsize=9)
    plt.yticks(fontsize=9)
    
    # Adjust layout to prevent label cutoff
    plt.tight_layout()
    
    # Convert plot to base64 string
    img = io.BytesIO()
    plt.savefig(img, format='png', dpi=100, bbox_inches='tight')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()
    
    return plot_url

# Caesar Cipher functions
def caesar_encrypt(plaintext, shift):
    """Encrypt plaintext using Caesar cipher"""
    plaintext = clean_text(plaintext)
    result = []
    for char in plaintext:
        result.append(chr((ord(char) - 65 + shift) % 26 + 65))
    return ''.join(result)

def caesar_decrypt(ciphertext, shift):
    """Decrypt ciphertext using Caesar cipher"""
    return caesar_encrypt(ciphertext, -shift)

def caesar_brute_force(ciphertext):
    """Brute force all possible Caesar shifts"""
    results = []
    for shift in range(26):
        decrypted = caesar_decrypt(ciphertext, shift)
        score = sum(ENGLISH_FREQ.get(c, 0) for c in decrypted)
        results.append({
            'shift': shift,
            'decrypted': decrypted,
            'score': score
        })
    return sorted(results, key=lambda x: -x['score'])

# Vigenère Cipher functions
def vigenere_encrypt(plaintext, key):
    """Encrypt plaintext using Vigenère cipher"""
    plaintext = clean_text(plaintext)
    key = clean_text(key)
    if not key:
        raise ValueError("Key cannot be empty")
    key_len = len(key)
    result = []
    for i, char in enumerate(plaintext):
        shift = ord(key[i % key_len]) - 65
        result.append(chr((ord(char) - 65 + shift) % 26 + 65))
    return ''.join(result)

def vigenere_decrypt(ciphertext, key):
    """Decrypt ciphertext using Vigenère cipher"""
    ciphertext = clean_text(ciphertext)
    key = clean_text(key)
    if not key:
        raise ValueError("Key cannot be empty")
    key_len = len(key)
    result = []
    for i, char in enumerate(ciphertext):
        shift = ord(key[i % key_len]) - 65
        result.append(chr((ord(char) - 65 - shift) % 26 + 65))
    return ''.join(result)

def friedman_test(ciphertext):
    """Estimate Vigenère key length using Friedman test"""
    n = len(ciphertext)
    freq = frequency_analysis(ciphertext)
    kappa_p = sum(p**2 for p in ENGLISH_FREQ.values())
    kappa_r = 1/26
    
    kappa_0 = sum(f**2 for f in freq.values())
    
    if kappa_0 == kappa_r:
        return 1
    return (kappa_p - kappa_r) / (kappa_0 - kappa_r)

def kasiski_examination(ciphertext, max_length=10):
    """Find repeating sequences to guess key length"""
    ciphertext = clean_text(ciphertext)
    sequences = {}

    for length in range(3, 6):
        for i in range(len(ciphertext) - length):
            seq = ciphertext[i:i+length]
            if seq in sequences:
                sequences[seq].append(i)
            else:
                sequences[seq] = [i]

    sequences = {seq: positions for seq, positions in sequences.items() if len(positions) > 1}

    distances = []
    for seq, positions in sequences.items():
        for i in range(1, len(positions)):
            distances.append(positions[i] - positions[0])

    if not distances:
        return []

    factors = []
    for d in distances:
        for i in range(2, min(d, max_length) + 1):
            if d % i == 0:
                factors.append(i)

    factor_counts = Counter(factors)
    most_common = factor_counts.most_common(3)
    
    friedman_est = friedman_test(ciphertext)
    friedman_keylen = round(friedman_est)
    
    if friedman_keylen not in [f for f, _ in most_common]:
        most_common.append((friedman_keylen, 1))
    
    return [f for f, _ in sorted(most_common, key=lambda x: -x[1])]

def vigenere_frequency_analysis(ciphertext, max_key_length=10):
    """Attempt to break Vigenère cipher using frequency analysis"""
    ciphertext = clean_text(ciphertext)
    possible_key_lengths = kasiski_examination(ciphertext, max_key_length)

    if not possible_key_lengths:
        return None, []

    key_length = possible_key_lengths[0]
    groups = [[] for _ in range(key_length)]
    
    for i, char in enumerate(ciphertext):
        groups[i % key_length].append(char)

    key = []
    for group in groups:
        freq = frequency_analysis(''.join(group))
        best_shift = 0
        best_score = float('-inf')
        for shift in range(26):
            score = 0
            for char, prob in freq.items():
                english_char = chr((ord(char) - 65 - shift) % 26 + 65)
                score += prob * ENGLISH_FREQ.get(english_char, 0)
            if score > best_score:
                best_score = score
                best_shift = shift
        key.append(chr(best_shift + 65))

    recovered_key = ''.join(key)
    decrypted = vigenere_decrypt(ciphertext, recovered_key)
    
    return recovered_key, decrypted

# Affine Cipher functions
def modular_inverse(a, m):
    """Find modular inverse of a mod m"""
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None

def affine_encrypt(plaintext, a, b):
    """Encrypt plaintext using Affine cipher"""
    if math.gcd(a, 26) != 1:
        raise ValueError("Key 'a' must be coprime with 26.")
    plaintext = clean_text(plaintext)
    result = []
    for char in plaintext:
        x = ord(char) - 65
        e = (a * x + b) % 26
        result.append(chr(e + 65))
    return ''.join(result)

def affine_decrypt(ciphertext, a, b):
    """Decrypt ciphertext using Affine cipher"""
    ciphertext = clean_text(ciphertext)
    a_inv = modular_inverse(a, 26)
    if a_inv is None:
        return "Invalid key (a must be coprime with 26)"

    result = []
    for char in ciphertext:
        y = ord(char) - 65
        d = (a_inv * (y - b)) % 26
        result.append(chr(d + 65))
    return ''.join(result)

def affine_brute_force(ciphertext):
    """Brute force all valid Affine cipher keys"""
    valid_a = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]
    results = []
    for a in valid_a:
        for b in range(26):
            decrypted = affine_decrypt(ciphertext, a, b)
            score = sum(ENGLISH_FREQ.get(c, 0) for c in decrypted)
            results.append({
                'a': a,
                'b': b,
                'decrypted': decrypted,
                'score': score
            })
    return sorted(results, key=lambda x: -x['score'])

# Playfair Cipher functions
def playfair_prepare_text(plaintext):
    """Prepare text for Playfair cipher"""
    plaintext = clean_text(plaintext)
    prepared = []
    i = 0
    while i < len(plaintext):
        if i == len(plaintext) - 1:
            prepared.append(plaintext[i])
            prepared.append('X')
            break
        if plaintext[i] == plaintext[i+1]:
            prepared.append(plaintext[i])
            prepared.append('X')
            i += 1
        else:
            prepared.append(plaintext[i])
            prepared.append(plaintext[i+1])
            i += 2
    return ''.join(prepared)

def playfair_create_square(key):
    """Create 5x5 Playfair square from key"""
    key = clean_text(key.replace('J', 'I'))
    alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'

    seen = set()
    square = []
    for char in key + alphabet:
        if char not in seen:
            seen.add(char)
            square.append(char)

    return [square[i*5:(i+1)*5] for i in range(5)]

def playfair_encrypt(plaintext, key):
    """Encrypt plaintext using Playfair cipher"""
    plaintext = playfair_prepare_text(plaintext)
    square = playfair_create_square(key)
    ciphertext = []

    pos_map = {}
    for row in range(5):
        for col in range(5):
            pos_map[square[row][col]] = (row, col)

    for i in range(0, len(plaintext), 2):
        a, b = plaintext[i], plaintext[i+1]
        row_a, col_a = pos_map[a]
        row_b, col_b = pos_map[b]

        if row_a == row_b:
            ciphertext.append(square[row_a][(col_a + 1) % 5])
            ciphertext.append(square[row_b][(col_b + 1) % 5])
        elif col_a == col_b:
            ciphertext.append(square[(row_a + 1) % 5][col_a])
            ciphertext.append(square[(row_b + 1) % 5][col_b])
        else:
            ciphertext.append(square[row_a][col_b])
            ciphertext.append(square[row_b][col_a])

    return ''.join(ciphertext)

def playfair_decrypt(ciphertext, key):
    """Decrypt ciphertext using Playfair cipher"""
    ciphertext = clean_text(ciphertext)
    if len(ciphertext) % 2 != 0:
        return "Invalid ciphertext length (must be even)"

    square = playfair_create_square(key)
    plaintext = []

    pos_map = {}
    for row in range(5):
        for col in range(5):
            pos_map[square[row][col]] = (row, col)

    for i in range(0, len(ciphertext), 2):
        a, b = ciphertext[i], ciphertext[i+1]
        row_a, col_a = pos_map[a]
        row_b, col_b = pos_map[b]

        if row_a == row_b:
            plaintext.append(square[row_a][(col_a - 1) % 5])
            plaintext.append(square[row_b][(col_b - 1) % 5])
        elif col_a == col_b:
            plaintext.append(square[(row_a - 1) % 5][col_a])
            plaintext.append(square[(row_b - 1) % 5][col_b])
        else:
            plaintext.append(square[row_a][col_b])
            plaintext.append(square[row_b][col_a])

    result = ''.join(plaintext)
    if result.endswith('X'):
        result = result[:-1]
    return result

# Monoalphabetic Cipher functions
def monoalphabetic_validate_key(key_string):
    """Validate and convert string key to dictionary format"""
    key_string = key_string.upper().strip()
    
    # Check length
    if len(key_string) != 26:
        raise ValueError(f"Key must be exactly 26 characters, got {len(key_string)}")
    
    # Check for non-alphabetic characters
    if not key_string.isalpha():
        raise ValueError("Key must contain only alphabetic characters")
    
    # Check for duplicates
    if len(set(key_string)) != 26:
        raise ValueError("Key must contain each letter A-Z exactly once")
    
    # Check that all letters A-Z are present
    alphabet = set(string.ascii_uppercase)
    key_set = set(key_string)
    if key_set != alphabet:
        missing = alphabet - key_set
        extra = key_set - alphabet
        error_msg = ""
        if missing:
            error_msg += f"Missing letters: {', '.join(sorted(missing))}. "
        if extra:
            error_msg += f"Invalid characters: {', '.join(sorted(extra))}. "
        raise ValueError(error_msg.strip())
    
    # Convert to dictionary format
    alphabet_list = list(string.ascii_uppercase)
    return dict(zip(alphabet_list, key_string))

def monoalphabetic_generate_key():
    """Generate random substitution key"""
    alphabet = list(string.ascii_uppercase)
    shuffled = alphabet.copy()
    random.shuffle(shuffled)
    return dict(zip(alphabet, shuffled))

def monoalphabetic_encrypt(plaintext, key):
    """Encrypt plaintext using monoalphabetic substitution cipher"""
    plaintext = clean_text(plaintext)
    return ''.join(key[char] for char in plaintext)

def monoalphabetic_decrypt(ciphertext, key):
    """Decrypt ciphertext using monoalphabetic substitution cipher"""
    ciphertext = clean_text(ciphertext)
    reverse_key = {v: k for k, v in key.items()}
    return ''.join(reverse_key[char] for char in ciphertext)

def monoalphabetic_frequency_analysis(ciphertext):
    """Generate frequency-based mapping for monoalphabetic cipher"""
    cipher_freq = frequency_analysis(ciphertext)
    sorted_cipher = sorted(cipher_freq.items(), key=lambda x: -x[1])
    sorted_english = sorted(ENGLISH_FREQ.items(), key=lambda x: -x[1])
    
    mapping = {}
    for (cipher_char, _), (english_char, _) in zip(sorted_cipher, sorted_english):
        mapping[cipher_char] = english_char
    
    return mapping

# Rail Fence Cipher functions
def railfence_encrypt(plaintext, rails):
    """Encrypt using Rail Fence cipher"""
    plaintext = clean_text(plaintext)
    fence = [[] for _ in range(rails)]
    rail = 0
    direction = 1
    
    for char in plaintext:
        fence[rail].append(char)
        rail += direction
        if rail == rails - 1 or rail == 0:
            direction *= -1
    
    return ''.join([''.join(rail) for rail in fence])

def railfence_decrypt(ciphertext, rails):
    """Decrypt Rail Fence cipher"""
    ciphertext = clean_text(ciphertext)
    pattern = []
    rail = 0
    direction = 1
    
    for _ in range(len(ciphertext)):
        pattern.append(rail)
        rail += direction
        if rail == rails - 1 or rail == 0:
            direction *= -1
    
    fence = [[] for _ in range(rails)]
    for i, rail in enumerate(pattern):
        fence[rail].append(i)
    
    order = []
    for rail in fence:
        order.extend(rail)
    
    plaintext = [''] * len(ciphertext)
    for i, pos in enumerate(order):
        plaintext[pos] = ciphertext[i]
    
    return ''.join(plaintext)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

# Caesar Cipher routes
@app.route('/api/caesar/encrypt', methods=['POST'])
def caesar_encrypt_api():
    try:
        data = request.json
        result = caesar_encrypt(data['plaintext'], int(data['shift']))
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/caesar/decrypt', methods=['POST'])
def caesar_decrypt_api():
    try:
        data = request.json
        result = caesar_decrypt(data['ciphertext'], int(data['shift']))
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/caesar/brute-force', methods=['POST'])
def caesar_brute_force_api():
    try:
        data = request.json
        results = caesar_brute_force(data['ciphertext'])
        return jsonify({'success': True, 'results': results})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Vigenère Cipher routes
@app.route('/api/vigenere/encrypt', methods=['POST'])
def vigenere_encrypt_api():
    try:
        data = request.json
        result = vigenere_encrypt(data['plaintext'], data['key'])
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/vigenere/decrypt', methods=['POST'])
def vigenere_decrypt_api():
    try:
        data = request.json
        result = vigenere_decrypt(data['ciphertext'], data['key'])
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/vigenere/analyze', methods=['POST'])
def vigenere_analyze_api():
    try:
        data = request.json
        key, decrypted = vigenere_frequency_analysis(data['ciphertext'])
        if key:
            return jsonify({'success': True, 'key': key, 'decrypted': decrypted})
        else:
            return jsonify({'success': False, 'error': 'Could not determine key length'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Affine Cipher routes
@app.route('/api/affine/encrypt', methods=['POST'])
def affine_encrypt_api():
    try:
        data = request.json
        result = affine_encrypt(data['plaintext'], int(data['a']), int(data['b']))
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/affine/decrypt', methods=['POST'])
def affine_decrypt_api():
    try:
        data = request.json
        result = affine_decrypt(data['ciphertext'], int(data['a']), int(data['b']))
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/affine/brute-force', methods=['POST'])
def affine_brute_force_api():
    try:
        data = request.json
        results = affine_brute_force(data['ciphertext'])
        return jsonify({'success': True, 'results': results})  # Return all 312 combinations
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Playfair Cipher routes
@app.route('/api/playfair/encrypt', methods=['POST'])
def playfair_encrypt_api():
    try:
        data = request.json
        result = playfair_encrypt(data['plaintext'], data['key'])
        square = playfair_create_square(data['key'])
        return jsonify({'success': True, 'result': result, 'square': square})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/playfair/decrypt', methods=['POST'])
def playfair_decrypt_api():
    try:
        data = request.json
        result = playfair_decrypt(data['ciphertext'], data['key'])
        square = playfair_create_square(data['key'])
        return jsonify({'success': True, 'result': result, 'square': square})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Monoalphabetic Cipher routes
@app.route('/api/monoalphabetic/generate-key', methods=['POST'])
def monoalphabetic_generate_key_api():
    try:
        key = monoalphabetic_generate_key()
        return jsonify({'success': True, 'key': key})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/monoalphabetic/validate-key', methods=['POST'])
def monoalphabetic_validate_key_api():
    try:
        data = request.json
        key_dict = monoalphabetic_validate_key(data['key'])
        return jsonify({'success': True, 'key': key_dict})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/monoalphabetic/encrypt', methods=['POST'])
def monoalphabetic_encrypt_api():
    try:
        data = request.json
        result = monoalphabetic_encrypt(data['plaintext'], data['key'])
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/monoalphabetic/decrypt', methods=['POST'])
def monoalphabetic_decrypt_api():
    try:
        data = request.json
        result = monoalphabetic_decrypt(data['ciphertext'], data['key'])
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/monoalphabetic/analyze', methods=['POST'])
def monoalphabetic_analyze_api():
    try:
        data = request.json
        ciphertext = clean_text(data['ciphertext'])
        mapping = monoalphabetic_frequency_analysis(ciphertext)
        
        # Apply the mapping to decrypt - only map letters that appear in the ciphertext
        decrypted = ''.join(mapping.get(char, char) for char in ciphertext)
        return jsonify({'success': True, 'mapping': mapping, 'decrypted': decrypted})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Rail Fence Cipher routes
@app.route('/api/railfence/encrypt', methods=['POST'])
def railfence_encrypt_api():
    try:
        data = request.json
        result = railfence_encrypt(data['plaintext'], int(data['rails']))
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/railfence/decrypt', methods=['POST'])
def railfence_decrypt_api():
    try:
        data = request.json
        result = railfence_decrypt(data['ciphertext'], int(data['rails']))
        return jsonify({'success': True, 'result': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Frequency analysis route
@app.route('/api/frequency-analysis', methods=['POST'])
def frequency_analysis_api():
    try:
        data = request.json
        text = data['text']
        
        # Generate frequency data
        freq_data = frequency_analysis(text)
        
        # Generate chart
        chart_url = generate_frequency_chart(text, ENGLISH_FREQ)
        
        return jsonify({
            'success': True, 
            'frequencies': freq_data,
            'chart': chart_url
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5001) 