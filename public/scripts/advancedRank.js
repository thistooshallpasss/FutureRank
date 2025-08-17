// In public/scripts/advancedRank.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to all necessary elements from the HTML
    const form = document.getElementById('advanced-rank-form');
    const resultsContainer = document.getElementById('results-container');
    const predictAgainBtn = document.getElementById('predict-again-btn');
    const advancedCollegeBtn = document.getElementById('advanced-college-btn');

    // Function to clear results, reset the form, and disable the college button
    function resetForm() {
        // Disable and reset the college predictor button's state
        advancedCollegeBtn.classList.add('disabled');
        advancedCollegeBtn.href = '#';
        
        // Clear the results container and reset the form fields
        resultsContainer.innerHTML = '<p class="placeholder-text">Your predicted rank will appear here.</p>';
        form.reset();
        document.getElementById('marks').focus(); // Focus back on the first input for convenience
    }

    // Main form submission logic
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the browser from reloading the page

        // Before making a new prediction, ensure the college button is disabled
        advancedCollegeBtn.classList.add('disabled');
        advancedCollegeBtn.href = '#';

        // Get all four input values from the form
        const marks = document.getElementById('marks').value;
        const category = document.getElementById('category').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const pwd_status = document.querySelector('input[name="pwd_status"]:checked').value;

        // Show a loading message while fetching data
        resultsContainer.innerHTML = '<p>Predicting your rank...</p>';

        try {
            // Send the data to the backend API endpoint
            const response = await fetch('/api/predict-advanced-rank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                // THIS IS THE UPDATED PART
                if (data.message) { 
                    resultsContainer.innerHTML = `<div class="result-card-special"><p>${data.message}</p></div>`;
                } else {
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
                    
                    // Enable the "Predict Advanced College" button and set its link
                    // The link includes the predicted CRL as a query parameter for the next page
                    advancedCollegeBtn.href = `/advanced-college-predictor.html?rank=${data.EXPECTED_GENERAL_RANK_MIN}`;
                    advancedCollegeBtn.classList.remove('disabled');
                }
            }
        } catch (error) {
            // Handle network errors (e.g., server is down)
            console.error('Fetch Error:', error);
            resultsContainer.innerHTML = '<p class="error">Could not connect to the server. Please try again later.</p>';
        }
    });

    // Add a simple event listener for the "Predict Again" button
    predictAgainBtn.addEventListener('click', resetForm);
});