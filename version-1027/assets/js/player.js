(function () {
    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('moviePlayButton');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            loaded = true;
        }

        function startPlayback() {
            attachSource();
            button.classList.add('is-hidden');
            video.controls = true;
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', startPlayback);

        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });

        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
