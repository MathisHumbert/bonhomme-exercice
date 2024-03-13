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
    this.total = this.itemElements.length;
    this.isAnimating = false;
    this.isIn = false;
    this.left = (window.innerWidth / 1920) * 10 * 26.3;
    this.bottom = Number(
      (
        this.element.getBoundingClientRect().bottom - window.innerHeight
      ).toFixed(2)
    );

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

    this.imgElements.forEach((image) => {
      gsap.fromTo(
        image,
        {
          xPercent: 10,
          yPercent: 100,
          rotate: `${Number(image.dataset.rotate) + 20}deg`,
        },
        {
          xPercent: 0,
          yPercent: 0,
          rotate: `${image.dataset.rotate}deg`,
          scrollTrigger: {
            trigger: this.element,
            start: 'top bottom',
            end: '75% bottom',
            scrub: 1,
          },
        }
      );
    });

    ScrollTrigger.create({
      trigger: this.element,
      start: 'bottom bottom',
      onEnter: () => {
        if (this.currentIndex === 0 && !this.isIn) {
          this.isIn = true;
          this.emit('disable-scroll', this.bottom);
          this.onChangeDown();
        }
      },
      onLeaveBack: () => {
        if (this.currentIndex === this.total - 1 && !this.isIn) {
          this.isIn = true;
          this.emit('disable-scroll', this.bottom);
          this.onChangeUp();
        }
      },
    });
  }

  onWheel(scroll, normalized) {
    const direction = normalized.pixelY > 0 ? 'down' : 'up';

    if (this.isIn) {
      if (direction === 'down') {
        this.onChangeDown();
      } else {
        this.onChangeUp();
      }

      return;
    }

    if (
      scroll === this.bottom &&
      direction === 'up' &&
      this.currentIndex == this.total - 1
    ) {
      this.isIn = true;
      this.emit('disable-scroll', this.bottom);
      this.onChangeUp();
    }
  }

  onChangeDown() {
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
    const previousImage = this.imgElements[this.currentIndex - 1];
    const nextImages = this.imgElements.filter(
      (_, index) => index >= this.currentIndex
    );
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
      tl.to(
        next,
        { x: window.innerWidth - this.left * 1.5, duration: 1.25 },
        0
      );
    }

    if (previousImage) {
      tl.to(
        previousImage,
        { yPercent: -200, xPercent: -20, rotate: '20deg', duration: 1 },
        0
      );
    }

    if (nextImages) {
      nextImages.forEach((image) => {
        tl.to(
          image,
          {
            yPercent: gsap.getProperty(image, 'xPercent') - 5,
            xPercent: gsap.getProperty(image, 'yPercent') - 5,
            duration: 1,
          },
          0
        );
      });
    }

    if (circle) {
      tl.to(circle, { scale: 25, duration: 1 }, 0);
    }
  }

  onChangeUp() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.currentIndex -= 1;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;

        if (this.currentIndex === 0) {
          this.isIn = false;
          this.emit('enable-scroll');
        }
      },
    });

    const previous = this.itemElements[this.currentIndex + 1];
    const current = this.itemElements[this.currentIndex];
    const next = this.itemElements[this.currentIndex + 2];
    const previousImage = this.imgElements[this.currentIndex];
    const nextImages = this.imgElements.filter(
      (_, index) => index > this.currentIndex
    );
    const circle = this.circleElements[this.currentIndex + 1];

    if (previous) {
      tl.to(previous, {
        x: window.innerWidth - this.left * 1.5,
        opacity: 0.2,
        duration: 1,
      });
    }

    if (current) {
      tl.to(current, { x: 0, duration: 1, opacity: 1 }, 0);
    }

    if (next) {
      tl.to(
        next,
        {
          x: (window.innerWidth - this.left * 1.5) * 2,
          duration: 1,
        },
        0
      );
    }

    if (previousImage) {
      tl.to(
        previousImage,
        {
          yPercent: this.currentIndex * -5,
          xPercent: this.currentIndex * -5,
          rotate: `${previousImage.dataset.rotate}deg`,
          duration: 1,
        },
        0
      );
    }

    if (nextImages) {
      nextImages.forEach((image) => {
        tl.to(
          image,
          {
            yPercent: gsap.getProperty(image, 'xPercent') + 5,
            xPercent: gsap.getProperty(image, 'yPercent') + 5,
            duration: 0.8,
          },
          0.2
        );
      });
    }

    if (circle) {
      tl.to(circle, { scale: 0, duration: 1 }, 0);
    }
  }
}
