
// Global variables
let pointCount = 2;
let currentPolynomial = null;

// Add a new point input row
function addPoint() {
    pointCount++;
    const container = document.getElementById('pointsContainer');
    
    const pointRow = document.createElement('div');
    pointRow.className = 'point-row';
    
    pointRow.innerHTML = `
        <label>Point ${pointCount}:</label>
        <input type="number" step="any" placeholder="x" class="x-input">
        <input type="number" step="any" placeholder="y" class="y-input">
        <button type="button" class="remove-btn" onclick="removePoint(this)">Remove</button>
    `;
    
    container.appendChild(pointRow);
    updateRemoveButtons();
}

// Remove a point input row
function removePoint(button) {
    const pointRow = button.parentElement;
    pointRow.remove();
    
    // Update point labels
    const pointRows = document.querySelectorAll('.point-row');
    pointRows.forEach((row, index) => {
        const label = row.querySelector('label');
        label.textContent = `Point ${index + 1}:`;
    });
    
    pointCount = pointRows.length;
    updateRemoveButtons();
}

// Update remove button states (disable if only 2 points remain)
function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-btn');
    const shouldDisable = pointCount <= 2;
    
    removeButtons.forEach(button => {
        button.disabled = shouldDisable;
    });
}

// Get all points from input fields
function getPoints() {
    const pointRows = document.querySelectorAll('.point-row');
    const points = [];
    
    for (let row of pointRows) {
        const xInput = row.querySelector('.x-input');
        const yInput = row.querySelector('.y-input');
        
        const x = parseFloat(xInput.value);
        const y = parseFloat(yInput.value);
        
        if (isNaN(x) || isNaN(y)) {
            throw new Error(`Please enter valid numbers for all points. Point with x="${xInput.value}", y="${yInput.value}" is invalid.`);
        }
        
        points.push({ x, y });
    }
    
    // Check for duplicate x values
    const xValues = points.map(p => p.x);
    const uniqueXValues = [...new Set(xValues)];
    if (xValues.length !== uniqueXValues.length) {
        throw new Error('All x-coordinates must be unique for Lagrange interpolation.');
    }
    
    return points;
}

// Lagrange interpolation algorithm
function lagrangeInterpolation(points) {
    const n = points.length;
    
    // Calculate coefficients for the polynomial
    const coefficients = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
        // Calculate Li(x) coefficients
        let numeratorCoeffs = [1]; // Start with polynomial "1"
        let denominator = 1;
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                // Multiply numerator by (x - xj)
                const newCoeffs = new Array(numeratorCoeffs.length + 1).fill(0);
                for (let k = 0; k < numeratorCoeffs.length; k++) {
                    newCoeffs[k] -= numeratorCoeffs[k] * points[j].x;
                    newCoeffs[k + 1] += numeratorCoeffs[k];
                }
                numeratorCoeffs = newCoeffs;
                
                // Calculate denominator
                denominator *= (points[i].x - points[j].x);
            }
        }
        
        // Add yi * Li(x) to the final polynomial
        for (let k = 0; k < numeratorCoeffs.length; k++) {
            if (k >= coefficients.length) {
                coefficients.push(0);
            }
            coefficients[k] += points[i].y * numeratorCoeffs[k] / denominator;
        }
    }
    
    return coefficients;
}

// Format polynomial for display
function formatPolynomial(coefficients) {
    const n = coefficients.length;
    let terms = [];
    
    for (let i = n - 1; i >= 0; i--) {
        const coeff = coefficients[i];
        
        if (Math.abs(coeff) < 1e-10) continue; // Skip near-zero coefficients
        
        let term = '';
        
        // Handle coefficient
        if (i === n - 1) {
            // First term
            if (coeff < 0) term += '-';
            if (Math.abs(coeff) !== 1 || i === 0) {
                term += Math.abs(coeff).toFixed(6).replace(/\.?0+$/, '');
            }
        } else {
            // Subsequent terms
            term += coeff > 0 ? ' + ' : ' - ';
            if (Math.abs(coeff) !== 1 || i === 0) {
                term += Math.abs(coeff).toFixed(6).replace(/\.?0+$/, '');
            }
        }
        
        // Handle x terms
        if (i > 0) {
            if (Math.abs(coeff) === 1 && term.slice(-1) !== ' ') {
                term += 'x';
            } else if (Math.abs(coeff) === 1) {
                term += 'x';
            } else {
                term += 'x';
            }
            
            if (i > 1) {
                term += `^${i}`;
            }
        }
        
        terms.push(term);
    }
    
    if (terms.length === 0) {
        return 'P(x) = 0';
    }
    
    return 'P(x) = ' + terms.join('');
}

// Format polynomial for MathJax
function formatPolynomialMath(coefficients) {
    const n = coefficients.length;
    let terms = [];
    
    for (let i = n - 1; i >= 0; i--) {
        const coeff = coefficients[i];
        
        if (Math.abs(coeff) < 1e-10) continue;
        
        let term = '';
        
        // Handle coefficient
        if (i === n - 1) {
            // First term
            if (coeff < 0) term += '-';
            if (Math.abs(coeff) !== 1 || i === 0) {
                const coeffStr = Math.abs(coeff).toFixed(6).replace(/\.?0+$/, '');
                term += coeffStr;
            }
        } else {
            // Subsequent terms
            term += coeff > 0 ? ' + ' : ' - ';
            if (Math.abs(coeff) !== 1 || i === 0) {
                const coeffStr = Math.abs(coeff).toFixed(6).replace(/\.?0+$/, '');
                term += coeffStr;
            }
        }
        
        // Handle x terms
        if (i > 0) {
            if (Math.abs(coeff) === 1 && (term.endsWith('+') || term.endsWith('-'))) {
                term += 'x';
            } else if (Math.abs(coeff) === 1 && term === '' || term === '-') {
                term += 'x';
            } else {
                term += 'x';
            }
            
            if (i > 1) {
                term += `^{${i}}`;
            }
        }
        
        terms.push(term);
    }
    
    if (terms.length === 0) {
        return 'P(x) = 0';
    }
    
    return 'P(x) = ' + terms.join('');
}

// Evaluate polynomial at given x
function evaluatePolynomial() {
    if (!currentPolynomial) {
        document.getElementById('evalResult').innerHTML = '<span class="error">Please compute a polynomial first.</span>';
        return;
    }
    
    const xInput = document.getElementById('evalX');
    const x = parseFloat(xInput.value);
    
    if (isNaN(x)) {
        document.getElementById('evalResult').innerHTML = '<span class="error">Please enter a valid number for x.</span>';
        return;
    }
    
    let result = 0;
    for (let i = 0; i < currentPolynomial.length; i++) {
        result += currentPolynomial[i] * Math.pow(x, i);
    }
    
    const resultStr = result.toFixed(6).replace(/\.?0+$/, '');
    document.getElementById('evalResult').innerHTML = `
        <div class="polynomial-math">$$P(${x}) = ${resultStr}$$</div>
    `;
    
    // Re-render MathJax
    MathJax.typesetPromise([document.getElementById('evalResult')]).catch((err) => console.log(err.message));
}

// Main calculation function
function calculatePolynomial() {
    try {
        const points = getPoints();
        
        if (points.length < 2) {
            throw new Error('Please enter at least 2 points.');
        }
        
        // Calculate polynomial coefficients
        const coefficients = lagrangeInterpolation(points);
        currentPolynomial = coefficients;
        
        // Format and display result
        const polynomialStr = formatPolynomial(coefficients);
        const polynomialMath = formatPolynomialMath(coefficients);
        
        const displayElement = document.getElementById('polynomialDisplay');
        displayElement.innerHTML = `
            <p><strong>Polynomial of degree ${coefficients.length - 1}:</strong></p>
            <div class="polynomial-result">${polynomialStr}</div>
            <div class="polynomial-math">$$${polynomialMath}$$</div>
            <p><em>This polynomial passes through all ${points.length} given points.</em></p>
        `;
        
        // Show evaluation section
        document.getElementById('evaluationSection').style.display = 'block';
        document.getElementById('evalResult').innerHTML = 'Enter an x value above and click "Evaluate" to compute P(x).';
        
        // Re-render MathJax
        MathJax.typesetPromise([displayElement]).catch((err) => console.log(err.message));
        
    } catch (error) {
        document.getElementById('polynomialDisplay').innerHTML = `
            <div class="error">${error.message}</div>
        `;
        document.getElementById('evaluationSection').style.display = 'none';
        currentPolynomial = null;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateRemoveButtons();
    
    // Add Enter key support for evaluation
    document.getElementById('evalX').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            evaluatePolynomial();
        }
    });
    
    // Add Enter key support for inputs to trigger calculation
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && (e.target.classList.contains('x-input') || e.target.classList.contains('y-input'))) {
            calculatePolynomial();
        }
    });
});
