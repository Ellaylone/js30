function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}

const player = document.querySelector('.player'),
      video = player.querySelector('.player__video'),
      playerControls = document.querySelector('.player__controls'),
      playerButtons = playerControls.querySelectorAll('button'),
      playerSliders = playerControls.querySelectorAll('input'),
      playerProgress = playerControls.querySelector('.progress'),
      playerProgressBar = playerProgress.querySelector('.progress__filled');

let progressInterval,
    isChangingProgress = false;

function _initVideo () {
    _setInitialProgress();
}

function _setInitialProgress () {
    _setProgressBarPosition(0);
}

function _setProgressBarPosition (percent) {
    playerProgressBar.style.width = `${percent}%`;
    playerProgressBar.style.flexBasis = `${percent}%`;
}

function _startProgressChange (e) {
    if (video.paused) return;

    _onProgressChange(e);

    isChangingProgress = true;
}

function _stopProgressChange (e) {
    if (video.paused) return;

    _onProgressChange(e);

    isChangingProgress = false;
}

function _onProgressChange (e) {
    if (e.target !== playerProgress && e.target !== playerProgressBar) isChangingProgress = false;

    if (video.paused && !!video.currentTime || !isChangingProgress) return;

    const currentProgress = (e.clientX - player.offsetLeft) / playerProgress.offsetWidth * 100,
          newTime = Math.round(video.duration / 100 * currentProgress * 100) / 100;

    _setProgressBarPosition(currentProgress);
    video.currentTime = newTime;
}

playerProgress.addEventListener('mousedown', _startProgressChange);
playerProgress.addEventListener('mousemove', throttle(_onProgressChange, 100));
playerProgress.addEventListener('mouseup', _stopProgressChange);


function _updateProgressBar () {
    _setProgressBarPosition(video.currentTime / video.duration * 100);
}

function _startProgress () {
    progressInterval = setInterval(_updateProgressBar, 1000);
}

function _stopProgress () {
    clearInterval(progressInterval);
    progressInterval = null;
}

function _onPlayPauseClick (e) {
    if (video.paused) {
        video.play();
        _startProgress();
    } else {
        video.pause();
        _stopProgress();
    }
}

function _onSkipClick (e) {
    _skipVideo(Number.parseInt(e.target.dataset.skip));
}

function _skipVideo (skipTime) {
    video.currentTime += skipTime;
    _updateProgressBar();
}

function _onButtonClick (e) {
    if (e.target.classList.contains('toggle')) {
        _onPlayPauseClick(e);
    } else {
        _onSkipClick(e);
    }
}

function _onKeyPress (e) {
    if (video.paused) return;

    switch (e.keyCode) {
        case 37:
            _skipVideo(-10);
            break;
        case 39:
            _skipVideo(10);
            break;
        default: break;
    }
}

playerButtons.forEach((button) => {
    button.addEventListener('click', _onButtonClick);
});

function _onVolumeChange (e) {
    video.volume = e.target.value;
}

function _onPlaybackRateChange (e) {
    video.playbackRate = e.target.value;
}

function _onSliderChange (e) {
    switch (e.target.name) {
        case 'volume':
            _onVolumeChange(e);
            break;
        case 'playbackRate':
            _onPlaybackRateChange(e);
            break;
        default: break;
    }
}

playerSliders.forEach((slider) => {
    slider.addEventListener('input', throttle(_onSliderChange, 100));
});

video.addEventListener('click', _onPlayPauseClick);
document.addEventListener('keydown', throttle(_onKeyPress));

_initVideo();
