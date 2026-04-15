import React, { useState, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { removeBackground } from '@imgly/background-removal';

const cropperStyle = `
  .cropper-view-box {
    outline: 2px solid #39f;
    outline-color: rgba(51, 153, 255, 0.75);
  }
  .cropper-modal {
    opacity: 0.5;
    background-color: #000;
  }
  .cropper-dashed {
    display: none;
  }
`;

const hkPassportSpec = {
  name: '香港特區護照 (40mm x 50mm)',
  aspectRatio: 4 / 5,
  outputWidth: 1280,
  outputHeight: 1600,
  outputMimeType: 'image/jpeg',
  outputExtension: 'jpg',
};

const IdPhotoCropper = () => {
  const [image, setImage] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [replaceBackground, setReplaceBackground] = useState(false);
  const cropperRef = useRef(null);
  const containerRef = useRef(null);
  const [topLineStyle, setTopLineStyle] = useState({ display: 'none' });
  const [chinLineStyle, setChinLineStyle] = useState({ display: 'none' });

  const selectedSpec = hkPassportSpec;

  const handleImageUpload = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) files = e.dataTransfer.files;
    else if (e.target) files = e.target.files;
    
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setCropData(null);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const getCropData = async () => {
    if (!cropperRef.current?.cropper) return;

    setIsProcessing(true);
    setCropData(null);

    try {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas({
        width: selectedSpec.outputWidth,
        height: selectedSpec.outputHeight,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (replaceBackground) {
        // Get the cropped image as a high-quality PNG to feed into the background removal tool
        const croppedImageForProcessing = croppedCanvas.toDataURL('image/png');
        
        // Let the library return the default: a Blob with a transparent background
        const transparentBlob = await removeBackground(croppedImageForProcessing);

        // Load the transparent blob into an Image element to be drawn onto a new canvas
        const image = new Image();
        const url = URL.createObjectURL(transparentBlob);

        const finalUrl = await new Promise((resolve, reject) => {
          image.onload = () => {
            URL.revokeObjectURL(url); // Clean up memory once the image is loaded

            // Create a new canvas to manually apply the white background
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = selectedSpec.outputWidth;
            finalCanvas.height = selectedSpec.outputHeight;
            const ctx = finalCanvas.getContext('2d');

            // Explicitly fill the background with white
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

            // Draw the transparent image (the person) over the white background
            ctx.drawImage(image, 0, 0);

            // Export the final, merged image as a JPEG data URL
            resolve(finalCanvas.toDataURL(selectedSpec.outputMimeType, 0.9));
          };
          image.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error); // Reject the promise if the image fails to load
          };
          image.src = url;
        });
        
        setCropData(finalUrl);

      } else {
        // If not replacing background, just convert the original crop to JPEG
        setCropData(croppedCanvas.toDataURL(selectedSpec.outputMimeType, 0.9));
      }
    } catch (error) {
      console.error("Could not process image:", error);
      // If anything fails, attempt to provide the original cropped image as a fallback
      if (cropperRef.current?.cropper) {
        const fallbackCanvas = cropperRef.current.cropper.getCroppedCanvas({
          width: selectedSpec.outputWidth,
          height: selectedSpec.outputHeight
        });
        setCropData(fallbackCanvas.toDataURL(selectedSpec.outputMimeType, 0.9));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const onCrop = () => {
    const cropperInstance = cropperRef.current?.cropper;
    const containerElement = containerRef.current;

    if (!cropperInstance || !containerElement) return;

    const viewBox = cropperInstance.cropper.querySelector('.cropper-view-box');
    if (!viewBox) return;

    const containerRect = containerElement.getBoundingClientRect();
    const viewBoxRect = viewBox.getBoundingClientRect();

    const relativeTop = viewBoxRect.top - containerRect.top;
    const relativeLeft = viewBoxRect.left - containerRect.left;

    const topLineTop = relativeTop + (viewBoxRect.height * 0.08);
    const chinLineTop = relativeTop + (viewBoxRect.height * 0.76);
    const lineLeft = relativeLeft + (viewBoxRect.width * 0.1);
    const lineWidth = viewBoxRect.width * 0.8;

    const lineBaseStyle = {
      position: 'absolute',
      left: `${lineLeft}px`,
      width: `${lineWidth}px`,
      height: '2px',
      backgroundColor: '#39f',
      zIndex: 10,
      pointerEvents: 'none',
      display: 'block',
    };

    setTopLineStyle({ ...lineBaseStyle, top: `${topLineTop}px` });
    setChinLineStyle({ ...lineBaseStyle, top: `${chinLineTop}px` });
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = cropData;
    link.download = `id_photo_hk_passport.${selectedSpec.outputExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const printImages = () => {
      const printableWindow = window.open('', '_blank');
      printableWindow.document.write(`
        <html>
          <head><title>Print ID Photos</title>
            <style>
              @media print { @page { size: 4in 6in; margin: 0; } body { margin: 0; display: flex; justify-content: center; align-items: center; } }
              .container { display: grid; grid-template-columns: repeat(2, 40mm); grid-template-rows: repeat(2, 50mm); width: 80mm; height: 100mm; gap: 0; page-break-inside: avoid; }
              .photo { width: 40mm; height: 50mm; object-fit: cover; }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${cropData}" class="photo" /><img src="${cropData}" class="photo" />
              <img src="${cropData}" class="photo" /><img src="${cropData}" class="photo" />
            </div>
          </body>
        </html>
      `);
      printableWindow.document.close();
      printableWindow.focus();
      setTimeout(() => { printableWindow.print(); }, 500);
  }
  
  const instructionText = '請將頭頂對齊上方藍線，下顎對齊下方藍線。';

  return (
    <div>
      <style>{cropperStyle}</style>
      <h2>香港特區護照相片裁切</h2>
      <p style={{marginTop: '1rem'}}>{instructionText}</p>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && (
        <div ref={containerRef} style={{ position: 'relative', marginTop: '1rem', width: '100%', maxWidth: '600px' }}>
          <Cropper
            ref={cropperRef}
            style={{ height: 400, width: '100%' }}
            aspectRatio={selectedSpec.aspectRatio}
            src={image}
            viewMode={1}
            guides={true}
            dragMode="move"
            modal={true}
            minCropBoxHeight={50}
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
            crop={onCrop}
            ready={onCrop}
          />
          <div style={topLineStyle}></div>
          <div style={chinLineStyle}></div>

          <div style={{marginTop: '1rem'}}>
            <input 
              type="checkbox" 
              id="replaceBackground"
              checked={replaceBackground}
              onChange={(e) => setReplaceBackground(e.target.checked)}
            />
            <label htmlFor="replaceBackground"> 更換為白色背景</label>
          </div>

           <button onClick={getCropData} style={{marginTop: '1rem'}} disabled={isProcessing}>
            {isProcessing ? '處理中...' : '裁切影像'}
           </button>
        </div>
      )}
      {cropData && (
        <div style={{marginTop: '1rem'}}>
          <h3>裁切預覽</h3>
          <img style={{ maxWidth: '100%', width: '240px', border: '1px solid #ccc' }} src={cropData} alt="cropped" />
          <div>
            <button onClick={downloadImage} style={{marginRight: '1rem'}}>下載單張照片</button>
            <button onClick={printImages}>生成4x6列印版本</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdPhotoCropper;
