async function checkPlagiarism() {
    const userText = document.getElementById('inputText').value.trim();
    const resultDiv = document.getElementById('result');
    const searchResultsDiv = document.getElementById('search-results');
    const spinner = document.getElementById('spinner');
    const uniqueContent = document.getElementById('uniqueContent');
    const loadingBar = document.getElementById('loadingBar');
    const progressBar = document.getElementById('progressBar');

    if (!userText) {
        resultDiv.textContent = "Please enter some text.";
        resultDiv.style.color = "red";
        return;
    }

    resultDiv.textContent = "";
    searchResultsDiv.innerHTML = "";
    spinner.classList.remove('d-none');
    loadingBar.classList.remove('d-none');
    uniqueContent.classList.remove('d-none');

    // Split text into chunks
    const chunks = userText.match(/.{1,100}/g);
    const totalChunks = chunks.length;
    let foundMatch = false;
    let matchCount = 0;

    // Time limit in milliseconds (e.g., 20 seconds)
    const timeLimit = 20000;
    const startTime = Date.now();

    // Display initial unique content status
    uniqueContent.textContent = "Checking content uniqueness...";
    uniqueContent.style.backgroundColor = "#333";
    uniqueContent.style.color = "#dcdcdc";

    for (let i = 0; i < totalChunks; i++) {
        const chunk = chunks[i];
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > timeLimit) {
            break; // Stop processing if time limit is exceeded
        }

        const query = encodeURIComponent(chunk);
        const searchUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${query}`)}`;

        try {
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, "text/html");
            const results = doc.querySelectorAll('.result__title a');

            if (results.length > 0) {
                foundMatch = true;
                matchCount++;
                searchResultsDiv.innerHTML += `<div class="matches-found"><p>Match found for: <strong>${chunk}</strong></p>`;
                results.forEach(result => {
                    const link = result.href;
                    const text = result.textContent;
                    searchResultsDiv.innerHTML += `<p>Found a match: "${text}" <a href="${link}" target="_blank"></a></p>`;
                });
                searchResultsDiv.innerHTML += `</div>`;
            }
        } catch (error) {
            console.log("Error fetching search results:", error);
        }

        // Update loading bar
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        progressBar.textContent = `${progress}%`;

        // Add some space between loading circle and checking text
        spinner.style.marginRight = '10px';
    }

    spinner.classList.add('d-none');
    loadingBar.classList.add('d-none');

    const uniquePercentage = Math.round(((totalChunks - matchCount) / totalChunks) * 100);
    let color = "green";
    let plagiarismStatus = "Very little";

    if (uniquePercentage < 50) {
        color = "red";
        plagiarismStatus = "Plagiarism: Most";
    } else if (uniquePercentage < 80) {
        color = "yellow";
        plagiarismStatus = "Plagiarism: More";
    } else if (uniquePercentage < 90) {
        plagiarismStatus = "Plagiarism: Little";
    }

    uniqueContent.textContent = `Unique Content: ${uniquePercentage}% (${plagiarismStatus})`;
    uniqueContent.style.backgroundColor = color;
    uniqueContent.style.color = "white";

    if (uniquePercentage < 99) {
        $('#plagiarismModal').modal('show');
    }
}
