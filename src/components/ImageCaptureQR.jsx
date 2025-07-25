import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { Camera, LoaderCircle } from 'lucide-react';

function ImageCaptureQR() {
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCaptureAndUpload = async () => {
    document.querySelectorAll('noscript').forEach(el => el.remove());

    // fade-in 처리된 요소 스타일 강제 고정
    document.querySelectorAll('.fade-in').forEach(el => {
      el.style.opacity = '1';
      el.style.animation = 'none';
    });

    // ✅ max-height 임시 제거
    const targetUl = document.querySelector('.draw-contents h2 + ul');
    let originalMaxHeight = null;
    if (targetUl) {
      originalMaxHeight = targetUl.style.maxHeight;
      targetUl.style.maxHeight = 'none';
    }

    setLoading(true);
    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        ignoreElements: (element) => {
          return element.classList.contains('no-capture');
        },
        windowWidth: 600,
        windowHeight: document.body.scrollHeight,
        scale: 2,
      });

      const dataUrl = canvas.toDataURL('image/png');

      const formData = new FormData();
      formData.append('image', dataUrl.split(',')[1]);

      const res = await axios.post(
        'https://api.imgbb.com/1/upload?key=bbdd8322ee8f1754bf689d44582b2ad7',
        formData
      );

      if (res.data?.data?.url) {
        setQrUrl(res.data.data.url);
      }
    } catch (error) {
      console.error('이미지 저장 실패:', error);
    } finally {
      // ✅ 원상 복구
      if (targetUl && originalMaxHeight !== null) {
        targetUl.style.maxHeight = originalMaxHeight;
      }
      setLoading(false);
    }
  };

  return (
    <div className='no-capture'>
      {qrUrl ? (
        <>
          <p className='qr-desc'>스캔하여 저장된 이미지를 확인하세요</p>
          <QRCodeSVG value={qrUrl} size={128} />
        </>
      ) : (
        <button className="btn-capture" onClick={handleCaptureAndUpload} disabled={loading}>
          {loading ? <LoaderCircle className='spinning' /> : <Camera color='#999' />}
        </button>
      )}
    </div>
  );
}

export default ImageCaptureQR;
