import '../styles/index.scss';

import NormalizeWheel from 'normalize-wheel';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

import Carrousel from './components/Carrousel';
import Sticky from './components/Sticky';

gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.pageElement = document.querySelector('.page');
    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      direction: 'down',
      ease: 0.1,
    };
    this.blockScroll = false;

    this.createScrollTrigger();
    this.createCarrousel();
    this.createSticky();

    this.onResize();
    this.update();
    this.addEventListeners();
  }

  /**
   * Create.
   */
  createCarrousel() {
    this.carrousel = new Carrousel();
  }

  createSticky() {
    this.sticky = new Sticky();

    this.sticky.on('disable-scroll', (bottom) => {
      this.scroll.current = this.scroll.target = bottom;

      this.blockScroll = true;
    });

    this.sticky.on('enable-scroll', () => {
      this.blockScroll = false;
    });
  }

  createScrollTrigger() {
    ScrollTrigger.scrollerProxy('.page', {
      scrollTop: (value) => {
        if (arguments.length) {
          this.scroll.current = value;
        }
        return this.scroll.current;
      },

      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    ScrollTrigger.defaults({ scroller: '.page' });
  }

  /**
   * Events.
   */
  onResize() {
    this.scroll.limit =
      this.pageElement.clientHeight - document.documentElement.clientHeight;

    if (this.carrousel && this.carrousel.onResize) {
      this.carrousel.onResize();
    }
  }

  onTouchDown(event) {
    if (this.carrousel && this.carrousel.onTouchDown) {
      this.carrousel.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    if (this.carrousel && this.carrousel.onTouchMove) {
      this.carrousel.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    if (this.carrousel && this.carrousel.onTouchUp) {
      this.carrousel.onTouchUp();
    }
  }

  onWheel(event) {
    if (this.sticky && this.sticky.onWheel) {
      this.sticky.onWheel();
    }

    if (this.blockScroll) return;

    const normalizedWheel = NormalizeWheel(event);

    const speed = normalizedWheel.pixelY;

    this.scroll.target += speed;
  }

  /**
   * Loop.
   */
  update() {
    if (!this.blockScroll) {
      this.scroll.target = gsap.utils.clamp(
        0,
        this.scroll.limit,
        this.scroll.target
      );

      this.scroll.current = gsap.utils.interpolate(
        this.scroll.current,
        this.scroll.target,
        this.scroll.ease
      );

      if (this.scroll.target === 0) {
        this.scroll.current = Math.floor(this.scroll.current);
      } else {
        this.scroll.current = Math.ceil(this.scroll.current - 1);
      }

      if (this.scroll.current < this.scroll.last) {
        this.scroll.direction = 'up';
      } else if (this.scroll.current > this.scroll.last) {
        this.scroll.direction = 'down';
      }

      if (this.scroll.current < 0.1) {
        this.scroll.current = 0;
      }
    }

    this.pageElement.style.transform = `translate3d(0, ${Math.floor(
      -this.scroll.current
    )}px, 0) `;

    if (this.carrousel && this.carrousel.update) {
      this.carrousel.update(
        this.scroll.current,
        this.scroll.direction,
        this.scroll.current !== this.scroll.last
      );
    }

    this.scroll.last = this.scroll.current;

    ScrollTrigger.update();

    window.requestAnimationFrame(this.update.bind(this));
  }

  /***
   * Listeners.
   */
  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this), {
      passive: true,
    });

    window.addEventListener('mousedown', this.onTouchDown.bind(this), {
      passive: true,
    });
    window.addEventListener('mousemove', this.onTouchMove.bind(this), {
      passive: true,
    });
    window.addEventListener('mouseup', this.onTouchUp.bind(this), {
      passive: true,
    });

    window.addEventListener('touchstart', this.onTouchDown.bind(this), {
      passive: true,
    });
    window.addEventListener('touchmove', this.onTouchMove.bind(this), {
      passive: true,
    });
    window.addEventListener('touchend', this.onTouchUp.bind(this), {
      passive: true,
    });

    window.addEventListener('wheel', this.onWheel.bind(this), {
      passive: true,
    });
  }
}

new App();
