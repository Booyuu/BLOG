// === BOYU | 星际音频核心 V9.1 (手机端适配版) ===

document.addEventListener("DOMContentLoaded", () => {

    // 1. 智能路径修正 (兼容子页面)
    const path = window.location.pathname;
    const subFolders = ['/blog/', '/travel/', '/media/'];
    const isSubPage = subFolders.some(folder => path.includes(folder));
    const pathPrefix = isSubPage ? '../' : '';

    // === ⚡️ 自动注入播放器 HTML ===
    function injectAudioPlayer() {
        const slot = document.getElementById('audio-slot');
        if (!slot) return;

        slot.innerHTML = `
            <div class="relative group font-mono" id="audio-console">
                <div class="relative">
                    <button id="music-trigger" class="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-pointer pointer-events-auto" onclick="window.toggleMainPlayback()">
                        <div class="flex items-end gap-[2px] h-3" id="master-wave">
                            <div class="wave-bar w-[2px] h-1 bg-white"></div>
                            <div class="wave-bar w-[2px] h-2 bg-white"></div>
                            <div class="wave-bar w-[2px] h-1.5 bg-white"></div>
                            <div class="wave-bar w-[2px] h-3 bg-white"></div>
                        </div>
                        <div class="flex flex-col leading-none text-left">
                            <span class="text-[10px] tracking-widest text-white truncate max-w-[120px]" id="current-track-name">AUDIO OFF</span>
                            <span id="time-display" class="text-[8px] text-dim mt-1 hidden">0:00 / 0:00</span>
                        </div>
                    </button>
                    <div id="progress-container" class="absolute bottom-[-5px] left-0 w-full h-[2px] bg-white/20 cursor-pointer hidden hover:h-[4px] transition-all z-50">
                        <div id="progress-bar" class="h-full bg-accent-blue w-0 relative">
                            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#00f3ff] opacity-0 group-hover:opacity-100"></div>
                        </div>
                    </div>
                </div>
                
                <div class="absolute top-full left-0 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 pointer-events-none group-hover:pointer-events-auto">
                    <div class="bg-black/95 backdrop-blur-xl border border-white/20 p-2 flex flex-col gap-1 shadow-2xl">
                        <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent-blue"></div>
                        <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent-blue"></div>
                        <div id="playlist-container"></div>
                    </div>
                </div>
            </div>
            <audio id="global-audio"></audio>
        `;
    }
    injectAudioPlayer();

    // --- 播放列表 (确保 mp3 文件存在) ---
    const playlist = [
        { title: "Saman", artist: "Ólafur Arnalds", src: "assets/Saman.mp3" },
        { title: "Oceans", artist: "Ólafur Arnalds", src: "assets/Oceans.mp3" },
        { title: "Loom", artist: "Ólafur Arnalds", src: "assets/Loom.mp3" },
        { title: "My Only Girl", artist: "方大同", src: "assets/MyOnlyGirl.mp3" }
    ];

    const audio = document.getElementById('global-audio');
    if (!audio) return; 

    const masterWave = document.getElementById('master-wave');
    const trackNameDisplay = document.getElementById('current-track-name');
    const timeDisplay = document.getElementById('time-display');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const playlistContainer = document.getElementById('playlist-container');

    let currentTrackIndex = 0;
    let isDragging = false;
    audio.volume = 0.5;

    // === 初始化状态 ===
    function initAudioState() {
        const savedIndex = localStorage.getItem('audio_index');
        const savedTime = localStorage.getItem('audio_time');
        const savedPlaying = localStorage.getItem('audio_playing') === 'true';

        if (savedIndex !== null) {
            currentTrackIndex = parseInt(savedIndex);
            audio.src = pathPrefix + playlist[currentTrackIndex].src;
        } else {
            audio.src = pathPrefix + playlist[0].src;
        }

        if (savedTime) audio.currentTime = parseFloat(savedTime);

        renderPlaylist();

        // 尝试恢复播放 (如果之前在放)
        if (savedPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    updateUIState(true);
                }).catch(() => {
                    // 如果自动播放失败（手机端常态），静默暂停，等待用户点击
                    console.log("Auto-play blocked by browser policy.");
                    updateUIState(false);
                });
            }
        } else {
            updateUIState(false);
        }
    }

    window.addEventListener('pagehide', () => {
        localStorage.setItem('audio_index', currentTrackIndex);
        localStorage.setItem('audio_time', audio.currentTime);
        localStorage.setItem('audio_playing', !audio.paused);
    });

    // === 渲染播放列表 ===
    function renderPlaylist() {
        if (!playlistContainer) return;
        playlistContainer.innerHTML = '';
        playlist.forEach((track, index) => {
            const div = document.createElement('div');
            div.className = `track-item relative group/item border-b border-white/5 transition-colors hover:bg-white/5`;
            div.innerHTML = `
                <div class="flex items-center gap-4 p-3 cursor-pointer" onclick="window.playTrack(${index})">
                    <div class="text-dim text-xs font-mono w-4">0${index + 1}</div>
                    <div class="flex-1">
                        <div class="text-white font-serif text-sm tracking-wide track-title">${track.title}</div>
                        <div class="text-dim text-[10px] font-mono mt-0.5">${track.artist}</div>
                    </div>
                    <div class="w-6 flex justify-center text-accent-blue transition-opacity opacity-0 group-hover/item:opacity-50 icon-box">
                        <i class="ri-play-fill track-icon text-lg"></i>
                    </div>
                </div>
            `;
            playlistContainer.appendChild(div);
        });
        setTimeout(() => updateUIState(!audio.paused), 50);
    }

    // === 核心播放控制 (包含手机端修复) ===
    window.toggleMainPlayback = function () {
        if (audio.paused) {
            // 给用户一个正在加载的反馈
            if(trackNameDisplay) trackNameDisplay.innerText = "LOADING...";
            
            // 确保有音频源
            if (!audio.src || audio.src === window.location.href) {
                audio.src = pathPrefix + playlist[currentTrackIndex].src;
            }

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    updateUIState(true);
                }).catch(error => {
                    console.error("Play error:", error);
                    if(trackNameDisplay) trackNameDisplay.innerText = "TAP TO PLAY";
                    // 手机端常见错误：用户没交互
                    alert("Audio Blocked: Please interact with the page or check mute switch.");
                });
            }
        } else {
            audio.pause();
            updateUIState(false);
        }
    };

    window.playTrack = function (index) {
        if (currentTrackIndex === index && !audio.paused) {
            audio.pause(); 
            updateUIState(false);
        } else {
            if(trackNameDisplay) trackNameDisplay.innerText = "LOADING...";
            currentTrackIndex = index;
            audio.src = pathPrefix + playlist[index].src;
            audio.play().then(() => updateUIState(true)).catch(console.error);
        }
    };

    // === UI 状态更新 ===
    function updateUIState(isPlaying) {
        const track = playlist[currentTrackIndex];
        
        // 更新文字
        if (trackNameDisplay) {
            trackNameDisplay.innerHTML = isPlaying 
                ? `<span class="text-accent-blue">PLAYING:</span> ${track.title.toUpperCase()}` 
                : "AUDIO PAUSED";
        }

        // 更新波形动画
        if (masterWave) {
            if (isPlaying) {
                masterWave.classList.add('playing');
                // 动态波形
                masterWave.innerHTML = `
                    <div class="wave-bar w-[2px] h-1 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate]"></div>
                    <div class="wave-bar w-[2px] h-2 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.1s]"></div>
                    <div class="wave-bar w-[2px] h-1.5 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.2s]"></div>
                    <div class="wave-bar w-[2px] h-3 bg-accent-blue animate-[sound-wave_0.8s_infinite_alternate_0.3s]"></div>
                `;
            } else {
                masterWave.classList.remove('playing');
                // 静态白条
                masterWave.innerHTML = `
                    <div class="wave-bar w-[2px] h-1 bg-white"></div>
                    <div class="wave-bar w-[2px] h-2 bg-white"></div>
                    <div class="wave-bar w-[2px] h-1.5 bg-white"></div>
                    <div class="wave-bar w-[2px] h-3 bg-white"></div>
                `;
            }
        }

        // 显隐进度条
        if (timeDisplay) {
            isPlaying ? timeDisplay.classList.remove('hidden') : timeDisplay.classList.add('hidden');
        }
        if (progressContainer) {
            isPlaying ? progressContainer.classList.remove('hidden') : progressContainer.classList.add('hidden');
        }

        // 更新列表选中状态
        document.querySelectorAll('.track-item').forEach((item, index) => {
            const title = item.querySelector('.track-title');
            const iconBox = item.querySelector('.icon-box');
            const icon = item.querySelector('.track-icon');
            if (index === currentTrackIndex) {
                title?.classList.add('text-accent-blue');
                iconBox?.classList.remove('opacity-0'); iconBox?.classList.add('opacity-100');
                if (icon) icon.className = isPlaying ? 'ri-pause-fill track-icon text-lg' : 'ri-play-fill track-icon text-lg';
            } else {
                title?.classList.remove('text-accent-blue');
                iconBox?.classList.remove('opacity-100'); iconBox?.classList.add('opacity-0');
                if (icon) icon.className = 'ri-play-fill track-icon text-lg';
            }
        });
    }

    // === 进度条逻辑 ===
    function formatTime(s) { return isNaN(s) ? "0:00" : Math.floor(s / 60) + ":" + (Math.floor(s % 60) < 10 ? '0' : '') + Math.floor(s % 60); }

    audio.addEventListener('timeupdate', () => {
        if (!isDragging && progressBar) {
            progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            if (timeDisplay) timeDisplay.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });

    if (progressContainer) {
        progressContainer.addEventListener('mousedown', (e) => { e.stopPropagation(); isDragging = true; });
        progressContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = progressContainer.getBoundingClientRect();
            audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const rect = progressContainer.getBoundingClientRect();
                const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                progressBar.style.width = `${percent * 100}%`;
            }
        });
        document.addEventListener('mouseup', (e) => {
            if (isDragging) { isDragging = false; }
        });
    }

    audio.addEventListener('ended', () => {
        let next = (currentTrackIndex + 1) % playlist.length;
        window.playTrack(next);
    });

    // 启动！
    initAudioState();
});