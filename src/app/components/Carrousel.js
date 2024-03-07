import gsap from 'gsap';

import { getOffset } from '../utils';

export default class Carrousel {
  constructor() {
    this.element = document.querySelector('.carrousel__gallery__container');
    this.elements = document.querySelectorAll('.carrousel__gallery__item');

    this.extra = 0;
    this.start = 0;
    this.isDown = false;
    this.direction = 'down';
    this.mouse = { current: 0, target: 0, position: 0, last: 0, ease: 0.1 };
  }

  /**
   * Events.
   */
  onResize() {
    this.containerWidth = this.element.clientWidth;

    this.elements.forEach((element) => {
      element.offset = getOffset(element);
      element.extra = 0;
    });
  }

  onTouchDown(event) {
    this.isDown = true;

    this.mouse.position = this.mouse.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const y = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.start - y) * 1;

    this.mouse.target = this.mouse.position + distance;
  }

  onTouchUp() {
    this.isDown = false;
  }

  /**
   * Loop.
   */
  update(scroll, direction, isScrolling) {
    this.mouse.current = gsap.utils.interpolate(
      this.mouse.current,
      this.mouse.target,
      this.mouse.ease
    );
    this.mouse.current = Math.floor(this.mouse.current);

    if (isScrolling) {
      this.direction = direction;
    } else {
      if (this.mouse.current > this.mouse.last) {
        this.direction = 'down';
      } else if (this.mouse.current < this.mouse.last) {
        this.direction = 'up';
      }
    }

    this.elements.forEach((element) => {
      const position = -scroll - this.mouse.current - element.extra;
      const offset = position + element.offset.left + element.offset.width;

      element.isBefore = offset * 0.75 < 0;
      element.isAfter = offset > this.containerWidth * 0.75;

      if (this.direction === 'down' && element.isBefore) {
        element.extra -= this.containerWidth;

        element.isBefore = false;
        element.isAfter = false;
      }
      if (this.direction === 'up' && element.isAfter) {
        element.extra += this.containerWidth;

        element.isBefore = false;
        element.isAfter = false;
      }

      element.style.transform = `translate3d(${Math.floor(position)}px, 0, 0) `;
    });

    this.mouse.last = this.mouse.current;
  }
}
