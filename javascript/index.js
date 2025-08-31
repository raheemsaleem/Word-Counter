const textInput = document.getElementById('text-input');
const resetBtn = document.getElementById('reset-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const wordCountElement = document.getElementById('word-count');
const charCountElement = document.getElementById('char-count');
const wordsElement = document.getElementById('words');
const charactersElement = document.getElementById('characters');
const sentencesElement = document.getElementById('sentences');
const paragraphsElement = document.getElementById('paragraphs');
const readabilityElement = document.getElementById('readability');
const readingTimeElement = document.getElementById('reading-time');
const speakingTimeElement = document.getElementById('speaking-time');
const keywordListElement = document.getElementById('keyword-list');
const keywordPlaceholder = document.getElementById('keyword-placeholder');
const exportJsonBtn = document.getElementById('export-json');
const exportCsvBtn = document.getElementById('export-csv');
const stopwords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

function init() {
    textInput.addEventListener('input', updateLiveCounts);
    resetBtn.addEventListener('click', resetTextArea);
    analyzeBtn.addEventListener('click', analyzeText);
    exportJsonBtn.addEventListener('click', exportJson);
    exportCsvBtn.addEventListener('click', exportCsv);
    updateLiveCounts();
}

function updateLiveCounts() {
    const text = textInput.value;
    const words = countWords(text);
    const characters = countCharacters(text);
    wordCountElement.textContent = `Words: ${words}`;
    charCountElement.textContent = `Characters: ${characters}`;
}

function resetTextArea() {
    textInput.value = '';
    updateLiveCounts();
    clearResults();
}

function clearResults() {
    wordsElement.textContent = '0';
    charactersElement.textContent = '0';
    sentencesElement.textContent = '0';
    paragraphsElement.textContent = '0';
    readabilityElement.textContent = '0';
    readingTimeElement.textContent = '0m';
    speakingTimeElement.textContent = '0m';
    keywordListElement.innerHTML = '';
    keywordPlaceholder.style.display = 'block';
}

function analyzeText() {
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter some text to analyze.');
        return;
    }
    const words = countWords(text);
    const characters = countCharacters(text);
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const readability = calculateReadability(text);
    const readingTime = calculateReadingTime(words);
    const speakingTime = calculateSpeakingTime(words);
    const keywords = analyzeKeywords(text);
    wordsElement.textContent = words;
    charactersElement.textContent = characters;
    sentencesElement.textContent = sentences;
    paragraphsElement.textContent = paragraphs;
    readabilityElement.textContent = readability;
    readingTimeElement.textContent = `${readingTime}m`;
    speakingTimeElement.textContent = `${speakingTime}m`;
    updateKeywordDensity(keywords);
}

function countWords(text) {
    return text ? text.trim().split(/\s+/).length : 0;
}

function countCharacters(text) {
    return text ? text.length : 0;
}

function countSentences(text) {
    return text ? text.split(/[.!?]+/).filter(s => s.length > 0).length : 0;
}

function countParagraphs(text) {
    return text ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
}

function calculateReadability(text) {
    const words = countWords(text);
    const sentences = countSentences(text);
    if (words === 0 || sentences === 0) return 0;
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (countSyllables(text) / words);
    return Math.max(0, Math.min(12, Math.round(score / 10)));
}

function countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;
    for (const word of words) {
        if (word.length <= 3) {
            count += 1;
            continue;
        }
        count += word.split(/[aeiouy]+/).length - 1;
    }
    return count;
}

function calculateReadingTime(words, wpm = 225) {
    return Math.ceil(words / wpm);
}

function calculateSpeakingTime(words, wpm = 150) {
    return Math.ceil(words / wpm);
}

function analyzeKeywords(text) {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopwords.has(word));
    const frequency = {};
    for (const word of words) {
        frequency[word] = (frequency[word] || 0) + 1;
    }
    return Object.entries(frequency)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

function updateKeywordDensity(keywords) {
    keywordListElement.innerHTML = '';
    if (keywords.length === 0) {
        keywordPlaceholder.style.display = 'block';
        return;
    }
    keywordPlaceholder.style.display = 'none';
    const maxCount = Math.max(...keywords.map(k => k.count));
    for (const keyword of keywords) {
        const percentage = ((keyword.count / maxCount) * 100).toFixed(1);
        const li = document.createElement('li');
        li.className = 'keyword-item';
        li.innerHTML = `
            <div>
                <span class="keyword-text">${keyword.word}</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%"></div>
                </div>
            </div>
            <span class="keyword-count">${keyword.count}</span>
        `;
        keywordListElement.appendChild(li);
    }
}

function exportJson() {
    const text = textInput.value;
    if (!text) {
        alert('Please enter some text to export.');
        return;
    }
    const results = {
        text: text,
        metrics: {
            words: countWords(text),
            characters: countCharacters(text),
            sentences: countSentences(text),
            paragraphs: countParagraphs(text)
        },
        readability: calculateReadability(text),
        readingTime: calculateReadingTime(countWords(text)),
        speakingTime: calculateSpeakingTime(countWords(text)),
        keywords: analyzeKeywords(text)
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "text-analysis.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function exportCsv() {
    const text = textInput.value;
    if (!text) {
        alert('Please enter some text to export.');
        return;
    }
    const words = countWords(text);
    const characters = countCharacters(text);
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const readability = calculateReadability(text);
    const readingTime = calculateReadingTime(words);
    const speakingTime = calculateSpeakingTime(words);
    const keywords = analyzeKeywords(text);
    let csvContent = "Metric,Value\n";
    csvContent += `Words,${words}\n`;
    csvContent += `Characters,${characters}\n`;
    csvContent += `Sentences,${sentences}\n`;
    csvContent += `Paragraphs,${paragraphs}\n`;
    csvContent += `Readability Level,${readability}\n`;
    csvContent += `Reading Time (minutes),${readingTime}\n`;
    csvContent += `Speaking Time (minutes),${speakingTime}\n`;
    csvContent += `\nKeyword,Count\n`;
    for (const keyword of keywords) {
        csvContent += `${keyword.word},${keyword.count}\n`;
    }
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "text-analysis.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

init();