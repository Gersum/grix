import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  ViewChildren,
  AfterViewInit,
  QueryList,
  OnInit,
  AfterViewChecked,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { RouterModule } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HomeComponent implements AfterViewInit, OnInit, AfterViewChecked, OnDestroy {
  fadeProgress = 0;
  currentYear = new Date().getFullYear();
  Math = Math; // Expose Math to template

  @ViewChild('heroCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('card', { read: ElementRef }) cardElements!: QueryList<ElementRef>;

  @ViewChild('featuredVideo') featuredVideo!: ElementRef<HTMLVideoElement>;
  isPlaying = true;
  isMuted = true;

  @ViewChild('whyUsSection') whyUsSection!: ElementRef<HTMLElement>;
  @ViewChild('carouselSection') carouselSection!: ElementRef<HTMLElement>;
  @ViewChild('afterCarouselSection') afterCarouselSection!: ElementRef<HTMLElement>;

  @ViewChild('marqueeText', { static: false }) marqueeTextRef!: ElementRef;
  @ViewChild('carouselSection', { static: false }) carouselSectionRef!: ElementRef;

  // Image Sequence Properties
  images: HTMLImageElement[] = [];
  frameCount = 49; // Updated frame count based on user input
  currentFrame = 0;
  imagesLoaded = 0;
  private canvasContext: CanvasRenderingContext2D | null = null;

  showCarousel = false; // Initially hidden
  carouselDone = false;
  carouselImages = [
    './images/5.jpg',
    './images/6.jpg',
    './images/3.jpg',
    './images/4.jpg'
  ];
  carouselIndex = 0;
  marqueeScroll = 0;
  marqueeTexts = [
    'Web Design -  Development - Wireframes -  SEO -  UI/UX  -  Branding',
    'Campaigning - TikTok -   Influencer Marketing - Instagram ',
    'Corporate design -   (Re-)Branding - Corporate Identitiy',
    'Employer Value - Identity Design -  Development'
  ];
  carouselTransitioning = false;
  marqueeDragging = false;
  marqueeMaxScroll = 0;

  autoScrollActive = true;
  autoScrollSpeed = 5; // Adjust for desired speed (pixels per frame)
  private autoScrollId: any = null;

  constructor(private renderer: Renderer2) { }

  togglePlayPause() {
    const video = this.featuredVideo.nativeElement;
    if (video.paused) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  toggleMute() {
    const video = this.featuredVideo.nativeElement;
    video.muted = !video.muted;
    this.isMuted = video.muted;
  }

  works = [
    {
      id: 1,
      title: 'Brand Website',
      description: 'A modern, responsive website for a leading brand.',
      image: './images/1.jpg',
      inView: false
    },
    {
      id: 2,
      title: 'Social Campaign',
      description: 'Creative campaign for social media engagement.',
      image: './images/2.jpg',
      inView: false
    },
    {
      id: 3,
      title: 'Content Platform',
      description: 'A content marketing platform for storytelling.',
      image: './images/3.jpg',
      inView: false
    },
    {
      id: 4,
      title: 'E-commerce Site',
      description: 'An e-commerce platform with a focus on user experience.',
      image: './images/8.jpg',
      inView: false
    },
    {
      id: 5,
      title: 'Mobile App',
      description: 'A mobile app designed for seamless user interaction.',
      image: './images/5.jpg',
      inView: false
    },
    {
      id: 6,
      title: 'Interactive Experience',
      description: 'An interactive experience that engages users.',
      image: './images/6.jpg',
      inView: false
    },
    {
      id: 7,
      title: 'Brand Identity',
      description: 'A complete brand identity package.',
      image: './images/9.jpg',
      inView: false
    },
    {
      id: 8,
      title: 'Digital Marketing',
      image: './images/4.jpg',
      inView: false
    }
    // Add more works as needed
  ];

  clients = [
    { name: 'Acme Corp', desc: 'Enterprise Solutions', icon: 'briefcase' },
    { name: 'Star Media', desc: 'Media & Entertainment', icon: 'star' },
    { name: 'Pink Labs', desc: 'Creative Studio', icon: 'user' },
    { name: 'GreenTech', desc: 'Sustainable Tech', icon: 'circle' },
    { name: 'Blue Ocean', desc: 'Consulting', icon: 'briefcase' },
    { name: 'Sunrise', desc: 'Marketing', icon: 'star' },
    { name: 'NextGen', desc: 'Innovation', icon: 'user' },
    { name: 'BrightPath', desc: 'Education', icon: 'circle' },
    { name: 'NextGen', desc: 'Innovation', icon: 'user' },
    { name: 'BrightPath', desc: 'Education', icon: 'circle' }
  ];

  goToCarousel() {
    this.showCarousel = true;
    this.carouselDone = false;
    this.autoScrollActive = true;
    this.startAutoScroll();
  }

  onCarouselScroll(event: WheelEvent) {
    if (!this.showCarousel || this.carouselTransitioning) return;
    if (event.deltaY > 0) {
      if (this.carouselIndex < this.carouselImages.length - 1) {
        this.carouselTransitioning = true;
        this.carouselIndex++;
      } else if (!this.carouselDone) {
        this.carouselDone = true;
        setTimeout(() => {
          this.afterCarouselSection?.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    } else if (event.deltaY < 0 && this.carouselIndex > 0) {
      this.carouselTransitioning = true;
      this.carouselIndex--;
    }
  }

  onCarouselTransitionEnd() {
    this.carouselTransitioning = false;
  }

  // Only allow scrolling to next section after last image
  @HostListener('window:wheel', ['$event'])
  onGlobalWheel(event: WheelEvent) {
    // Only block if carousel is showing and NOT at the last image with marquee fully scrolled
    if (
      this.showCarousel &&
      !(
        this.carouselIndex === this.carouselImages.length - 1 &&
        this.marqueeScroll >= this.marqueeMaxScroll
      )
    ) {
      // Prevent page scroll
      event.preventDefault();
      event.stopPropagation();
    }
  }

  isSectionInView(section: HTMLElement) {
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  scrollToNextSection() {
    // Adjust selector as needed for your next section
    const nextSection = document.querySelector('section:nth-of-type(6)');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  ngOnInit() {
    AOS.init();
    window.scrollTo(0, 0);
    this.showCarousel = false;
    this.carouselDone = false;
    this.carouselIndex = 0;
  }

  imageVisible = false; // Controls initial fade-in
  transitionDuration = '1s'; // Long transition for initial fade

  ngAfterViewInit() {
    // Initialize Canvas
    if (this.canvasRef?.nativeElement) {
      this.canvasContext = this.canvasRef.nativeElement.getContext('2d');
      this.resizeCanvas();
      this.currentFrame = 0;
      this.renderFrame(this.currentFrame);

      // Trigger fade-in and start forward playback
      setTimeout(() => {
        this.imageVisible = true;
        this.startForwardPlayback();

        // After initial fade, switch to faster transition for scroll responsiveness
        setTimeout(() => {
          this.transitionDuration = '0.1s';
        }, 1000);
      }, 100);

      window.addEventListener('resize', () => this.resizeCanvas());
      this.preloadImages();
    }

    // Initialize IntersectionObserver only after the first scroll
    setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const indexAttr = entry.target.getAttribute('data-index');
            if (indexAttr !== null) {
              const index = +indexAttr;
              // Set inView true when in viewport, false when out
              if (entry.isIntersecting && !this.works[index].inView) {
                this.works[index].inView = true;
              }
            }
          });
        },
        { threshold: 0.2 }
      );

      this.cardElements.forEach((el, i) => {
        el.nativeElement.setAttribute('data-index', i);
        observer.observe(el.nativeElement);
      });
    }, 500); // Delay the initialization


    if (this.featuredVideo?.nativeElement) {
      this.featuredVideo.nativeElement.muted = true;
      this.featuredVideo.nativeElement.play();
    }

    this.updateMarqueeMaxScroll();
    this.autoScrollActive = true;
    this.startAutoScroll();

    const circle = document.getElementById('pointer-circle');
    if (!circle) return;
    window.addEventListener('mousemove', (e) => {
      // Center the circle on the pointer (w-12/h-12 = 48px, so offset by 24)
      circle.style.transform = `translate(${e.clientX - 24}px, ${e.clientY - 24}px) scale(1)`;
    });
    window.addEventListener('mousedown', () => {
      circle.style.transform += ' scale(0.7)';
    });
    window.addEventListener('mouseup', () => {
      circle.style.transform = circle.style.transform.replace(' scale(0.7)', ' scale(1)');
    });
  }

  ngAfterViewChecked() {
    this.updateMarqueeMaxScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  updateMarqueeMaxScroll() {
    if (this.marqueeTextRef && this.carouselSectionRef) {
      const textWidth = this.marqueeTextRef.nativeElement.scrollWidth;
      const containerWidth = this.carouselSectionRef.nativeElement.offsetWidth;
      this.marqueeMaxScroll = Math.max(0, textWidth - containerWidth + 32); // 32 for px-8 padding
    }
  }

  private hasUserScrolled = false;
  private hasAutoScrolledToCarousel = false;
  private carouselResetTimeout: any = null;
  private autoScrollResumeTimeout: any = null;

  private initialAnimationActive = false;
  private reverseAnimFrame: any;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // If user scrolls during initial animation, cancel it and let scroll take over
    if (this.initialAnimationActive) {
      this.initialAnimationActive = false;
      if (this.reverseAnimFrame) {
        cancelAnimationFrame(this.reverseAnimFrame);
      }
    }

    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    // Map scroll to progress over 200vh (since container is 300vh, 200vh is scrollable distance)
    this.fadeProgress = Math.min(Math.max(scrollY / (windowH * 2), 0), 1);

    // Scrub image sequence based on scroll
    if (this.images.length > 0) {
      // Map animation to first 90% of scroll, holding the last frame for the last 10%
      const animationProgress = Math.min(this.fadeProgress / 0.9, 1);
      // Invert mapping: Scroll 0 -> Frame 48 (Full), Scroll Down -> Frame 0 (Empty)
      const frameIndex = Math.min(
        this.frameCount - 1,
        Math.floor((1 - animationProgress) * (this.frameCount - 1))
      );
      this.currentFrame = frameIndex;
      requestAnimationFrame(() => this.renderFrame(this.currentFrame));
    }

    if (!this.whyUsSection) return;
    const rect = this.whyUsSection.nativeElement.getBoundingClientRect();

    // Show carousel when "Why Us" is scrolled out of view
    if (!this.showCarousel && rect.bottom <= window.innerHeight * 0.5) {
      this.showCarousel = true;
      this.autoScrollActive = true;
      this.startAutoScroll();
      if (!this.hasAutoScrolledToCarousel) {
        this.hasAutoScrolledToCarousel = true;
        setTimeout(() => {
          if (this.carouselSection && !this.isSectionInView(this.carouselSection.nativeElement)) {
            this.carouselSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 400);
      }
    }

    // Hide carousel and reset ALL state if user scrolls back up above "Why Us"
    if (this.showCarousel && rect.bottom > window.innerHeight * 0.5) {
      // Only reset if not transitioning
      if (!this.carouselTransitioning) {
        this.showCarousel = false;
        this.hasAutoScrolledToCarousel = false;
        if (this.carouselResetTimeout) {
          clearTimeout(this.carouselResetTimeout);
        }
        this.carouselResetTimeout = setTimeout(() => {
          this.carouselDone = false;
          this.carouselIndex = 0;
          this.marqueeScroll = 0;
          // Do NOT reset carouselTransitioning here!
        }, 150); // 150ms debounce
      }
    }
  }

  // Called on horizontal scroll or drag
  onMarqueeScroll(event: WheelEvent) {
    this.autoScrollActive = false;
    // Increase the multiplier for faster scroll (try 0.5 or 1 for much faster)
    const delta = (event.deltaX || event.deltaY || 0) * 0.5;
    this.marqueeScroll += delta;

    // Clamp scroll between 0 and marqueeMaxScroll
    if (this.marqueeScroll < 0) {
      if (this.carouselIndex > 0) {
        this.carouselIndex--;
        setTimeout(() => {
          this.updateMarqueeMaxScroll();
          this.marqueeScroll = 0;
          this.autoScrollActive = true;
        });
      } else {
        this.marqueeScroll = 0;
      }
    } else if (this.marqueeScroll >= this.marqueeMaxScroll) {
      if (this.carouselIndex < this.carouselImages.length - 1) {
        this.carouselIndex++;
        setTimeout(() => {
          this.updateMarqueeMaxScroll();
          this.marqueeScroll = 0;
          this.autoScrollActive = true;
        });
      } else {
        this.marqueeScroll = this.marqueeMaxScroll;
      }
    }

    // Optionally resume auto-scroll after a delay
    clearTimeout(this.autoScrollResumeTimeout);
    this.autoScrollResumeTimeout = setTimeout(() => {
      this.autoScrollActive = true;
    }, 1200);
  }

  startAutoScroll() {
    this.stopAutoScroll();
    const step = () => {
      if (this.autoScrollActive && this.showCarousel) {
        // Only auto-scroll if not at the end
        if (this.marqueeScroll < this.marqueeMaxScroll) {
          this.marqueeScroll += this.autoScrollSpeed;
        }
      }
      this.autoScrollId = requestAnimationFrame(step);
    };
    this.autoScrollId = requestAnimationFrame(step);
  }

  stopAutoScroll() {
    if (this.autoScrollId) {
      cancelAnimationFrame(this.autoScrollId);
      this.autoScrollId = null;
    }
  }

  // Add this method to handle mouse move events for the marquee
  onMarqueeMouseMove(event: MouseEvent): void {

    if (this.marqueeDragging) {

      this.marqueeScroll = Math.max(0, Math.min(this.marqueeMaxScroll, this.marqueeScroll - event.movementX));
    }
  }

  preloadImages() {
    for (let i = 1; i <= this.frameCount; i++) {
      const img = new Image();
      // Format index with leading zero (e.g., 01, 02, ... 49)
      const indexStr = i.toString().padStart(2, '0');
      img.src = `https://d20b8mqh7zo0pc.cloudfront.net/hero-sequence/v2/webp/ese-hero-sequence${indexStr}.webp`;
      img.onload = () => {
        this.imagesLoaded++;
        if (this.imagesLoaded === this.frameCount) {
          this.startForwardPlayback();
        } else if (i === 1) { // If the first image (index 0) loads
          this.renderFrame(0);
        }
      };
      // We need to store them in order. Since onload is async, we can't just push.
      // But the loop runs synchronously, so we can assign to index i-1.
      this.images[i - 1] = img;
    }
  }

  renderFrame(index: number) {
    if (!this.canvasContext || !this.canvasRef || !this.images[index]) return;

    const canvas = this.canvasRef.nativeElement;
    const img = this.images[index];

    // Clear canvas
    this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image with 'object-cover' behavior
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;

    this.canvasContext.drawImage(
      img,
      0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
    );
  }

  resizeCanvas() {
    if (this.canvasRef?.nativeElement) {
      const canvas = this.canvasRef.nativeElement;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.renderFrame(this.currentFrame);
    }
  }

  startForwardPlayback() {
    // Start from the beginning
    this.currentFrame = 0;
    let lastTime = performance.now();
    const fps = 15;
    const interval = 1000 / fps;

    const step = (now: number) => {
      if (!this.initialAnimationActive) return;

      const delta = now - lastTime;

      if (delta > interval) {
        lastTime = now - (delta % interval);

        this.currentFrame++;
        this.renderFrame(this.currentFrame);

        if (this.currentFrame >= this.frameCount - 1) {
          this.initialAnimationActive = false;
          this.currentFrame = this.frameCount - 1;
          this.renderFrame(this.currentFrame);
          return;
        }
      }

      this.reverseAnimFrame = requestAnimationFrame(step);
    };

    this.initialAnimationActive = true;
    this.reverseAnimFrame = requestAnimationFrame(step);
  }
}