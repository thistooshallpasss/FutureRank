// At the top of your future mainsCollege.js file
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rank = urlParams.get('rank');
    if (rank) {
        // Pre-fill the rank input field on the college predictor page
        document.getElementById('rank-input').value = rank;
    }
});