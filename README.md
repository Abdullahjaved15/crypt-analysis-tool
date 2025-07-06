# Advanced Cryptography Tool - Web Application

A comprehensive web-based cryptography tool that implements various classical ciphers with modern analysis capabilities. This application provides an interactive interface for encryption, decryption, and cryptanalysis of multiple cipher types.

## Features

### Supported Ciphers
1. **Caesar Cipher** - Simple substitution cipher with shift
2. **Vigenère Cipher** - Polyalphabetic substitution cipher
3. **Affine Cipher** - Mathematical linear transformation cipher
4. **Playfair Cipher** - Digraph substitution cipher using 5×5 grid
5. **Monoalphabetic Cipher** - Single alphabet substitution cipher
6. **Rail Fence Cipher** - Transposition cipher using zigzag pattern

### Capabilities
- **Encryption & Decryption** for all supported ciphers
- **Brute Force Attacks** for Caesar and Affine ciphers
- **Frequency Analysis** with visual charts and statistical data
- **Automatic Key Recovery** for Vigenère cipher using Kasiski examination
- **Interactive Analysis Tools** for cryptanalysis
- **Modern Responsive Web Interface**

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Setup Instructions

1. **Clone or download the project files**
   ```
   Project Structure:
   ├── app.py                 # Flask backend application
   ├── requirements.txt       # Python dependencies
   ├── templates/
   │   └── index.html        # Main HTML template
   ├── static/
   │   ├── css/
   │   │   └── style.css     # Stylesheet
   │   └── js/
   │       └── script.js     # JavaScript functionality
   └── README.md             # This file
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask application**
   ```bash
   python app.py
   ```

4. **Access the web application**
   - Open your browser and navigate to: `http://localhost:5000`
   - The application will be ready to use!

## Usage Guide

### Basic Operations

1. **Select a Cipher**: Click on any cipher tab (Caesar, Vigenère, etc.)
2. **Choose Operation**: Select encrypt, decrypt, or analysis options
3. **Enter Text**: Input your plaintext or ciphertext
4. **Set Parameters**: Configure keys, shifts, or other cipher-specific settings
5. **Process**: Click the "Process" button to execute the operation
6. **View Results**: Output appears in the result area

### Advanced Features

#### Frequency Analysis
- Click the "Analyze" button on any cipher panel
- View interactive frequency distribution charts
- Compare cipher text frequencies with English language patterns
- Use results to guide cryptanalysis efforts

#### Brute Force Attacks
- Available for Caesar and Affine ciphers
- Automatically tries all possible keys
- Results sorted by likelihood (frequency analysis scoring)
- Click on any result to copy to output

#### Automatic Key Recovery
- Vigenère cipher includes automatic cryptanalysis
- Uses Kasiski examination and Friedman test
- Attempts to recover the original key
- Displays both recovered key and decrypted text

### Cipher-Specific Notes

#### Caesar Cipher
- Shift range: 0-25
- Brute force tries all 26 possible shifts
- Results ranked by English frequency match

#### Vigenère Cipher
- Supports variable-length keywords
- Automatic analysis can break most Vigenère ciphers
- Key recovery works best with longer ciphertext

#### Affine Cipher
- Key 'a' must be coprime with 26 (dropdown provided)
- Key 'b' can be any value 0-25
- Brute force tries all 312 valid key combinations

#### Playfair Cipher
- Uses 5×5 grid (I and J share a position)
- Automatically handles text preparation
- Displays the cipher grid for reference

#### Monoalphabetic Cipher
- Generate random substitution keys
- Frequency analysis attack available
- Shows letter-to-letter mapping

#### Rail Fence Cipher
- Configurable number of rails (2-10)
- Simple transposition cipher
- Visual pattern: zigzag arrangement

## Technical Details

### Backend (Flask)
- **Framework**: Flask 2.3.3 with CORS support
- **Visualization**: Matplotlib for frequency charts
- **API Design**: RESTful endpoints for each cipher operation
- **Error Handling**: Comprehensive error messages and validation

### Frontend (HTML/CSS/JavaScript)
- **Design**: Modern, responsive interface with gradient backgrounds
- **Animations**: Smooth transitions and loading indicators
- **Charts**: Integrated frequency analysis with Chart.js
- **Mobile-Friendly**: Responsive design for all screen sizes

### API Endpoints
- `/api/caesar/*` - Caesar cipher operations
- `/api/vigenere/*` - Vigenère cipher operations
- `/api/affine/*` - Affine cipher operations
- `/api/playfair/*` - Playfair cipher operations
- `/api/monoalphabetic/*` - Monoalphabetic cipher operations
- `/api/railfence/*` - Rail fence cipher operations
- `/api/frequency-analysis` - General frequency analysis

## Educational Purpose

⚠️ **Important Note**: This tool is designed for educational purposes only. The implemented ciphers are classical and not suitable for real-world security applications. Modern cryptography uses much more sophisticated algorithms.

### Learning Objectives
- Understand classical cipher mechanisms
- Practice cryptanalysis techniques
- Visualize frequency analysis concepts
- Explore cipher strengths and weaknesses

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure all requirements are installed: `pip install -r requirements.txt`

2. **Port already in use**
   - Flask runs on port 5000 by default
   - Stop any other applications using this port

3. **Charts not displaying**
   - Check internet connection (Chart.js loads from CDN)
   - Ensure JavaScript is enabled in browser

4. **Slow frequency analysis**
   - Large texts may take time to process
   - Consider shorter input texts for faster results

### Performance Tips
- Use shorter texts for faster processing
- Frequency analysis works best with texts > 100 characters
- Brute force attacks are faster on shorter ciphertext

## Contributing

Feel free to enhance this educational tool by:
- Adding new cipher types
- Improving cryptanalysis algorithms
- Enhancing the user interface
- Adding more visualization features

## License

This project is created for educational purposes. Feel free to use and modify for learning and teaching cryptography concepts. 