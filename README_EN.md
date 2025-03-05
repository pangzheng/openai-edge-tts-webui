# edge-tts-webui(HTML)
## Description
To test OCR functionality, text-to-speech (TTS) is needed to hear the text for verification. However, edge-tts lacks a management interface, so I found [ycyy/edge-tts-webui](https://github.com/ycyy/edge-tts-webui), which uses Gradio. Since I didn't want to install additional Python packages, I rewrote the entire project with Grok and added some features. If you have Docker, no installation is needed; just use it.

Using Docker primarily solves cross-origin issues since my edge-tts is running inside a Docker container.

## Deployment
- Deploy edge-tts
  - Pull edge-tts image:
    
    ```bash
    docker pull travisvn/openai-edge-tts:latest
    ```
  - Run edge-tts service:
    
    ```bash
    docker run -d -p 5050:5050 \
        --name open-edge-tts \
        --restart always \
        --network openwebui-network \
        -e API_KEY=b4297f4c-5795-4427-ad51-049e5c1ad215 \
        -e PORT=5050 \
        -e DEFAULT_VOICE=zh-CN-YunjianNeural \
        -e DEFAULT_RESPONSE_FORMAT=mp3 \
        -e DEFAULT_SPEED=1.0 \
        -e DEFAULT_LANGUAGE=zh_CN \
        -e REQUIRE_API_KEY=True \
        -e REMOVE_FILTER=False \
        -e EXPAND_API=True \
        travisvn/openai-edge-tts:latest
    ```

- Deploy edge-tts-webui
  - Pull nginx image:
    
    ```bash
    docker pull nginx:1.27
    ```
  - Clone the project code:
    
    ```bash
    git clone <repo-url>
    ```
  - Run edge-tts-webui on Linux:
    
    ```bash
    docker run -p 80:80 -d \
        --add-host=host.docker.internal:host-gateway \
        --name nginx-edge-tts \
        -v ./edge-tts-webui:/usr/share/nginx/html \
        -v ./edge-tts-webui/nginx-conf/nginx.conf:/etc/nginx/nginx.conf  \
        --restart always \
        nginx:1.27
    ```
  - Run edge-tts-webui on Windows:
    
    ```bash
    docker run -p 80:80 -d \
        --add-host=host.docker.internal:host-gateway \
        --name nginx-edge-tts-webui \
        -v D:\github\openai-edge-tts-webui:/usr/share/nginx/html \
        -v D:\github\openai-edge-tts-webui\nginx-conf\nginx.conf:/etc/nginx/nginx.conf  \
        --restart always \
        nginx:1.27
    ```

- Usage
  
  Access with a browser at `localhost`.

- Voice Selection
 
  Non-Chinese voices can be modified on [tts.travisvn.com](tts.travisvn.com).