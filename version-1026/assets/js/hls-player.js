(function () {
  function initializePlayer(video) {
    var source = video.getAttribute('data-src');
    if (!source) {
      return Promise.reject(new Error('Missing HLS source'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      return video.play();
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video.__hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
      }
      return video.play();
    }

    video.setAttribute('src', source);
    return video.play();
  }

  function setupPlayer() {
    var video = document.querySelector('[data-hls-player]');
    var overlay = document.querySelector('[data-play-overlay]');
    var status = document.querySelector('[data-player-status]');
    if (!video) {
      return;
    }

    function play() {
      if (status) {
        status.textContent = '正在连接高清播放源…';
      }
      initializePlayer(video).then(function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        if (status) {
          status.textContent = '播放源已就绪，可使用播放器控制条调整进度与音量。';
        }
      }).catch(function () {
        if (status) {
          status.textContent = '当前浏览器暂时无法自动播放，请再次点击播放器或更换支持 HLS 的浏览器。';
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
