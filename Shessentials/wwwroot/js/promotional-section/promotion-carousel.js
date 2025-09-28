document.addEventListener('DOMContentLoaded', function() {
    // Carousel functionality
    const carousel = document.querySelector('.promo-carousel');
    const slides = document.querySelectorAll('.promo-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const video = document.querySelector('.promo-video');
    const playButton = document.querySelector('.video-play-button');
    
    let currentSlide = 0;
    let slideInterval;
    let isVideoPlaying = false;
    let isVideoSlideActive = false;
    
    // Function to show a specific slide
    function showSlide(index) {
        // Pause video if playing and we're leaving the video slide
        if (isVideoPlaying && currentSlide === 1) { // Assuming video is at index 1
            video.pause();
            isVideoPlaying = false;
            playButton.style.display = 'flex';
        }
        
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        
        // Update video slide status
        isVideoSlideActive = (index === 1); // Assuming video is at index 1
        
        currentSlide = index;
    }
    
    // Function to show next slide (with video check)
    function nextSlide() {
        // Don't proceed if video is playing
        if (isVideoPlaying && isVideoSlideActive) {
            return; // Exit function, carousel won't slide
        }
        
        let nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }
    
    // Function to show previous slide (with video check)
    function prevSlide() {
        // Don't proceed if video is playing
        if (isVideoPlaying && isVideoSlideActive) {
            return; // Exit function, carousel won't slide
        }
        
        let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }
    
    // Set up auto-rotation (with video check)
    function startAutoRotation() {
        slideInterval = setInterval(function() {
            // Check if video is playing before proceeding with auto-slide
            if (isVideoPlaying && isVideoSlideActive) {
                // Video is playing, don't slide - wait for next interval
                return;
            }
            nextSlide();
        }, 20000); // Change slide every 20 seconds
    }
    
    // Stop auto-rotation
    function stopAutoRotation() {
        clearInterval(slideInterval);
    }
    
    // Video play/pause functionality
    function toggleVideoPlay() {
        if (video.paused) {
            video.play();
            isVideoPlaying = true;
            playButton.style.display = 'none';
            
            // Stop auto-rotation when video starts playing
            stopAutoRotation();
        } else {
            video.pause();
            isVideoPlaying = false;
            playButton.style.display = 'flex';
            
            // Restart auto-rotation when video is paused
            startAutoRotation();
        }
    }
    
    // Video ended event - restart auto-rotation when video finishes
    video.addEventListener('ended', function() {
        isVideoPlaying = false;
        playButton.style.display = 'flex';
        
        // Restart auto-rotation when video ends
        startAutoRotation();
    });
    
    // Add click events to indicators (with video check)
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            const slideIndex = parseInt(this.getAttribute('data-slide'));
            
            // Don't allow navigation away from video slide if video is playing
            if (isVideoPlaying && isVideoSlideActive && slideIndex !== currentSlide) {
                return; // Exit function, navigation not allowed
            }
            
            showSlide(slideIndex);
            stopAutoRotation();
            startAutoRotation(); // Restart the timer after manual navigation
        });
    });
    
    // Add click events to navigation arrows (with video check)
    prevButton.addEventListener('click', function() {
        // Don't allow navigation if video is playing
        if (isVideoPlaying && isVideoSlideActive) {
            return; // Exit function, navigation not allowed
        }
        
        prevSlide();
        stopAutoRotation();
        startAutoRotation();
    });
    
    nextButton.addEventListener('click', function() {
        // Don't allow navigation if video is playing
        if (isVideoPlaying && isVideoSlideActive) {
            return; // Exit function, navigation not allowed
        }
        
        nextSlide();
        stopAutoRotation();
        startAutoRotation();
    });
    
    // Add click event to video play button
    playButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering the overlay link
        toggleVideoPlay();
    });
    
    // Pause auto-rotation when hovering over carousel
    carousel.addEventListener('mouseenter', stopAutoRotation);
    carousel.addEventListener('mouseleave', function() {
        // Only restart auto-rotation if video is not playing
        if (!isVideoPlaying || !isVideoSlideActive) {
            startAutoRotation();
        }
    });
    
    // Pause video when switching slides
    video.addEventListener('pause', function() {
        isVideoPlaying = false;
        playButton.style.display = 'flex';
    });
    
    // Video play event
    video.addEventListener('play', function() {
        isVideoPlaying = true;
        playButton.style.display = 'none';
    });
    
    // Start the auto-rotation
    startAutoRotation();
});