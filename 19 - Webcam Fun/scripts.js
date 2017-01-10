const video = document.querySelector('.player'),
      canvas = document.querySelector('.photo'),
      ctx = canvas.getContext('2d'),
      strip = document.querySelector('.strip'),
      snap = document.querySelector('.snap');

function getVideo () {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    }).then(localMediaStream => {
        video.src = window.URL.createObjectURL(localMediaStream);
        video.play();
    }).catch(err => {
        console.error('Error:', err);
    });
}

function paintToCanvas () {
    const width = video.videoWidth,
          height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);

        let pixels = ctx.getImageData(0, 0, width, height);

        /*         pixels = redEffect(pixels);*/

        /*         pixels = rgbSplit(pixels);*/

        /*         ctx.globalAlpha = 0.1;*/

        pixels = greenScreen(pixels);

        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

function takePhoto () {
    snap.currentTime = 0;
    snap.play();

    const data = canvas.toDataURL('image/png'),
          link = document.createElement('a');

    link.href = data;
    link.setAttribute('download', 'image');
    link.innerHTML = `<img src="${data}" alt="image" />`;

    strip.insertBefore(link, strip.firstChild);
}

// Effects

function redEffect (pixels) {
    for(let i = 0; i < pixels.data.length; i+=4) {
        pixels.data[i] += 200;     // R
        pixels.data[i + 1] -= 50;  // G
        pixels.data[i + 2] *= 0.5; // B
    }

    return pixels;
}

function rgbSplit (pixels) {
    for (let i = 0; i < pixels.data.length; i+=4) {
        pixels.data[i - 150] = pixels.data[i + 0]; // R
        pixels.data[i + 100] = pixels.data[i + 1]; // G
        pixels.data[i - 150] = pixels.data[i + 2]; // B
    }

    return pixels;
}

function greenScreen (pixels) {
    const levels = {};
    let red, green, blue, alpha;

    [...document.querySelectorAll('.rgb input')].forEach((input) => {
        levels[input.name] = input.value;
    });

    for (let i = 0; i < pixels.data.length; i+=4) {
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if (red >= levels.rmin
            && green >= levels.gmin
            && blue >= levels.bmin
            && red <= levels.rmax
            && green <= levels.gmax
            && blue <= levels.bmax) {
            pixels.data[i + 3] = 0;
        }
    }

    return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);
