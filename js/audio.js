// 全局音频对象和状态
const audioPlayer = new Audio();
const audioBuffer = []; // 存储 { url, duration }
let currentSegmentIndex = 0;
let totalCachedDuration = 0;
let isPlaying = false;

// 分割文本函数
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

// 获取单个音频分片
async function fetchAudioSegment(segment, voice, speed, format, index) {
    try {
        // 发起 POST 请求
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

        // 如果请求失败，则抛出错误
        if (!response.ok) throw new Error(`Segment ${index} failed`);
        // 获取响应的二进制数据
        const blob = await response.blob();
        // 创建临时音频对象
        const tempAudio = new Audio(URL.createObjectURL(blob));
        // 等待音频元数据加载完成
        await new Promise(resolve => tempAudio.onloadedmetadata = resolve);
        // 获取音频时长（秒）
        const duration = Math.floor(tempAudio.duration);
        // 累加总时长（秒）
        totalCachedDuration += duration; 
        return { index, blob, duration };
    } catch (error) {
        console.error(`Error fetching audio segment ${index}:`, error);
        return { index, error };
    }
}

// 并发获取音频分片
async function fetchWithConcurrency(segments, voice, speed, format, maxConcurrency) {
    // 重置总缓存时长
    totalCachedDuration = 0; 
    // 测试日志
    console.log('totalCachedDuration initialized to:', totalCachedDuration);
    // 初始化结果数组和已完成计数器
    const results = new Array(segments.length);
    let completed = 0;

    // 将分片信息打包成对象放入队列中
    const queue = segments.map((segment, index) => ({ segment, index }));
    // 使用 Set 来跟踪当前正在处理的请求数(当前并发数)
    const activeRequests = new Set();

    // 处理队列中的下一个请求
    async function processNext() {
        // 当队列不为空且当前并发请求数小于最大并发数时，继续处理请求
        while (queue.length > 0 && activeRequests.size < maxConcurrency) {
            // 从队列中取出一个分片信息和索引，并删除队列中的该项，也就是赋值
            const { segment, index } = queue.shift();
            
            // 从上面获取的分片信息和索引来发起一个异步请求来获取音频分片
            const request = fetchAudioSegment(segment, voice, speed, format, index);
            // 新增一个请求到并发中
            activeRequests.add(request);

            // 处理请求的结果
            request.then(result => {
                // 从并发中删除该请求
                activeRequests.delete(request);
                // 将结果存入结果数组中，result 是一个对象，包含了分片索引、音频数据和时长
                results[result.index] = result;
                completed++;
                
                // 如果所有分片都已完成，则调用 UI 更新进度条
                if (!result.error) {
                    // 将音频分片的 URL 和时长存入缓冲区
                    audioBuffer[result.index] = { url: URL.createObjectURL(result.blob), duration: result.duration };

                    // 测试日志
                    console.log('totalCachedDuration updated:', totalCachedDuration);
                    
                    window.totalCachedDuration = totalCachedDuration;
                    
                    
                    // 当第一个分片准备好时，显示输出组
                    if (completed === 1) {
                        audioPlayer.src = audioBuffer[0].url;
                        document.getElementById('output-group').style.display = 'block';
                    }

                    // 所有分片都完成后启用下载按钮
                    if (completed === segments.length) {
                        document.getElementById('download-btn').disabled = false; // 全部完成时启用下载
                    }
                }

                // 继续处理下一个请求
                processNext();
            });
        }
    }

    // 开始处理队列中的请求
    await processNext();
    // 返回所有请求的结果
    return Promise.all([...activeRequests]);
}

// 格式化时间
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// 更新时间和进度条
function updateTimeAndProgress() {
    // 计算当前时间和总时间=返回当前播放器时间
    const currentTime = Math.floor(audioPlayer.currentTime) +
        // 注意这里使用了 item 而不是 url
        audioBuffer.slice(0, currentSegmentIndex).reduce((sum, item) => { 
            // 直接从 audioBuffer 中获取 duration
            return sum + (item.duration || 0);
        }, 0);

    // 计算总分段数    
    const totalSegments = document.getElementById('text-area').value ? 
        splitText(document.getElementById('text-area').value, parseInt(document.getElementById('split-slider').value)).length : 0;
    
    // 更新时间显示    
    document.getElementById('time-display').textContent = 
        `${formatTime(currentTime)} / ${formatTime(totalCachedDuration)} (${audioBuffer.length}/${totalSegments})`;
   
}

// 处理音频结束事件
function handleAudioEnded() {
    if (currentSegmentIndex + 1 < audioBuffer.length) {
        currentSegmentIndex++;
        audioPlayer.src = audioBuffer[currentSegmentIndex].url;
        audioPlayer.play();
    } else {
        document.getElementById('play-pause-btn').textContent = '▶️';
        isPlaying = false;
        currentSegmentIndex = 0;
    }
}

// 暴露全局函数和变量
window.audioPlayer = audioPlayer;
window.audioBuffer = audioBuffer;
window.currentSegmentIndex = currentSegmentIndex;
window.isPlaying = isPlaying;
window.splitText = splitText;
window.fetchWithConcurrency = fetchWithConcurrency;
window.formatTime = formatTime;
window.updateTimeAndProgress = updateTimeAndProgress;
window.handleAudioEnded = handleAudioEnded;