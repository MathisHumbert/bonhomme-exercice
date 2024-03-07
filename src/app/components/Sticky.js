import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import EventEmitter from 'events';

export default class Sticky extends EventEmitter {
  constructor() {
    super();

    this.element = document.querySelector('.sticky');
    this.itemElements = [...document.querySelectorAll('.sticky__item')];
    this.imgElements = [...document.querySelectorAll('.sticky__img')];
    this.circleElements = [...document.querySelectorAll('.sticky__circle')];

    this.currentIndex = 0;
    this.isAnimating = false;
    this.isIn = false;
    this.left = (window.innerWidth / 1920) * 10 * 26.3;
    this.bottom =
      this.element.getBoundingClientRect().bottom - window.innerHeight;

    this.itemElements.forEach((item, index) => {
      gsap.set(item, {
        x: (window.innerWidth - this.left * 1.5) * index,
        opacity: index === this.currentIndex ? 1 : 0.2,
      });
    });

    this.circleElements.forEach((item, index) => {
      gsap.set(item, {
        scale: index === this.currentIndex ? 25 : 0,
      });
    });

    gsap.to(this.imgElements, {
      className: 'sticky__img visible',
      scrollTrigger: '.sticky',
    });

    ScrollTrigger.create({
      trigger: this.element,
      start: 'bottom bottom',
      onEnter: () => {
        if (this.currentIndex === 0) {
          this.isIn = true;
          this.emit('disable-scroll', this.bottom);
          this.onChange();
        }
      },
    });
  }

  onWheel() {
    if (this.isIn) {
      this.onChange();
    }
  }

  onChange() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.currentIndex += 1;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;

        if (this.currentIndex === this.itemElements.length - 1) {
          this.isIn = false;
          this.emit('enable-scroll');
        }
      },
    });

    const previous = this.itemElements[this.currentIndex - 1];
    const current = this.itemElements[this.currentIndex];
    const next = this.itemElements[this.currentIndex + 1];
    const image = this.imgElements[this.currentIndex - 1];
    const circle = this.circleElements[this.currentIndex];

    if (previous) {
      tl.to(previous, {
        x: -window.innerWidth,
        duration: 1,
      });
    }

    if (current) {
      tl.to(current, { x: 0, duration: 1, opacity: 1 }, 0);
    }

    if (next) {
      tl.to(next, { x: window.innerWidth - this.left * 1.5, duration: 1 }, 0);
    }

    if (image) {
      tl.to(
        image,
        { yPercent: -200, xPercent: -20, rotate: '20deg', duration: 1 },
        0
      );
    }

    if (circle) {
      tl.to(circle, { scale: 25, duration: 1 }, 0);
    }
  }
}
