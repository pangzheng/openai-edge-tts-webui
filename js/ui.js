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
const playPauseBtn = document.getElementById('play-pause-btn');
const textarea = document.getElementById('text-area');
const langToggleBtn = document.getElementById('lang-toggle');
const advancedBtn = document.getElementById('advanced-btn');
const advancedSettings = document.getElementById('advanced-settings');
const charCount = document.getElementById('char-count');
const outputGroup = document.getElementById('output-group');
const loadingOverlay = document.getElementById('loading-overlay');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
const downloadBtn = document.getElementById('download-btn');

// 示例音频
const exampleAudio = new Audio();

// 按钮数组
const allButtons = [submitBtn, playExampleBtn, stopExampleBtn, playPauseBtn, downloadBtn];

// 更新示例音频
function updateExampleAudio() {
    const selectedVoice = voiceSelect.value;
    exampleAudio.src = `example/${selectedVoice}.wav`;
}

// 切换按钮状态
function toggleButtons(disabled) {
    allButtons.forEach(button => button.disabled = disabled);
}

// 事件监听器
langToggleBtn.addEventListener('click', () => {
    window.updateLanguage(currentLang === 'en' ? 'zh' : 'en');
});

advancedBtn.addEventListener('click', () => {
    advancedSettings.classList.toggle('open');
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

// 当用户点击生成按钮时执行的操作
submitBtn.addEventListener('click', async () => {
    // 获取用户输入的文本并去除首尾空白字符
    const inputText = textarea.value.trim();

    // 如果没有输入文本，则显示提示信息并返回
    if (!inputText) {
        alert(currentLang === 'en' ? 'Please enter text content' : '请输入文本内容');
        return;
    }

    // 停止示例音频的播放，并重置当前时间
    exampleAudio.pause();
    exampleAudio.currentTime = 0;

    // 显示加载指示器
    loadingOverlay.style.display = 'flex';

    // 禁用所有按钮以防止用户重复点击
    toggleButtons(true);

    // 清空缓冲区，重新开始生成音频
    window.audioBuffer.length = 0;
    window.currentSegmentIndex = 0;
    window.isPlaying = false;

    // 将播放暂停按钮的文本重置为“▶️”
    playPauseBtn.textContent = '▶️';

    // 获取分段长度并分割文本
    const splitLength = parseInt(splitSlider.value);
    const segments = window.splitText(inputText, splitLength);

    // 从语音选择器中获取选定的声音
    const voice = voiceSelect.value;

    // 计算播放速度，基于速率滑块的值
    const speed = 1 + (parseInt(rateSlider.value) / 100);
    // 获取格式设置（例如 MP3 或 WAV）
    const format = document.getElementById('format').value;
    // 设置最大并发数
    const maxConcurrency = parseInt(concurrencySelect.value);

    // 开始异步请求来生成音频分片
    await window.fetchWithConcurrency(segments, voice, speed, format, maxConcurrency);

    // 生成完成后自动播放
    window.audioPlayer.play();
    playPauseBtn.textContent = '⏸️';
    window.isPlaying = true;
    
    // 隐藏加载指示器
    loadingOverlay.style.display = 'none';
    // 重新启用所有按钮
    toggleButtons(false);
});

playPauseBtn.addEventListener('click', () => {
    if (window.audioBuffer.length === 0) {
        alert(currentLang === 'en' ? 'Please generate audio first' : '请先生成音频');
        return;
    }

    if (!window.isPlaying) {
        window.audioPlayer.play();
        playPauseBtn.textContent = '⏸️';
        window.isPlaying = true;
    } else {
        window.audioPlayer.pause();
        playPauseBtn.textContent = '▶️';
        window.isPlaying = false;
    }
});

volumeSlider.addEventListener('input', () => {
    window.audioPlayer.volume = volumeSlider.value / 100;
    volumeIcon.textContent = window.audioPlayer.volume === 0 ? '🔇' : '🔊';
});

downloadBtn.addEventListener('click', async  () => {
    // 获取用户选择的格式
    const format = document.getElementById('format').value;
    // 生成时间戳
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    // 创建 Blob 对象  
    const blobs = await Promise.all(window.audioBuffer.map(async item => {
        // 发起请求并返回 Blob 对象
        const response = await fetch(item.url);
        // 返回 Blob 对象
        return response.blob();
    }));
    // 创建 Blob 对象
    const mergedBlob = new Blob(blobs, { type: `audio/${format}` });
    // 创建下载链接并模拟点击
    const url = URL.createObjectURL(mergedBlob);
    // 创建一个 a 标签
    const a = document.createElement('a');
    // 设置 a 标签的属性
    a.href = url;
    //  设置下载属性
    a.download = `speech_${timestamp}.${format}`;
    // 模拟点击
    a.click();
    URL.revokeObjectURL(url);
});

// 暴露全局函数供其他模块使用
window.toggleButtons = toggleButtons;