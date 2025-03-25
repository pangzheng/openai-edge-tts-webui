// 国际化语言包
const translations = {
    en: {
        title: "Text to Speech",
        subtitle: "Convert text using edge-tts",
        text: "Text",
        placeholder: "Please enter the text to convert",
        output: "Output",
        generate: "Generate",
        voice: "Voice",
        voiceHint: "Please select a voice",
        preview: "Preview",
        play: "Play",
        stop: "Stop",
        speed: "Speed Adjustment",
        speedHint: "Range -100% to +100% (default 0%)",
        splitLength: "Split Length",
        splitHint: "Range 200 to 1000 characters (default 200)",
        concurrency: "Concurrency",
        concurrencyHint: "Number of concurrent requests (default 1)",
        format: "Output Format",
        formatHint: "Select audio output format",
        xiaoxxiaoiao: "Xiaoxiao",
        xiaoyi: "Xiaoyi",
        yunjian: "Yunjian",
        yunxi: "Yunxi",
        yunxia: "Yunxia",
        yunyang: "Yunyang",
        xiaobei: "Xiaobei (Liaoning)",
        xiaoni: "Xiaoni (Shaanxi)"
    },
    zh: {
        title: "文本转语音",
        subtitle: "调用edge-tts进行转换",
        text: "文本",
        placeholder: "请输入要转换的文本",
        output: "输出",
        generate: "生成",
        voice: "发音",
        voiceHint: "请选择发音人",
        preview: "试听",
        play: "播放",
        stop: "停止",
        speed: "语速增减",
        speedHint: "范围 -100% 到 +100% (默认 0%)",
        splitLength: "分割长度",
        splitHint: "范围 200 到 1000 字符 (默认 200)",
        concurrency: "并发数",
        concurrencyHint: "并发请求数量 (默认 1)",
        format: "输出格式",
        formatHint: "选择音频输出格式",
        xiaoxiao: "晓晓",
        xiaoyi: "晓伊",
        yunjian: "云健",
        yunxi: "云希",
        yunxia: "云夏",
        yunyang: "云扬",
        xiaobei: "晓北（辽宁）",
        xiaoni: "晓妮（陕西）"
    }
};

let currentLang = 'en';

// 更新界面语言
function updateLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'TEXTAREA') {
            element.placeholder = translations[lang][key];
        } else {
            element.textContent = translations[lang][key];
        }
    });
    document.getElementById('lang-toggle').textContent = lang === 'en' ? '中文' : 'English';
    document.getElementById('advanced-btn').textContent = lang === 'en' ? 'Setting' : '设置';
    document.title = translations[lang].title;
}

// DOM元素引用
const voiceSelect = document.getElementById('voices');
const rateSlider = document.getElementById('rate-slider');
const rateValue = document.getElementById('rate-value');
const splitSlider = document.getElementById('split-slider');
const splitValue = document.getElementById('split-value');
const concurrencySelect = document.getElementById('concurrency');
const playExampleBtn = document.getElementById('play-example');
const stopExampleBtn = document.getElementById('stop-example');
const submitBtn = document.getElementById('submit-btn');
const textarea = document.getElementById('text-area');
const langToggleBtn = document.getElementById('lang-toggle');
const advancedBtn = document.getElementById('advanced-btn');
const advancedSettings = document.getElementById('advanced-settings');
const charCount = document.getElementById('char-count');
const outputAudio = document.getElementById('output-audio');
const outputGroup = document.getElementById('output-group');
const progressDisplay = document.getElementById('progress');
const loadingOverlay = document.getElementById('loading-overlay');
const exampleAudio = new Audio();

const allButtons = [submitBtn, playExampleBtn, stopExampleBtn];
const audioBuffer = [];
let currentIndex = 0;

function updateExampleAudio() {
    const selectedVoice = voiceSelect.value;
    exampleAudio.src = `example/${selectedVoice}.wav`;
}

function toggleButtons(disabled) {
    allButtons.forEach(button => button.disabled = disabled);
}

function splitText(text, maxLength) {
    const segments = [];
    let start = 0;
    while (start < text.length) {
        let end = Math.min(start + maxLength, text.length);
        if (end < text.length) {
            while (end > start && !/[.!?]/.test(text[end])) end--;
            if (end === start) end = start + maxLength;
        }
        segments.push(text.slice(start, end).trim());
        start = end + 1;
    }
    return segments;
}

async function fetchAudioSegment(segment, voice, speed, format, index) {
    try {
        const response = await fetch('http://localhost/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer b4297f4c-5795-4427-ad51-049e5c1ad215'
            },
            body: JSON.stringify({
                input: segment,
                voice,
                speed,
                response_format: format
            })
        });
        if (!response.ok) throw new Error(`Segment ${index} failed`);
        return { index, blob: await response.blob() };
    } catch (error) {
        console.error(error);
        return { index, error };
    }
}

async function fetchWithConcurrency(segments, voice, speed, format, maxConcurrency) {
    const results = new Array(segments.length);
    let completed = 0;
    const queue = segments.map((segment, index) => ({ segment, index }));
    const activeRequests = new Set();

    async function processNext() {
        while (queue.length > 0 && activeRequests.size < maxConcurrency) {
            const { segment, index } = queue.shift();
            const request = fetchAudioSegment(segment, voice, speed, format, index);
            activeRequests.add(request);

            request.then(result => {
                activeRequests.delete(request);
                results[result.index] = result;
                completed++;
                updateProgress(completed, segments.length);
                if (!result.error) {
                    audioBuffer[result.index] = URL.createObjectURL(result.blob);
                    if (completed === 1) {
                        outputAudio.src = audioBuffer[0];
                        outputAudio.play();
                        outputGroup.style.display = 'block';
                    }
                }
                processNext();
            });
        }
    }

    await processNext();
    return Promise.all([...activeRequests]);
}

function updateProgress(completed, total) {
    progressDisplay.textContent = currentLang === 'en' 
        ? `Buffered ${completed}/${total} segments` 
        : `已缓冲 ${completed}/${total} 段`;
}

// 事件监听器
langToggleBtn.addEventListener('click', () => {
    updateLanguage(currentLang === 'en' ? 'zh' : 'en');
});

advancedBtn.addEventListener('click', () => {
    advancedSettings.classList.toggle('open'); // 切换高级设置的显示状态
});

voiceSelect.addEventListener('change', updateExampleAudio);

playExampleBtn.addEventListener('click', () => {
    updateExampleAudio();
    exampleAudio.play();
});

stopExampleBtn.addEventListener('click', () => {
    exampleAudio.pause();
    exampleAudio.currentTime = 0;
});

rateSlider.addEventListener('input', function() {
    rateValue.textContent = `${this.value}%`;
});

splitSlider.addEventListener('input', function() {
    splitValue.textContent = `${this.value} 字符`;
});

textarea.addEventListener('input', function() {
    charCount.textContent = this.value.length;
});

submitBtn.addEventListener('click', async () => {
    const inputText = textarea.value;
    if (!inputText.trim()) {
        alert(currentLang === 'en' ? 'Please enter text content' : '请输入文本内容');
        return;
    }

    exampleAudio.pause();
    exampleAudio.currentTime = 0;
    loadingOverlay.style.display = 'flex';
    toggleButtons(true);
    audioBuffer.length = 0;
    currentIndex = 0;
    outputGroup.style.display = 'none';
    advancedSettings.classList.remove('open'); // 生成时关闭高级设置

    const splitLength = parseInt(splitSlider.value);
    const segments = splitText(inputText, splitLength);
    const voice = voiceSelect.value;
    const speed = 1 + (parseInt(rateSlider.value) / 100);
    const format = document.getElementById('format').value;
    const maxConcurrency = parseInt(concurrencySelect.value);

    updateProgress(0, segments.length);
    await fetchWithConcurrency(segments, voice, speed, format, maxConcurrency);

    outputAudio.onended = () => {
        if (currentIndex + 1 < audioBuffer.length && audioBuffer[currentIndex + 1]) {
            currentIndex++;
            outputAudio.src = audioBuffer[currentIndex];
            outputAudio.play();
        }
    };

    loadingOverlay.style.display = 'none';
    toggleButtons(false);
});


// 初始化
updateExampleAudio();
updateLanguage('en');
charCount.textContent = textarea.value.length;
splitValue.textContent = `${splitSlider.value} `;