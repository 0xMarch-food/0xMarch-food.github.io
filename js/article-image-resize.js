(() => {
  const article = document.querySelector('article#article-container.post-content');
  if (!article) return;

  for (const image of article.querySelectorAll('img')) {
    if (image.closest('.article-image-resize, .gallery-container, .inline-img, table')) continue;

    const media = image.closest('picture') || image;
    const link = media.closest('a');
    if (link && (link.firstElementChild !== media || link.childElementCount !== 1 || link.textContent.trim())) continue;

    const target = link || media;
    const frame = document.createElement('span');
    frame.className = 'article-image-resize';
    target.before(frame);
    frame.append(target);

    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'article-image-resize__handle';
    handle.title = '拖动调整图片大小，双击恢复';
    handle.setAttribute('aria-label', '调整图片大小，左右方向键缩放，回车恢复');
    frame.append(handle);

    const resize = (width) => {
      const parent = frame.parentElement;
      const style = getComputedStyle(parent);
      const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      if (available <= 0) return;
      frame.style.width = `${Math.min(available, Math.max(72, width))}px`;
      frame.dataset.resized = '';
    };

    const reset = () => {
      frame.style.removeProperty('width');
      delete frame.dataset.resized;
    };

    let drag;
    handle.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      const { width, height } = image.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, width, height };
      frame.dataset.dragging = '';
      handle.setPointerCapture(drag.id);
    });

    handle.addEventListener('pointermove', (event) => {
      if (drag?.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!dx && !dy && !frame.hasAttribute('data-resized')) return;

      // A centered image's corner moves by half the width change and the full height change.
      const horizontal = 0.5;
      const vertical = drag.height / drag.width;
      const widthChange = (dx * horizontal + dy * vertical) / (horizontal ** 2 + vertical ** 2);
      resize(drag.width + widthChange);
    });

    handle.addEventListener('lostpointercapture', () => {
      drag = undefined;
      delete frame.dataset.dragging;
    });

    handle.addEventListener('dblclick', reset);
    handle.addEventListener('click', (event) => {
      if (event.detail === 0) reset();
    });

    handle.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const delta = event.key === 'ArrowLeft' ? -24 : 24;
      resize(image.getBoundingClientRect().width + delta);
    });
  }
})();
