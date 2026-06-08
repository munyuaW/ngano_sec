document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".year").textContent = new Date().getFullYear();

  /* ______________________HomePage-Specific Logic___________________ */
  if (document.body.id === "homePage") {
    // Hero slides show
    const slides = document.querySelectorAll(".hero-slide");
    const dotsContainer = document.getElementById("heroDots");

    generateDots();
    const dots = document.querySelectorAll(".hero-dot");

    let currentSlideIndex = 0;
    let timerId = null;
    const INTERVAL_MS = 7000;

    startAutoplay();

    function generateDots() {
      if (!slides || !dotsContainer) return;

      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `hero-dot ${i === 0 ? "is-active" : ""}`;
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", `${i === 0 ? "true" : "false"}`);
        dot.setAttribute("aria-label", `Show slide ${i + 1}`);
        dot.addEventListener("click", () => {
          goTo(i);
          resetAutoplay();
        });

        dotsContainer.append(dot);
      });
    }

    function goTo(index) {
      if (index < 0 || index >= slides.length) return;

      slides[currentSlideIndex].classList.remove("is-active");
      dots[currentSlideIndex].classList.remove("is-active");
      dots[currentSlideIndex].setAttribute("aria-selected", "false");

      currentSlideIndex = index;

      slides[currentSlideIndex].classList.add("is-active");
      dots[currentSlideIndex].classList.add("is-active");
      dots[currentSlideIndex].setAttribute("aria-selected", "true");
    }

    function startAutoplay() {
      timerId = setInterval(next, INTERVAL_MS);
    }

    function next() {
      goTo((currentSlideIndex + 1) % slides.length);
    }

    function stopAutoplay() {
      clearInterval(timerId);
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    /* __________________________________________________________________ */
    // Handle form data using third-party email API and show thankyou modal
    const feedbackForm = document.getElementById("feedbackForm");
    const modal = document.querySelector("dialog");
    const closeModalBtn = document.getElementById("closeModalBtn");
    if (feedbackForm) {
      feedbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Gather all form inputs instantly
        const formData = new FormData(feedbackForm);

        try {
          // 2. Send the data to the third-party email API
          const response = await fetch(feedbackForm.action, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            modal.showModal();
            feedbackForm.reset();
          } else {
            alert("Something went wrong. Please try again.");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      });
    }
    closeModalBtn.addEventListener("click", () => modal.close());

    /* __________________________________________________________________ */
    // Gallery slides and lightbox functionality
    const thumbnailTrack = document.getElementById("bannerTrack");
    const lightbox = document.querySelector(".lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");

    // get the initial gallery items
    const initialItems = Array.from(thumbnailTrack.children);

    // capture initial items metadata
    const galleryDataArr = initialItems.map((item) => {
      const img = item.querySelector("img");
      return {
        src: img.src,
        caption: img.getAttribute("alt") || "",
      };
    });

    // clone the track items for seamless loop setup
    initialItems.forEach((item) => {
      const clone = item.cloneNode(true);
      thumbnailTrack.appendChild(clone);
    });

    // Track the current lightbox item index
    let activeIndex = 0;

    // update lightbox item by index
    function updateLightBoxView(index) {
      // reset the view
      lightbox.classList.add("loading");
      lightboxImg.classList.remove("loaded");

      // rebind source parameters
      lightboxImg.src = galleryDataArr[index].src;
      lightboxCaption.textContent = galleryDataArr[index].caption;
    }

    function navigateLightBox(direction) {
      if (!lightbox.classList.contains("active")) return;

      if (direction === "next") {
        activeIndex = (activeIndex + 1) % galleryDataArr.length;
      } else {
        activeIndex =
          (activeIndex - 1 + galleryDataArr.length) % galleryDataArr.length;
      }

      updateLightBoxView(activeIndex);
    }

    // arrow keys navigation
    window.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;

      switch (e.key) {
        case "Escape":
          closeLightBox();
          break;
        case "ArrowRight":
          navigateLightBox("next");
          break;
        case "ArrowLeft":
          navigateLightBox("prev");
          break;
      }
    });

    // close lightbox
    function closeLightBox() {
      lightbox.classList.remove("active");
      lightbox.classList.remove("loading");
      lightboxImg.classList.remove("loaded");

      setTimeout(() => (lightboxCaption.textContent = ""), 300);
    }

    // Image event callback clears states when browser paints media
    lightboxImg.onload = () => {
      lightbox.classList.remove("loading");
      lightboxImg.classList.add("loaded");
    };

    thumbnailTrack.addEventListener("click", (e) => {
      const clickedThumb = e.target.closest(".thumbnail");

      if (!clickedThumb) return;
      const targetSrc = clickedThumb.querySelector("img").src;

      activeIndex = galleryDataArr.findIndex((item) => item.src === targetSrc);
      updateLightBoxView(activeIndex);
      lightbox.classList.add("active");
    });

    lightboxCloseBtn.addEventListener("click", closeLightBox);
    nextBtn.addEventListener("click", () => {
      navigateLightBox("next");
    });
    prevBtn.addEventListener("click", () => {
      navigateLightBox("prev");
    });

    // Back to top btn
    const backToTop = document.querySelector(".back-to-top");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 800) {
        backToTop.style.opacity = 1;
        backToTop.style.display = "block";
      } else {
        backToTop.style.opacity = 0;
        backToTop.style.display = "none";
      }
    });
    backToTop.addEventListener("click", () =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      }),
    );
  }
  // End home-page-specific logic

  /* __________________________________________________________________ */
  // The Sidebar
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sideBar");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const menuIcon = menuToggle.querySelector("i");
  const collapsibleMenuBtns = document.querySelectorAll(".nav-group > button");
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  collapsibleMenuBtns.forEach((btn) =>
    btn.addEventListener("click", handleNavGroupClick),
  );

  resetNavPanels();

  mobileQuery.addEventListener("change", resetNavPanels);

  menuToggle.addEventListener("click", toggleSidebar);

  mobileOverlay.addEventListener("click", toggleSidebar);

  navLinks.forEach((link) =>
    link.addEventListener("click", () => {
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
      if (mobileQuery.matches) toggleSidebar();
    }),
  );

  function toggleSidebar() {
    sidebar.classList.toggle("open");
    mobileOverlay.classList.toggle("active");

    switchMenuIcon();
  }

  function resetNavPanels() {
    collapsibleMenuBtns.forEach((btn) => {
      const panel = btn.nextElementSibling;
      btn.setAttribute("aria-expanded", "false");
      panel.hidden = mobileQuery.matches;
    });
  }

  function handleNavGroupClick(event) {
    if (!mobileQuery.matches) return;

    const btn = event.currentTarget;
    const panel = btn.nextElementSibling;
    const expanded = btn.getAttribute("aria-expanded") === "true";

    btn.setAttribute("aria-expanded", expanded ? "false" : "true");
    panel.hidden = expanded;
  }

  function switchMenuIcon() {
    if (sidebar.classList.contains("open")) {
      menuIcon.classList.remove("fa-bars");
      menuIcon.classList.add("fa-times");
    } else {
      menuIcon.classList.add("fa-bars");
      menuIcon.classList.remove("fa-times");
    }
  }
});

// // hide and show navigation links in mobile view

// const navLinks = document.getElementById("navLinks");
// const menuToggle = document.querySelector(".menu-toggle");

// // If .menu-toggle doesn't exist, create it and insert in nav
// if (!menuToggle) {
//   const nav = document.querySelector("nav");
//   const btn = document.createElement("span");
//   btn.className = "menu-toggle fa fa-bars";
//   btn.setAttribute("aria-label", "Toggle navigation menu");
//   nav.appendChild(btn);
// }

// const menuBtn = document.querySelector(".menu-toggle");

// function openMenu() {
//   navLinks.style.right = "0";
//   menuBtn.classList.remove("fa-bars");
//   menuBtn.classList.add("fa-times");
// }

// function closeMenu() {
//   navLinks.style.right = "-45vw";
//   menuBtn.classList.remove("fa-times");
//   menuBtn.classList.add("fa-bars");
// }

// // Initial state: bars
// closeMenu();

// menuBtn.onclick = function (e) {
//   e.stopPropagation();
//   if (navLinks.style.right === "0" || navLinks.style.right === "0px") {
//     closeMenu();
//   } else {
//     openMenu();
//   }
// };

// // Close menu when clicking outside navLinks or menuBtn
// document.addEventListener("click", function (e) {
//   const isMenuOpen =
//     navLinks.style.right === "0" || navLinks.style.right === "0px";
//   if (!isMenuOpen) return;
//   // If click is outside navLinks and menuBtn
//   if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
//     closeMenu();
//   }
// });

// // Sticky nav on scroll
// const nav = document.querySelector("nav");
// const header = document.querySelector("header");

// window.addEventListener("scroll", () => {
//   const headerBottom = header.offsetTop + header.offsetHeight;
//   if (window.scrollY > headerBottom) {
//     nav.classList.add("sticky", "visible");
//   } else {
//     nav.classList.remove("sticky", "visible");
//   }
// });

// // The scroll to top button
// const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// window.addEventListener("scroll", () => {
//   if (window.scrollY > header.offsetHeight) {
//     scrollToTopBtn.classList.add("showBtn");
//   } else {
//     scrollToTopBtn.classList.remove("showBtn");
//   }
// });

// scrollToTopBtn.addEventListener("click", () => {
//   window.scrollTo({
//     top: 0,
//     behavior: "smooth",
//   });
// });

// // The footer clock
// function updateClock() {
//   const now = new Date();
//   const hours = now.getHours().toString().padStart(2, "0");
//   const minutes = now.getMinutes().toString().padStart(2, "0");
//   now.getSeconds().toString().padStart(2, "0");
//   const weekday = getWeekDay(now);
//   const month = getMonthOfTheYear(now);
//   const date = now.getDate();

//   document.getElementById(
//     "clock"
//   ).textContent = `${weekday} ${date} ${month} ${hours}:${minutes}`;
// }

// function getWeekDay(date) {
//   const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//   return days[date.getDay()];
// }

// function getMonthOfTheYear(date) {
//   const months = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   return months[date.getMonth()];
// }

// // update the time immediately, and then after every second
// updateClock();
// setInterval(updateClock, 1000);

// // Copyright year
// const year = document.getElementById("year");
// const thisYear = new Date().getFullYear();
// year.setAttribute("datetime", thisYear);
// year.textContent = thisYear;

// // Home Page-specific logic
// if (document.body.id === "homePage") {
//   // Carousel functionality
//   const heroSection = document.querySelector(".hero_section");
//   const prevBtn = document.querySelector(".prevBtn");
//   const nextBtn = document.querySelector(".nextBtn");
//   const heroTextBox = document.querySelector(".hero_text-box");
//   const dotsBox = document.querySelector(".hero-dots");

//   const images = [
//     {
//       image: "images/home-carousel/classes-1.jpg",
//       text: "Education is the great equalizer of our time. It gives hope to the hopeless and creates chances for those without... - Kofi Annan",
//     },
//     {
//       image: "images/home-carousel/admin-view.jpg",
//       text: "Just as food eaten without appetite is a tedious nourishment, so does study without zeal damage the memory by not assimilating what it absorbs. - R.Q",
//     },
//     {
//       image: "images/home-carousel/flag-square.jpg",
//       text: "You'll find that education is just about the only thing lying around loose in this world, and it's about the only thing a fellow can have as much of as he's willing to haul away. - John Graham",
//     },
//     {
//       image: "images/home-carousel/assembly.jpg",
//       text: "Intense curiosity keeps you young. When we're green we grow, when we're ripe we rot. -R.Q",
//     },
//     {
//       image: "images/home-carousel/plant-tree.jpeg",
//       text: "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
//     },
//   ];

//   let currentImageIndex = 0;

//   // Preload images
//   images.forEach((img) => {
//     const image = new Image();
//     image.src = img.image;
//   });

//   function updateBackground() {
//     // Remove show class and clear text for animation reset
//     heroTextBox.classList.remove("show");
//     heroTextBox.textContent = "";

//     // Change background image immediately
//     heroSection.style.backgroundImage = `linear-gradient(rgba(4, 9, 30, 0.5), rgba(4, 9, 30, 0.5)), url(${images[currentImageIndex].image})`;

//     heroSection.classList.add("ready"); // to fade in when JS loads

//     updateDots();

//     // Show text after 2 seconds
//     setTimeout(() => {
//       heroTextBox.textContent = images[currentImageIndex].text;
//       heroTextBox.classList.add("show");
//     }, 2000);
//   }

//   images.forEach(() => {
//     const dot = document.createElement("span");
//     dotsBox.append(dot);
//   });

//   function updateDots() {
//     const allDots = dotsBox.querySelectorAll("span");
//     allDots.forEach((dot) => dot.classList.remove("active"));
//     allDots[currentImageIndex].classList.add("active");
//   }

//   // initialize the background with the first image
//   updateBackground();

//   // Then autoplay after every 10 seconds
//   let autoplayId;

//   const startAutoplay = () => {
//     autoplayId = setInterval(() => {
//       currentImageIndex++;
//       if (currentImageIndex >= images.length) currentImageIndex = 0;
//       updateBackground();
//     }, 10000);
//   };

//   const stopAutoplay = () => {
//     clearInterval(autoplayId);
//   };

//   function resetAutoplay() {
//     stopAutoplay();
//     startAutoplay();
//   }
//   // call the startAutoplay function
//   startAutoplay();

//   // manual navigation
//   prevBtn.addEventListener("click", () => {
//     currentImageIndex--;
//     if (currentImageIndex < 0) currentImageIndex = images.length - 1;
//     updateBackground();
//     resetAutoplay();
//   });

//   nextBtn.addEventListener("click", () => {
//     currentImageIndex++;
//     if (currentImageIndex >= images.length) currentImageIndex = 0;
//     updateBackground();
//     resetAutoplay();
//   });

//   // Dots navigation
//   dotsBox.addEventListener("click", (e) => {
//     if (e.target.tagName === "SPAN") {
//       currentImageIndex = Array.from(dotsBox.children).indexOf(e.target);
//       updateBackground();
//       resetAutoplay();
//     }
//   });

//   // Mobile swipe support
//   let touchStartX = 0;
//   let touchEndX = 0;

//   heroSection.addEventListener("touchstart", (e) => {
//     touchStartX = e.changedTouches[0].clientX;
//   });

//   heroSection.addEventListener("touchend", (e) => {
//     touchEndX = e.changedTouches[0].clientX;
//     handleSwipe();
//     resetAutoplay();
//   });

//   function handleSwipe() {
//     if (touchStartX - touchEndX > 50) {
//       // Swipe left
//       currentImageIndex++;
//       if (currentImageIndex >= images.length) currentImageIndex = 0;
//       updateBackground();
//     } else if (touchEndX - touchStartX > 50) {
//       // Swipe right
//       currentImageIndex--;
//       if (currentImageIndex < 0) currentImageIndex = images.length - 1;
//       updateBackground();
//     }
//   }
//   // End of carousel functionality
// }

// // Swiper for testimonials: Swiper Library
// const swiperTestimonial = new Swiper(".testimonial__swiper", {
//   loop: true,
//   slidesPerView: "auto",
//   centeredSlides: "auto",
//   spaceBetween: 16,
//   grabCursor: true,
//   speed: 600,
//   effect: "coverflow",
//   coverflowEffect: {
//     rotate: -90,
//     depth: 600,
//     modifier: 0.5,
//     slideShadows: false,
//   },

//   // pagination
//   pagination: {
//     el: ".swiper-pagination",
//     clickable: true,
//   },

//   autoplay: {
//     delay: 3000,
//     disableOnInteraction: false,
//   },
// });

// // Scroll Reveal animation
// const sr = ScrollReveal({
//   distance: "50px",
//   duration: 1800,
//   easing: "ease-in-out",
//   reset: false,
// });

// function staggerReveal(selector, origin) {
//   sr.reveal(`${selector} > *`, {
//     origin: origin,
//     interval: 300,
//   });
// }

// staggerReveal(".stagger-top", "top");
// staggerReveal(".stagger-right", "right");
// staggerReveal(".stagger-bottom", "bottom");
// staggerReveal(".stagger-left", "left");

// sr.reveal(".fade-in", {
//   origin: "bottom",
//   opacity:0,
// });

// // ===== Handle Contact Form (submit via fetch and show thank you modal) =====
// const contactForm = document.querySelector(".contact-form"),
//   thankyouModal = document.querySelector(".thankyou_modal"),
//   closeIcon = document.querySelector(".close_icon");

// if (contactForm) {
//   contactForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const formData = new FormData(contactForm);

//     try {
//       const response = await fetch(contactForm.action, {
//         method: "POST",
//         body: formData,
//         headers: { Accept: "application/json" },
//       });

//       if (response.ok) {
//         contactForm.reset();
//         if (thankyouModal) thankyouModal.classList.add("show-modal");
//       } else {
//         alert("There was a problem submitting your form. Please try again.");
//       }
//     } catch (error) {
//       alert("Network error. Please try again later.");
//     }
//   });
// }

// function closeThankYouModal() {
//   if (thankyouModal) thankyouModal.classList.remove("show-modal");
// }

// if (closeIcon) {
//   closeIcon.addEventListener("click", closeThankYouModal);
// }

// if (thankyouModal) {
//   thankyouModal.addEventListener("click", (e) => {
//     if (e.target === thankyouModal) closeThankYouModal();
//   });
// }

// document.addEventListener("keydown", (e) => {
//   if (e.key === "Escape" && thankyouModal?.classList.contains("show-modal")) {
//     closeThankYouModal();
//   }
// });
