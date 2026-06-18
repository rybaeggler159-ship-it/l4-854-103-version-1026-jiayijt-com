(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var layer = player.querySelector(".play-layer");
            var starters = Array.prototype.slice.call(player.querySelectorAll("[data-player-start]"));
            var source = video ? video.getAttribute("data-stream") : "";
            var hlsInstance = null;

            function attach() {
                if (!video || !source || video.dataset.ready === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.dataset.ready = "1";
            }

            function play() {
                attach();
                player.classList.add("is-playing");
                if (layer) {
                    layer.hidden = true;
                }
                if (video) {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                }
            }

            starters.forEach(function (item) {
                item.addEventListener("click", play);
            });
            if (layer) {
                layer.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("ended", function () {
                    if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
                        hlsInstance.stopLoad();
                    }
                });
            }
        });
    });
})();
