// document.addEventListener('DOMContentLoaded', () => {
//     // Get references to all necessary elements
//     const form = document.getElementById('mains-percentile-form');
//     const resultsContainer = document.getElementById('results-container');
//     const predictAgainBtn = document.getElementById('predict-again-btn');
//     const shiftSelect = document.getElementById('shift');

//     // --- Helper function to populate the shift dropdown ---
//     function populateShifts() {
//         // Clear existing options
//         shiftSelect.innerHTML = '';
//         // Add 10 shift options
//         for (let i = 1; i <= 10; i++) {
//             const option = document.createElement('option');
//             option.value = i;
//             option.textContent = `Shift ${i}`;
//             shiftSelect.appendChild(option);
//         }
//     }

//     // Function to clear results and reset the form
//     function resetForm() {
//         resultsContainer.innerHTML = '<p class="placeholder-text">Your predicted percentile will appear here.</p>';
//         form.reset();
//         document.getElementById('marks').focus();
//     }

//     // --- Main form submission logic ---
//     form.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         const marks = document.getElementById('marks').value;
//         const session = document.getElementById('session').value;
//         const shift = document.getElementById('shift').value;

//         resultsContainer.innerHTML = '<p>Predicting your percentile...</p>';

//         try {
//             const response = await fetch('/api/predict-mains-percentile', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     marks: parseInt(marks),
//                     session: session,
//                     shift: parseInt(shift)
//                 }),
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 resultsContainer.innerHTML = `<p class="error">${data.message || 'An error occurred.'}</p>`;
//             } else {
//                 // Display the percentile result
//                 resultsContainer.innerHTML = `
//                     <h2>Predicted Percentile:</h2>
//                     <div class="result-card">
//                         <h3>Expected Percentile</h3>
//                         <p>${data.EXPECTED_PERCENTILE}</p>
//                     </div>
//                 `;
//             }
//         } catch (error) {
//             console.error('Fetch Error:', error);
//             resultsContainer.innerHTML = '<p class="error">Could not connect to the server.</p>';
//         }
//     });

//     // --- Initialization ---
//     // Add event listener for the "Predict Again" button
//     predictAgainBtn.addEventListener('click', resetForm);
//     // Populate the shift dropdown when the page loads
//     populateShifts();
// });


document.addEventListener('DOMContentLoaded', () => {
    // Get references to all necessary elements
    const form = document.getElementById('mains-percentile-form');
    const resultsContainer = document.getElementById('results-container');
    const predictAgainBtn = document.getElementById('predict-again-btn');
    const shiftSelect = document.getElementById('shift');

    // --- Helper function to populate the shift dropdown (Bug #15 fix) ---
    function populateShifts() {
        // Clear existing options
        shiftSelect.innerHTML = '';
        // Add 10 shift options (Shift 1 to Shift 10)
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Shift ${i}`;
            shiftSelect.appendChild(option);
        }
    }

    // --- Function to reset the form and results ---
    function resetForm() {
        resultsContainer.innerHTML = '<p class="placeholder-text">Your predicted percentile will appear here.</p>';
        form.reset();
        document.getElementById('marks').focus();
    }

    // --- Main form submission logic ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const marks = parseInt(document.getElementById('marks').value);
        const session = document.getElementById('session').value;
        const shift = parseInt(document.getElementById('shift').value);

        resultsContainer.innerHTML = '<p>Predicting your percentile...</p>';

        try {
            const response = await fetch('/api/predict-mains-percentile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marks, session, shift }),
            });

            const data = await response.json();

            if (!response.ok) {
                resultsContainer.innerHTML = `<p class="error">${data.message || 'An error occurred.'}</p>`;
            } else {
                // Display the percentile result
                resultsContainer.innerHTML = `
                    <h2>Predicted Percentile:</h2>
                    <div class="result-card">
                        <h3>Expected Percentile</h3>
                        <p>${data.EXPECTED_PERCENTILE}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            resultsContainer.innerHTML = '<p class="error">Could not connect to the server.</p>';
        }
    });

    // --- Initialization ---
    predictAgainBtn.addEventListener('click', resetForm);
    populateShifts(); // Populate shift dropdown on page load
});
