function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

export async function getCroppedBlob(imageSrc, pixelCrop, shape = 'rect') {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;

  if (shape === 'round') {
    ctx.beginPath();
    ctx.arc(pixelCrop.width / 2, pixelCrop.height / 2, pixelCrop.width / 2, 0, 2 * Math.PI);
    ctx.clip();
  }

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height,
  );

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}
