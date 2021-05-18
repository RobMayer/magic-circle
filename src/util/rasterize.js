const rasterize = (svgString, width, height) => {
    return new Promise((resolve, reject) => {
        const svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width * 2;
            canvas.height = height * 2;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, width * 2, height * 2);
            context.canvas.toBlob(resolve);
        }
        image.src = URL.createObjectURL(svg);
    })
}

export default rasterize;
