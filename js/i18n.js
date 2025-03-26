// 国际化语言包
const translations = {
    en: {
        title: "Text to Speech",
        subtitle: "Convert text using edge-tts",
        text: "Text",
        placeholder: "Please enter the text to convert",
        output: "Output(Cached)",
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
        xiaoxiao: "Xiaoxiao",
        xiaoyi: "Xiaoyi",
        yunjian: "Yunjian",
        yunxi: "Yunxi",
        yunxia: "Yunxia",
        yunyang: "Yunyang",
        xiaobei: "Xiaobei (Liaoning)",
        xiaoni: "Xiaoni (Shaanxi)",
        playTooltip: "Click to play", // 新增播放提示
        downloadTooltip: "Click to download" // 新增下载提示
    },
    zh: {
        title: "文本转语音",
        subtitle: "调用edge-tts进行转换",
        text: "文本",
        placeholder: "请输入要转换的文本",
        output: "输出(已缓存)",
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
        xiaoni: "晓妮（陕西）",
        playTooltip: "点击播放", // 新增播放提示
        downloadTooltip: "点击下载" // 新增下载提示
    }
};

// 当前语言，默认英文
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

    // 更新 tooltip
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        const key = element.getAttribute('data-tooltip');
        element.setAttribute('title', translations[lang][key]);
    });
    
    document.getElementById('lang-toggle').textContent = lang === 'en' ? '中文' : 'English';
    document.getElementById('advanced-btn').textContent = lang === 'en' ? 'Setting' : '设置';
    document.title = translations[lang].title;
}

// 暴露全局变量和函数供其他模块使用
window.translations = translations;
window.currentLang = currentLang;
window.updateLanguage = updateLanguage;