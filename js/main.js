// 初始化函数
function init() {
    // 初始化音频播放器音量
    window.audioPlayer.volume = 0.6;
    document.getElementById('volume-icon').textContent = '🔊';

    // 初始化示例音频
    window.updateExampleAudio();

    // 初始化语言
    window.updateLanguage('en');

    // 初始化事件监听
    document.addEventListener('DOMContentLoaded', () => {
        updateLanguage('en'); // 默认英文
        document.getElementById('lang-toggle').addEventListener('click', () => {
            updateLanguage(currentLang === 'en' ? 'zh' : 'en');
        });
    });

    // 初始化字符计数和分割值
    document.getElementById('char-count').textContent = document.getElementById('text-area').value.length;
    document.getElementById('split-value').textContent = `${document.getElementById('split-slider').value} `;

    // 设置音频播放结束事件
    window.audioPlayer.onended = window.handleAudioEnded;

    // 设置音频时间更新事件
    window.audioPlayer.ontimeupdate = window.updateTimeAndProgress;
}

// 在页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', init);