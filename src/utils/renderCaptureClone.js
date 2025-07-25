export const renderCaptureClone = () => {
  const original = document.querySelector('.draw');
  const target = document.getElementById('app-capture');

  if (!original || !target) return;

  // 기존 내용 제거 후 복사
  target.innerHTML = '';
  const clone = original.cloneNode(true); // 깊은 복사

  // 클래스 중 fade-in, reveal-text 제거
  clone.querySelectorAll('li').forEach((li) => {
    li.classList.remove('fade-in', 'reveal-text');
  });

  // pulse 제거
  clone.querySelectorAll('.pulse').forEach((el) => el.remove());

  // span 내부는 텍스트만 남기기 (불필요한 클래스 제거)
  clone.querySelectorAll('li span').forEach((span) => {
    const text = span.textContent;
    span.className = '';
    span.innerHTML = text;
  });

  // max-height 제거
  const ul = clone.querySelector('h2 + ul');
  if (ul) {
    ul.style.maxHeight = 'none';
    ul.style.overflow = 'visible';
  }

  // 캡처용 영역에 복사된 콘텐츠 삽입
  target.appendChild(clone);
  target.style.display = 'block';
};