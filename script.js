/**
 * 🌸 March 8th Romantic Surprise Website - script.js
 */

/* =====================================================================
   🌸 GLOBAL HANDLERS — called from inline onclick in HTML
   ===================================================================== */

let _envelopeOpened = false;

window.handleEnvelopeClick = function () {
  if (_envelopeOpened) return;
  _envelopeOpened = true;

  const envelope     = document.getElementById('envelope');
  const envelopeWrap = document.getElementById('envelopeWrap');
  const letterContent = document.getElementById('letterContent');
  const letterBody   = document.getElementById('letterBody');

  envelope.classList.add('open');

  setTimeout(() => {
    envelopeWrap.style.transition = 'all 0.5s ease';
    envelopeWrap.style.opacity    = '0';
    envelopeWrap.style.transform  = 'translateY(-20px) scale(0.95)';

    setTimeout(() => {
      envelopeWrap.style.display = 'none';
      letterContent.classList.add('visible');
      startTyping(letterBody, LETTER_TEXT);
    }, 500);
  }, 900);
};

window.handleGiftOpen = function () {
  const giftBox   = document.getElementById('giftBox');
  const giftModal = document.getElementById('giftModal');

  if (giftBox) giftBox.classList.add('opening');

  setTimeout(() => {
    if (giftModal) {
      giftModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    startConfetti();
    launchFloatingHearts();
  }, 500);
};

/* =====================================================================
   🌸 SECTION 1: INITIALIZATION & UTILITIES
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFloatingDecor();
  initNavbar();
  initMusicPlayer();
  initEnvelopeLetter();
  initGallery();
  initGift();
  initScrollAnimations();
  initFooterHearts();
});

/** Debounce utility */
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

/** Format seconds to m:ss */
function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/* =====================================================================
   🌸 SECTION 2: FLOATING DECORATIONS
   ===================================================================== */

function initFloatingDecor() {
  const container = document.getElementById('floatingDecor');
  if (!container) return;

  const items = ['🌸', '💗', '🌺', '✨', '💕', '🦋', '🌷', '💝', '⭐', '🌼'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.classList.add('float-item');
    el.textContent = items[Math.floor(Math.random() * items.length)];

    const startX = Math.random() * 100;
    const duration = 12 + Math.random() * 20;
    const delay = Math.random() * -20;
    const size = 0.8 + Math.random() * 1.2;

    el.style.cssText = `
      left: ${startX}%;
      font-size: ${size}rem;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(el);
  }
}

/* =====================================================================
   🌸 SECTION 3: NAVBAR
   ===================================================================== */

function initNavbar() {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');

  // Scroll effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links?.classList.toggle('open');
  });

  // Close on link click
  links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle?.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

/* =====================================================================
   🌸 SECTION 4: MUSIC PLAYER
   ===================================================================== */

/**
 * Playlist – using free, royalty-free/demo tracks.
 * Since we can't bundle real audio files, we use a demo approach:
 * The player UI is fully functional; swap `src` with actual MP3 paths.
 */
const PLAYLIST = [
  {
    name: 'A Thousand Years',
    artist: 'Christina Perri',
    emoji: '🌹',
    src: '',          // 👉 Replace with: 'music/song1.mp3'
    color: '#ffb3d1',
  },
  {
    name: 'Perfect',
    artist: 'Ed Sheeran',
    emoji: '💗',
    src: '',
    color: '#ffd6e8',
  },
  {
    name: 'All of Me',
    artist: 'John Legend',
    emoji: '🌸',
    src: '',
    color: '#fce4ec',
  },
  {
    name: 'Can\'t Help Falling in Love',
    artist: 'Elvis Presley',
    emoji: '🎶',
    src: '',
    color: '#f8bbd0',
  },
  {
    name: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    emoji: '✨',
    src: '',
    color: '#ffb3d1',
  },
];

let currentTrack = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isDragging = false;

function initMusicPlayer() {
  const audio = document.getElementById('audioPlayer');
  const btnPlay = document.getElementById('btnPlay');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnShuffle = document.getElementById('btnShuffle');
  const btnRepeat = document.getElementById('btnRepeat');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');
  const timeCurrent = document.getElementById('timeCurrent');
  const timeTotal = document.getElementById('timeTotal');
  const volumeSlider = document.getElementById('volumeSlider');
  const playlistEl = document.getElementById('playlist');
  const albumArt = document.getElementById('albumArt');
  const albumArtInner = albumArt?.querySelector('.album-art-inner');
  const albumEmoji = document.getElementById('albumEmoji');
  const trackName = document.getElementById('trackName');
  const trackArtist = document.getElementById('trackArtist');

  if (!audio || !btnPlay) return;

  // Build playlist UI
  buildPlaylist(playlistEl);

  // Load first track
  loadTrack(currentTrack);

  // --- Play / Pause ---
  btnPlay.addEventListener('click', togglePlay);

  function togglePlay() {
    if (PLAYLIST[currentTrack].src) {
      if (isPlaying) pauseTrack();
      else playTrack();
    } else {
      // Demo mode: simulate playing without real audio
      isPlaying = !isPlaying;
      updatePlayBtn();
      if (isPlaying) {
        albumArtInner?.classList.add('spinning');
        albumEmoji?.classList.add('spinning');
        simulateProgress();
      } else {
        albumArtInner?.classList.remove('spinning');
        albumEmoji?.classList.remove('spinning');
        stopSimulate();
      }
    }
  }

  function playTrack() {
    audio.play().then(() => {
      isPlaying = true;
      updatePlayBtn();
      albumArtInner?.classList.add('spinning');
      albumEmoji?.classList.add('spinning');
    }).catch(() => {
      // Autoplay blocked - that's ok
    });
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updatePlayBtn();
    albumArtInner?.classList.remove('spinning');
    albumEmoji?.classList.remove('spinning');
  }

  function updatePlayBtn() {
    btnPlay.textContent = isPlaying ? '⏸️' : '▶️';
  }

  // --- Next / Prev ---
  btnNext.addEventListener('click', nextTrack);
  btnPrev.addEventListener('click', prevTrack);

  function nextTrack() {
    if (isShuffle) {
      let r;
      do { r = Math.floor(Math.random() * PLAYLIST.length); } while (r === currentTrack && PLAYLIST.length > 1);
      currentTrack = r;
    } else {
      currentTrack = (currentTrack + 1) % PLAYLIST.length;
    }
    loadAndPlay(currentTrack);
  }

  function prevTrack() {
    currentTrack = (currentTrack - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadAndPlay(currentTrack);
  }

  function loadAndPlay(idx) {
    loadTrack(idx);
    if (isPlaying) {
      if (PLAYLIST[idx].src) playTrack();
      else simulateProgress(true);
    }
  }

  // --- Shuffle / Repeat ---
  btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active-state', isShuffle);
    btnShuffle.style.opacity = isShuffle ? '1' : '0.5';
  });
  btnRepeat.addEventListener('click', () => {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle('active-state', isRepeat);
    btnRepeat.style.opacity = isRepeat ? '1' : '0.5';
    if (audio) audio.loop = isRepeat;
  });

  // --- Progress Bar ---
  audio.addEventListener('timeupdate', () => {
    if (!isDragging) updateProgress();
  });

  audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (!isRepeat) nextTrack();
  });

  progressBar.addEventListener('click', seek);
  progressBar.addEventListener('mousedown', () => { isDragging = true; });
  window.addEventListener('mousemove', (e) => { if (isDragging) seekFromEvent(e, progressBar); });
  window.addEventListener('mouseup', () => { isDragging = false; });
  progressBar.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
  window.addEventListener('touchmove', (e) => { if (isDragging) seekFromEvent(e.touches[0], progressBar); }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  function seek(e) {
    seekFromEvent(e, progressBar);
  }

  function seekFromEvent(e, bar) {
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) audio.currentTime = ratio * audio.duration;
    updateProgressByRatio(ratio);
  }

  function updateProgress() {
    if (!audio.duration) return;
    const ratio = audio.currentTime / audio.duration;
    updateProgressByRatio(ratio);
    timeCurrent.textContent = formatTime(audio.currentTime);
  }

  function updateProgressByRatio(ratio) {
    const pct = ratio * 100;
    progressFill.style.width = `${pct}%`;
    progressThumb.style.left = `${pct}%`;
  }

  // --- Volume ---
  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value;
  });
  audio.volume = volumeSlider.value;

  // --- Load Track ---
  function loadTrack(idx) {
    const track = PLAYLIST[idx];
    if (!track) return;

    if (track.src) {
      audio.src = track.src;
      audio.load();
    }

    // Update UI
    trackName.textContent = track.name;
    trackArtist.textContent = track.artist;
    albumEmoji.textContent = track.emoji;
    albumArt.querySelector('.album-art-inner').style.background =
      `linear-gradient(135deg, ${track.color}, var(--pink-main))`;

    // Update playlist highlight
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
      item.classList.toggle('playing', i === idx);
    });

    // Reset progress
    updateProgressByRatio(0);
    timeCurrent.textContent = '0:00';
    timeTotal.textContent = '0:00';

    // Reset simulate
    stopSimulate();
  }

  // --- Playlist Build ---
  function buildPlaylist(el) {
    el.innerHTML = '';
    PLAYLIST.forEach((track, i) => {
      const li = document.createElement('li');
      li.classList.add('playlist-item');
      li.dataset.index = i;
      li.innerHTML = `
        <span class="pl-num">${i + 1}</span>
        <span class="pl-playing-icon">▶</span>
        <div class="pl-info">
          <span class="pl-name">${track.emoji} ${track.name}</span>
          <span class="pl-artist">${track.artist}</span>
        </div>
      `;
      li.addEventListener('click', () => {
        currentTrack = i;
        loadTrack(i);
        isPlaying = true;
        updatePlayBtn();
        if (track.src) playTrack();
        else { albumArtInner?.classList.add('spinning'); albumEmoji?.classList.add('spinning'); simulateProgress(true); }
      });
      el.appendChild(li);
    });
  }

  // --- Demo Simulate Progress (no real audio) ---
  let simInterval = null;
  let simTime = 0;
  const simDuration = 210; // 3.5 min demo

  function simulateProgress(reset = false) {
    if (reset) simTime = 0;
    stopSimulate();
    simInterval = setInterval(() => {
      simTime += 0.5;
      if (simTime >= simDuration) {
        simTime = 0;
        if (!isRepeat) { stopSimulate(); nextTrack(); return; }
      }
      const ratio = simTime / simDuration;
      updateProgressByRatio(ratio);
      timeCurrent.textContent = formatTime(simTime);
      timeTotal.textContent = formatTime(simDuration);
    }, 500);
  }

  function stopSimulate() {
    clearInterval(simInterval);
    simInterval = null;
  }
}

/* =====================================================================
   🌸 SECTION 5: LOVE LETTER (ENVELOPE + TYPING ANIMATION)
   ===================================================================== */

const LETTER_TEXT = [
  'Chúc mừng 8/3 chị 💕',
  '',
  'Em không biết phải gọi mối quan hệ của mình là gì,',
  'chỉ biết rằng chị là một người rất đặc biệt trong cuộc sống của em.',
  '',
  'Chị không phải chị ruột của em,',
  'nhưng lại là người khiến em cảm thấy thân thuộc một cách lạ kỳ.',
  'Những cuộc trò chuyện của mình — dù dài hay ngắn —',
  'đều là những khoảnh khắc em luôn trân trọng.',
  '',
  'Ở bên chị, em được là chính mình.',
  'Không cần cố gắng quá nhiều, không cần gượng ép,',
  'mọi thứ tự nhiên đến mức… em cũng không hiểu vì sao lại hợp nhau đến vậy.',
  '',
  'Cảm ơn chị vì đã đồng hành cùng em,',
  'vì đã lắng nghe và chia sẻ,',
  'và vì đã vô tình trở thành một phần quan trọng trong những ngày bình thường của em.',
  '',
  'Chúc chị luôn xinh đẹp, hạnh phúc và được yêu thương thật nhiều.',
  'Và nếu có thể… em mong mình sẽ còn nói chuyện, còn cười cùng nhau thật lâu nữa.',
  '',
  'Vì thật lòng mà nói…',
  'em rất thích cảm giác có chị trong cuộc sống của mình 💗',
];

function initEnvelopeLetter() {
  const envelope = document.getElementById('envelope');
  const envelopeWrap = document.getElementById('envelopeWrap');
  const letterContent = document.getElementById('letterContent');
  const letterBody = document.getElementById('letterBody');

  if (!envelope || !letterContent) return;

  let opened = false;

  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;

    // Open animation
    envelope.classList.add('open');

    setTimeout(() => {
      envelopeWrap.style.opacity = '0';
      envelopeWrap.style.transform = 'translateY(-20px) scale(0.95)';
      envelopeWrap.style.transition = 'all 0.5s ease';

      setTimeout(() => {
        envelopeWrap.style.display = 'none';
        letterContent.classList.add('visible');
        startTyping(letterBody, LETTER_TEXT);
      }, 500);
    }, 900);
  });
}

function startTyping(container, lines) {
  container.innerHTML = '';
  let lineIdx = 0;
  let charIdx = 0;

  // Create cursor
  const cursor = document.createElement('span');
  cursor.classList.add('cursor');
  container.appendChild(cursor);

  let currentParagraph = null;

  function typeLine() {
    if (lineIdx >= lines.length) {
      cursor.remove();
      return;
    }

    const text = lines[lineIdx];

    if (text === '') {
      // Empty line → line break
      container.insertBefore(document.createElement('br'), cursor);
      lineIdx++;
      charIdx = 0;
      setTimeout(typeLine, 80);
      return;
    }

    if (!currentParagraph || charIdx === 0) {
      currentParagraph = document.createElement('p');
      currentParagraph.style.marginBottom = '0.3rem';
      container.insertBefore(currentParagraph, cursor);
    }

    if (charIdx < text.length) {
      currentParagraph.textContent += text[charIdx];
      charIdx++;
      const delay = text[charIdx - 1] === ',' || text[charIdx - 1] === '.' ? 100 : 28;
      setTimeout(typeLine, delay);
    } else {
      lineIdx++;
      charIdx = 0;
      currentParagraph = null;
      setTimeout(typeLine, 90);
    }
  }

  typeLine();
}

/* =====================================================================
   🌸 SECTION 6: PHOTO GALLERY + LIGHTBOX
   ===================================================================== */

const GALLERY_DATA = [
  { emoji: '🌸', title: 'Mùa xuân rực rỡ', caption: 'Những ngày xuân đẹp đẽ bên nhau 🌸' },
  { emoji: '🎂', title: 'Sinh nhật vui vẻ', caption: 'Kỷ niệm ngày sinh nhật ngọt ngào 🎂' },
  { emoji: '🌺', title: 'Những đóa hoa', caption: 'Đẹp như những bông hoa tươi thắm 🌺' },
  { emoji: '🌈', title: 'Cầu vồng hy vọng', caption: 'Màu sắc cuộc sống luôn rực rỡ 🌈' },
  { emoji: '🥂', title: 'Khoảnh khắc đặc biệt', caption: 'Những buổi tối đáng nhớ cùng nhau 🥂' },
  { emoji: '🦋', title: 'Tự do và bay cao', caption: 'Bay cao như cánh bướm tự do 🦋' },
];

let lightboxCurrent = 0;
let touchStartX = 0;

function initGallery() {
  const grid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxPlaceholder = document.getElementById('lightboxPlaceholder');
  const lightboxCaption = document.getElementById('lightboxCaption');

  if (!grid) return;

  // Build gallery grid
  GALLERY_DATA.forEach((item, i) => {
    const el = document.createElement('div');
    el.classList.add('gallery-item', 'fade-up');
    el.dataset.index = i;
    el.innerHTML = `
      <div class="gallery-emoji">
        <span>${item.emoji}</span>
        <p>${item.title}</p>
      </div>
      <div class="gallery-overlay">
        <div class="gallery-overlay-icon">🔍</div>
        <div class="gallery-overlay-text">${item.caption}</div>
      </div>
    `;
    el.addEventListener('click', () => openLightbox(i));
    grid.appendChild(el);
  });

  // Lightbox controls
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext?.addEventListener('click', () => navigateLightbox(1));

  // Close on backdrop click
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // Touch/Swipe support
  lightbox?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox?.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) navigateLightbox(dx < 0 ? 1 : -1);
  }, { passive: true });

  function openLightbox(idx) {
    lightboxCurrent = idx;
    showLightboxItem(idx);
    lightbox?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    lightboxCurrent = (lightboxCurrent + dir + GALLERY_DATA.length) % GALLERY_DATA.length;
    showLightboxItem(lightboxCurrent);
  }

  function showLightboxItem(idx) {
    const item = GALLERY_DATA[idx];
    if (!item || !lightboxPlaceholder) return;
    lightboxPlaceholder.innerHTML = `
      <div class="lb-emoji">${item.emoji}</div>
      <div class="lb-msg">${item.title}</div>
      <div class="lb-sub">${item.caption}</div>
    `;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
  }

  // Make closeLightbox available globally
  window.closeLightboxGlobal = closeLightbox;
}

/* =====================================================================
   🌸 SECTION 7: SPECIAL SURPRISE GIFT + CONFETTI
   ===================================================================== */

function initGift() {
  const btnOpenGift = document.getElementById('btnOpenGift');
  const giftBox = document.getElementById('giftBox');
  const giftModal = document.getElementById('giftModal');
  const giftModalClose = document.getElementById('giftModalClose');

  btnOpenGift?.addEventListener('click', openGift);
  giftBox?.addEventListener('click', openGift);
  giftModalClose?.addEventListener('click', closeGiftModal);

  giftModal?.addEventListener('click', (e) => {
    if (e.target === giftModal) closeGiftModal();
  });

  // Generate hearts inside modal
  const heartsEl = document.getElementById('giftHearts');
  if (heartsEl) {
    heartsEl.innerHTML = ['💗', '🌸', '💕', '🌺', '💝', '✨'].map(h => `<span>${h}</span>`).join('');
  }

  function openGift() {
    // Gift box open animation
    giftBox?.classList.add('opening');

    setTimeout(() => {
      giftModal?.classList.add('open');
      document.body.style.overflow = 'hidden';
      startConfetti();
      launchFloatingHearts();
    }, 500);
  }
}

function closeGiftModal() {
  const giftModal = document.getElementById('giftModal');
  giftModal?.classList.remove('open');
  document.body.style.overflow = '';
  stopConfetti();
}

// Make accessible globally (used in HTML onclick)
window.closeGiftModal = closeGiftModal;

/* =====================================================================
   🌸 SECTION 8: CONFETTI ENGINE
   ===================================================================== */

let confettiAnimId = null;
const confettiParticles = [];

function startConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Spawn particles
  confettiParticles.length = 0;
  const colors = ['#ff85b3', '#ffb3d1', '#ffd6e8', '#e8537a', '#ff6b95', '#fce4ec', '#fff0f5', '#ff4d9e'];
  const shapes = ['circle', 'rect', 'heart'];

  for (let i = 0; i < 160; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 6 + Math.random() * 10,
      h: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random() * 3,
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.1,
    });
  }

  function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.25);
    ctx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.25);
    ctx.bezierCurveTo(x - size * 0.5, y + size * 0.6, x, y + size * 0.85, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.85, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.25);
    ctx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.25);
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiParticles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.rotation += p.rotSpeed;
      if (p.y > canvas.height + 20) p.y = -20;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        drawHeart(ctx, -p.w / 2, -p.h / 2, p.w);
      }

      ctx.restore();
    });

    confettiAnimId = requestAnimationFrame(animate);
  }

  animate();
}

function stopConfetti() {
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
  const canvas = document.getElementById('confettiCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  confettiParticles.length = 0;
}

function launchFloatingHearts() {
  const heartsArr = ['💗', '💕', '💝', '🌸', '💖', '✨'];
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        left: ${10 + Math.random() * 80}%;
        bottom: 10%;
        font-size: ${1.5 + Math.random() * 2}rem;
        pointer-events: none;
        z-index: 4000;
        animation: floatRise ${3 + Math.random() * 2}s ease-out forwards;
        opacity: 0;
      `;
      el.textContent = heartsArr[Math.floor(Math.random() * heartsArr.length)];
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }, i * 150);
  }
}

/* =====================================================================
   🌸 SECTION 9: SCROLL ANIMATIONS (INTERSECTION OBSERVER)
   ===================================================================== */

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up, .section-header').forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
  });
}

/* =====================================================================
   🌸 SECTION 10: FOOTER HEARTS
   ===================================================================== */

function initFooterHearts() {
  const container = document.getElementById('footerHearts');
  if (!container) return;

  const hearts = ['💗', '💕', '🌸', '💝', '✨'];
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('span');
    el.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 100}%;
      font-size: ${0.8 + Math.random() * 1.2}rem;
      opacity: ${0.1 + Math.random() * 0.2};
      pointer-events: none;
      animation: floatRise ${10 + Math.random() * 15}s ${Math.random() * -10}s linear infinite;
    `;
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    container.appendChild(el);
  }
}

/* =====================================================================
   🌸 SECTION 11: WINDOW RESIZE HANDLER
   ===================================================================== */

window.addEventListener('resize', debounce(() => {
  const canvas = document.getElementById('confettiCanvas');
  if (canvas && confettiAnimId) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}, 200));
