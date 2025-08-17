document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mains-rank-form');
    const resultsContainer = document.getElementById('results-container');
    const collegePredictorBtn = document.getElementById('college-predictor-btn');
    const predictAgainBtn = document.getElementById('predict-again-btn');

    function displayResults(data) {
        // Update href with the new MIN rank from the range
        collegePredictorBtn.href = `/mains-college-predictor.html?rank=${data.EXPECTED_GENERAL_RANK_MIN}`;
        collegePredictorBtn.classList.remove('disabled');

        resultsContainer.innerHTML = `
            <h2>Predicted Ranks:</h2>
            <div class="result-card">
                <h3>General Rank (CRL) Range</h3>
                <p>${data.EXPECTED_GENERAL_RANK_MIN} - ${data.EXPECTED_GENERAL_RANK_MAX}</p>
            </div>
            <div class="result-card">
                <h3>Category Rank Range</h3>
                <p>${data.EXPECTED_CATEGORY_RANK_MIN} - ${data.EXPECTED_CATEGORY_RANK_MAX}</p>
            </div>
        `;
    }

    function resetForm() {
        collegePredictorBtn.href = '#';
        collegePredictorBtn.classList.add('disabled');
        resultsContainer.innerHTML = '<p class="placeholder-text">Your predicted rank will appear here.</p>';
        form.reset();
        document.getElementById('marks').focus();
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        collegePredictorBtn.href = '#';
        collegePredictorBtn.classList.add('disabled');

        const marks = document.getElementById('marks').value;
        const category = document.getElementById('category').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const pwd_status = document.querySelector('input[name="pwd_status"]:checked').value; // Get PwD status

        resultsContainer.innerHTML = '<p>Predicting your rank...</p>';

        try {
            const response = await fetch('/api/predict-mains-rank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ // Send PwD status to backend
                    marks: parseInt(marks),
                    category: category,
                    gender: gender,
                    pwd_status: pwd_status
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                resultsContainer.innerHTML = `<p class="error">${data.message || 'An error occurred.'}</p>`;
            } else {
                displayResults(data);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            resultsContainer.innerHTML = '<p class="error">Could not connect to the server.</p>';
        }
    });

    predictAgainBtn.addEventListener('click', resetForm);
});