 #/bin/bash
 docker run --add-host=host.docker.internal:host-gateway --name nginx-edge-tts -v ./openai-edge-tts-webui:/usr/share/nginx/html -v ./openai-edge-tts-webui/nginx-conf/nginx.conf:/etc/nginx/nginx.conf --restart always -p 80:80 -d nginx:1.27