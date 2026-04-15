import React, { useState, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const IdPhotoCropper = () => {
  const [image, setImage] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [cropBoxData, setCropBoxData] = useState(null);
  const cropperRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const getCropData = () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      setCropData(cropperRef.current?.cropper.getCroppedCanvas({ width: 1200, height: 1600 }).toDataURL());
    }
  };

  const onCrop = (e) => {
    setCropBoxData(e.detail);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = cropData;
    link.download = 'id_photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const printImages = () => {
      const printableWindow = window.open('', '_blank');
      printableWindow.document.write(`
        <html>
          <head>
            <title>Print ID Photos</title>
            <style>
              @media print {
                @page {
                  size: 4in 6in;
                  margin: 0;
                }
                body {
                  margin: 0;
                }
              }
              .container {
                display: grid;
                grid-template-columns: repeat(2, 40mm);
                grid-template-rows: repeat(3, 50mm);
                width: 101.6mm;
                height: 152.4mm;
              }
              .photo {
                width: 40mm;
                height: 50mm;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${cropData}" class="photo" />
              <img src="${cropData}" class="photo" />
              <img src="${cropData}" class="photo" />
              <img src="${cropData}" class="photo" />
              <img src="${cropData}" class="photo" />
              <img src="${cropData}" class="photo" />
            </div>
          </body>
        </html>
      `);
      printableWindow.document.close();
      printableWindow.print();
  }

  return (
    <div>
      <h2>ID Photo Cropper</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && (
        <div style={{ position: 'relative' }}>
          <Cropper
            ref={cropperRef}
            style={{ height: 400, width: '100%' }}
            initialAspectRatio={4 / 5}
            src={image}
            viewMode={1}
            guides={true}
            minCropBoxHeight={10}
            minCropBoxWidth={10}
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
            crop={onCrop}
          />
          {cropBoxData && (
            <div
              className="guidelines"
              style={{
                position: 'absolute',
                top: cropperRef.current.cropper.getCanvasData().top + cropBoxData.y,
                left: cropperRef.current.cropper.getCanvasData().left + cropBoxData.x,
                width: cropBoxData.width,
                height: cropBoxData.height,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: `${cropBoxData.height * (1 - 0.72)}px`,
                  width: '100%',
                  borderTop: '1px dashed red',
                }}
              ></div>
              <div
                style={{
                  position: 'absolute',
                  top: `${cropBoxData.height * (1 - 0.64)}px`,
                  width: '100%',
                  borderTop: '1px dashed red',
                }}
              ></div>
            </div>
          )}
           <button onClick={getCropData}>Crop Image</button>
        </div>
      )}
      {cropData && (
        <div>
          <h3>Cropped Image</h3>
          <img style={{ width: '100%' }} src={cropData} alt="cropped" />
          <button onClick={downloadImage}>Download Image</button>
          <button onClick={printImages}>Print</button>
        </div>
      )}
    </div>
  );
};

export default IdPhotoCropper;
