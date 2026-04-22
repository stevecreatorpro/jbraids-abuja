document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Header Scroll Effect ---
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 15, 11, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.background = 'rgba(15, 15, 11, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // --- Booking Multi-Step Form Logic ---
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        const steps = Array.from(document.querySelectorAll('.booking-step'));
        const nextBtns = document.querySelectorAll('.next-step');
        const prevBtns = document.querySelectorAll('.prev-step');
        const progressBar = document.getElementById('booking-progress');
        
        let currentStep = 0;

        function showStep(index) {
            steps.forEach((step, i) => {
                step.classList.toggle('active', i === index);
            });
            if(progressBar) {
                const progress = ((index) / (steps.length - 1)) * 100;
                progressBar.style.width = `${progress}%`;
            }
        }

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep > 0) {
                    currentStep--;
                    showStep(currentStep);
                }
            });
        });

        // Toggle Home Service Fields
        const homeServiceRadio = document.querySelector('input[name="service_location"][value="home"]');
        const salonRadio = document.querySelector('input[name="service_location"][value="salon"]');
        const homeServiceFields = document.getElementById('home-service-fields');

        if(homeServiceRadio && salonRadio && homeServiceFields) {
            homeServiceRadio.addEventListener('change', () => {
                if(homeServiceRadio.checked) {
                    homeServiceFields.style.display = 'block';
                }
            });
            salonRadio.addEventListener('change', () => {
                if(salonRadio.checked) {
                    homeServiceFields.style.display = 'none';
                }
            });
        }

        // Form Submit Simulation Sync to Local Storage
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(bookingForm);
            const bookingData = Object.fromEntries(formData.entries());
            
            // Sync to local storage
            let bookings = JSON.parse(localStorage.getItem('jbraids_bookings') || '[]');
            bookingData.id = Date.now();
            bookingData.status = 'Confirmed';
            bookings.push(bookingData);
            localStorage.setItem('jbraids_bookings', JSON.stringify(bookings));

            // Hide form, show success
            bookingForm.style.display = 'none';
            document.getElementById('booking-success').style.display = 'block';
        });
    }

    // --- Portfolio Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if(filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterValue = btn.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    if(filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                        setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => { item.style.display = 'none'; }, 300);
                    }
                });
            });
        });
    }
});
