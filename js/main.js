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
    // Intersection Observer for main content fade-in effect
    const mainDivs = document.querySelectorAll(
      ".main > div:not(div.testimonial-container)"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.3,
      }
    );
    mainDivs.forEach((div) => observer.observe(div));

    const cards = document.querySelectorAll(".testimonial-card");
    const observeCards = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("rotate");
        }
      });
    });
    cards.forEach((card) => observeCards.observe(card));

    // swiper slider
    function initSwiper() {
      if (typeof Swiper === "undefined") return;
      new Swiper(".testimonial-swiper", {
        loop: true,
        grabCursor: true,
        spaceBetween: 20,
        slidesPerView: 1,
        breakpoints: {
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2.2 },
        },
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: ".swiper-pagination", clickable: true },
      });
    }

    initSwiper();

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
      })
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
    btn.addEventListener("click", handleNavGroupClick)
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
    })
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
