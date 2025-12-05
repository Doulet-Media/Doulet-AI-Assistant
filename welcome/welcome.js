// Welcome page script for AnswersAI extension

// Handle button clicks
document.getElementById('openSettings').addEventListener('click', function(e) {
    e.preventDefault();
    if (chrome && chrome.runtime) {
        chrome.runtime.openOptionsPage();
    }
});

document.getElementById('rateExtension').addEventListener('click', function(e) {
    e.preventDefault();
    // Open Chrome Web Store review page (if published)
    window.open('https://chrome.google.com/webstore/detail/answersai', '_blank');
});

document.getElementById('reportIssue').addEventListener('click', function(e) {
    e.preventDefault();
    window.open('https://github.com/doulet-media/answersai/issues', '_blank');
});

document.getElementById('featureRequest').addEventListener('click', function(e) {
    e.preventDefault();
    window.open('https://github.com/doulet-media/answersai/issues', '_blank');
});