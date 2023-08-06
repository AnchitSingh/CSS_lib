var imageObjects = [];
// Function to preload images
function preloadImage(url) {
    var img = new Image();
    img.src = url;
    imageObjects.push(img);
    return;
}
function waitForHeight(variable) {
    return new Promise(function (resolve) {
        if (variable.naturalHeight !== 0) {
            resolve(variable);
        } else {
            var interval = setInterval(function () {
                if (variable !== 0) {
                    clearInterval(interval);
                    resolve(variable);
                }
            }, 100);
        }
    });
}

function waitForWidth(variable) {
    return new Promise(function (resolve) {
        if (variable.naturalHeight !== 0) {
            resolve(variable);
        } else {
            var interval = setInterval(function () {
                if (variable !== 0) {
                    clearInterval(interval);
                    resolve(variable);
                }
            }, 100);
        }
    });
}


var firstLargeDiv = $('div[data-large="true"]').first();

smartCropping = (imgBox, viewImg, customConfig = {}, preRender = {}, boost = {}) => {
    try {
        var img;
        var srcExist = 0
        var coverBox = imgBox.find('.crop-cover')
        let divHeight = imgBox.height()
        let divWidth = imgBox.width()
        if (!isEmpty(customConfig)) {
            divHeight = customConfig.height
            divWidth = customConfig.width
        }
        if (viewImg.attr('src')) {
            srcExist = 1
            var sampleImg = imageObjects.find(function (obj) {
                return obj.src === viewImg.attr('src');
            });
            let options = {
                width: divWidth,
                height: divHeight,
                ruleOfThirds: false,
                debug: false
            }
            waitForHeight(sampleImg)
                .then(function () {
                    waitForWidth(sampleImg)
                        .then(function () {
                            redraw(sampleImg, options)
                        })
                })
        } else {
            load(imgBox.attr('data-src'));
        }



        function load(imageUrl) {
            if (imageUrl) {
                var link = document.createElement('a');
                link.href = imageUrl;
                var absoluteUrl = link.href;

                img = imageObjects.find(function (obj) {
                    return obj.src == absoluteUrl;
                });
                if (!img) {
                    preloadImage(imageUrl);
                }
                img = imageObjects.find(function (obj) {
                    return obj.src === absoluteUrl;
                });
                waitForHeight(img)
                    .then(function () {
                        waitForWidth(img)
                            .then(function () {
                                run()
                            })
                    })
            }
        }
        function run() {
            if (!isEmpty(preRender)) {
                let preRenderOptions = {
                    width: preRender.width,
                    height: preRender.width,
                    ruleOfThirds: false,
                    minScale: 1,
                    debug: false
                }
                smartcrop.crop(img, preRenderOptions)
                    .then(function (result) {
                        let imgAspectRatio = img.naturalWidth / img.naturalHeight;
                        let boxAspectRatio = preRender.width / preRender.height;
                        viewImg.attr('src', img.src)
                        adjustCrop(result, viewImg, coverBox, imgAspectRatio, boxAspectRatio, preRender.width, preRender.height)
                    })
            }

            let originalOptions;
            let boostObj = imgBox.data('boost');
            if (imgBox.data('booststatus') == 1) {
                originalOptions = {
                    width: divWidth,
                    height: divHeight,
                    ruleOfThirds: false,
                    minScale: 1,
                    debug: false,
                    boost: [{
                        x: boostObj.x,
                        y: boostObj.y,
                        width: boostObj.width,
                        height: boostObj.height,
                        weight: 1
                    }]
                }
            } else {
                originalOptions = {
                    width: divWidth,
                    height: divHeight,
                    ruleOfThirds: false,
                    minScale: 1,
                    debug: false
                }
            }
            smartcrop.crop(img, originalOptions)
                .then(function (result) {
                    let imgAspectRatio = img.naturalWidth / img.naturalHeight;
                    let boxAspectRatio = divWidth / divHeight;
                    viewImg.attr('src', img.src)
                    adjustCrop(result, viewImg, coverBox, imgAspectRatio, boxAspectRatio, divWidth, divHeight)
                })
        }
        function redraw(sampleImg, options) {
            smartcrop.crop(sampleImg, options)
                .then(function (result) {
                    let imgAspectRatio = sampleImg.naturalWidth / sampleImg.naturalHeight;
                    let boxAspectRatio = divWidth / divHeight;
                    adjustCrop(result, viewImg, coverBox, imgAspectRatio, boxAspectRatio, divWidth, divHeight)
                });
        }
    } catch (error) {
        console.log('Error fetching images')
    }
}


function adjustCrop(result, viewImg, coverBox, imgAspectRatio, boxAspectRatio, divWidth, divHeight) {
    if ((imgAspectRatio > 1) && (boxAspectRatio > 1)) {
        let scaleFactor = divHeight / result.topCrop.height
        coverBox.css('transform', `scale(${scaleFactor})`)
        coverBox.css('left', `0`)
        viewImg.css('left', -1 * result.topCrop.x)
        viewImg.css('top', -1 * result.topCrop.y)
    } else if ((imgAspectRatio <= 1) && (boxAspectRatio <= 1)) {
        let scaleFactor = divWidth / result.topCrop.width
        coverBox.css('transform', `scale(${scaleFactor})`)
        coverBox.css('left', `0`)
        viewImg.css('left', -1 * result.topCrop.x)
        viewImg.css('top', -1 * result.topCrop.y)
    } else if ((imgAspectRatio <= 1) && (boxAspectRatio > 1)) {
        let scaleFactor = divWidth / result.topCrop.width
        coverBox.css('transform', `scale(${scaleFactor})`)
        coverBox.css('left', `0`)
        viewImg.css('left', -1 * result.topCrop.x)
        viewImg.css('top', -1 * result.topCrop.y)
    } else if ((imgAspectRatio > 1) && (boxAspectRatio <= 1)) {
        let scaleFactor = divHeight / result.topCrop.height
        coverBox.css('transform', `scale(${scaleFactor})`)
        coverBox.css('left', `0`)
        viewImg.css('left', -1 * result.topCrop.x)
        viewImg.css('top', -1 * result.topCrop.y)
    }
}

const cache = {};

function isSimilar(result, { width, height }) {
    const { topCrop, width: resultWidth, height: resultHeight } = result;
    const aspectRatio = width / height;
    const resultAspectRatio = resultWidth / resultHeight;
    const aspectRatioThreshold = .5;
    const sizeThreshold = 100;
    const coordinateThreshold = 100;
    const sizeDiff = Math.abs(resultWidth - width) + Math.abs(resultHeight - height);
    const aspectRatioDiff = Math.abs(resultAspectRatio - aspectRatio);
    const topLeftDiff = Math.abs(topCrop.x - result.topCrop.x) + Math.abs(topCrop.y - result.topCrop.y);
    const bottomRightDiff = Math.abs(topCrop.x + topCrop.width - result.topCrop.x - result.topCrop.width) + Math.abs(topCrop.y + topCrop.height - result.topCrop.y - result.topCrop.height);
    return (
        sizeDiff < sizeThreshold &&
        aspectRatioDiff < aspectRatioThreshold
    );
}


function smartCropWithCachePromise(image, { width, height }, options = {}) {
    const cacheKey = `${image.src}:${width}:${height}`;
    const cachedResult = cache[cacheKey];
    if (cachedResult && isSimilar(cachedResult, { width, height })) {
        return Promise.resolve(cachedResult);
    }

    return new Promise((resolve, reject) => {
        smartcrop.crop(image, { width, height, ...options }, (result) => {
            const cropData = { ...result, width, height };
            cache[cacheKey] = cropData;
            resolve(cropData);
        }, reject);
    });
}




function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

var resizeTimeout;
window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        reloadImages()
    }, 500);
});

var reloadImages = () => {
    for (let wrapper in wrapperStates) {
        if (wrapperStates[wrapper]) {
            showChildern(wrapper);
        }
    }
    for (let snapper in snapperStates) {
        if (snapperStates[snapper]) {
            showSnapper(snapper);
        }
    }
}

function showChildern(id) {
    let idNum = id.replace('wrapper-', '')
    let options = {
        width: $('div[data-large="true"]').first().width(),
        height: $('div[data-large="true"]').first().height()
    }
    smartCropping($('#wrap-' + idNum + '-target'), $('#wrap-' + idNum + '-target').find('img'), {}, options);
    smartCropping($('#wrap-' + idNum + '-p1'), $('#wrap-' + idNum + '-p1').find('img'), {}, options);
    smartCropping($('#wrap-' + idNum + '-p2'), $('#wrap-' + idNum + '-p2').find('img'), {}, options);
    smartCropping($('#wrap-' + idNum + '-p3'), $('#wrap-' + idNum + '-p3').find('img'), {}, options);
    smartCropping($('#wrap-' + idNum + '-p4'), $('#wrap-' + idNum + '-p4').find('img'), {}, options);
    return
}

function showSnapper(id) {
    smartCropping($('#' + id), $('#' + id).find('img'));
    return
}


var wrapperStates = {};
var snapperStates = {};
window.onload = function () {
    setTimeout(function () {
        $("[id^='snapper-']").each(function () {
            // if (inView.is(this)) {
            snapperStates[this.id] = true;
            showSnapper(this.id);
            // } else {
            //     snapperStates[this.id] = false;
            // }
        });

        $("[id^='wrapper-']").each(function () {
            // if (inView.is(this)) {
            wrapperStates[this.id] = true;
            showChildern(this.id);
            // } else {
            //     wrapperStates[this.id] = false;
            // }
        });
    }, 500)
}
// $("[id^='snapper-']").each(function () {
//     // if (inView.is(this)) {
//     snapperStates[this.id] = true;
//     showSnapper(this.id);
//     // } else {
//     //     snapperStates[this.id] = false;
//     // }
// });

// $("[id^='wrapper-']").each(function () {
//     // if (inView.is(this)) {
//     wrapperStates[this.id] = true;
//     showChildern(this.id);
//     // } else {
//     //     wrapperStates[this.id] = false;
//     // }
// });



// inView('[id^="snapper-"]')
//     .on('enter', function (element) {
//         showSnapper(element.id);
//     });
// inView.offset(-200);