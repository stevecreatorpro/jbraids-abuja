document.addEventListener('DOMContentLoaded', () => {

    const tbody = document.getElementById('bookings-tbody');
    const rescheduleModal = document.getElementById('reschedule-modal');
    const cancelModal = document.getElementById('cancel-modal');
    
    // Stats elements
    const statActive = document.getElementById('stat-active');
    const statHome = document.getElementById('stat-home');
    const statCancelled = document.getElementById('stat-cancelled');

    // Load bookings and render
    function loadAndRenderBookings() {
        let bookings = JSON.parse(localStorage.getItem('jbraids_bookings') || '[]');
        
        // Filter out cancellations older than 24h
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        
        bookings = bookings.filter(b => {
            if (b.status === 'Cancelled' && b.cancelTimestamp) {
                return (now - b.cancelTimestamp) < TWENTY_FOUR_HOURS;
            }
            return true;
        });
        
        // Save back the filtered list so old ones are fully pruned
        localStorage.setItem('jbraids_bookings', JSON.stringify(bookings));
        
        // Sort: upcoming logic or just reverse chronological by id
        bookings.sort((a, b) => b.id - a.id);

        renderTable(bookings);
        updateStats(bookings);
    }

    function renderTable(bookings) {
        tbody.innerHTML = '';
        
        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No bookings found.</td></tr>';
            return;
        }

        bookings.forEach(b => {
            const tr = document.createElement('tr');
            
            // Format Status Badge
            let badgeClass = 'status-badge confirmed';
            if (b.status === 'Cancelled') badgeClass = 'status-badge cancelled';
            if (b.status === 'Rescheduled') badgeClass = 'status-badge rescheduled';

            // Format Service Name (Convert underscore to space and capitalize)
            let serviceDisplay = b.service ? b.service.replace(/_/g, ' ') : 'N/A';
            serviceDisplay = serviceDisplay.replace(/\b\w/g, l => l.toUpperCase());

            // Calculate Price
            let total = 0;
            const rates = {
                knotless_medium: 25000, knotless_large: 15000, knotless_small: 35000,
                box_braids: 20000, ghana_weaving: 15000,
                starter_locs: 20000, loc_retwist: 15000, faux_locs: 40000,
                kids_braids: 18000, wig_revamp: 15000
            };
            if(rates[b.service]) total += rates[b.service];
            
            if(b.length === 'mid_back') total += 5000;
            if(b.length === 'waist') total += 10000;
            if(b.length === 'knee') total += 20000;
            
            if(b.wash === 'yes') total += 5000;

            if(b.service_location === 'home') {
                if(b.home_area === 'wuse') total += 10000;
                if(b.home_area === 'garki' || b.home_area === 'gwarinpa') total += 15000;
                if(b.home_area === 'lugbe') total += 25000;
            }

            const formattedPrice = total > 0 ? '₦' + total.toLocaleString() : 'TBD';

            // Format Location
            let locDisplay = b.service_location === 'home' 
                ? `<span style="color:var(--color-primary)"><i class="fas fa-home"></i> Home (${b.home_area})</span>` 
                : '<i class="fas fa-store"></i> Salon';

            // Build Row
            tr.innerHTML = `
                <td>#${b.id.toString().slice(-4)}</td>
                <td>
                    <strong>${b.name}</strong><br>
                    <span style="font-size:0.85em; color:var(--color-text-muted);">${b.phone}</span>
                </td>
                <td>${serviceDisplay}</td>
                <td style="color:var(--color-primary-light); font-weight:600;">${formattedPrice}</td>
                <td>
                    <strong>${b.date}</strong><br>
                    <span style="font-size:0.85em; color:var(--color-text-muted);"><i class="far fa-clock"></i> ${b.time}</span>
                </td>
                <td>${locDisplay}</td>
                <td><span class="${badgeClass}">${b.status}</span></td>
                <td>
                    ${b.status !== 'Cancelled' ? `
                        <button class="action-btn" onclick="openReschedule(${b.id})" title="Reschedule"><i class="fas fa-calendar-alt"></i></button>
                        <button class="action-btn danger" onclick="openCancel(${b.id})" title="Cancel"><i class="fas fa-times-circle"></i></button>
                    ` : '<span style="color:var(--color-text-muted); font-size:0.85em;">No actions</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function updateStats(bookings) {
        let activeCount = 0;
        let homeCount = 0;
        let cancelledCount = 0;

        bookings.forEach(b => {
            if (b.status !== 'Cancelled') {
                activeCount++;
            } else {
                cancelledCount++;
            }
            if (b.service_location === 'home' && b.status !== 'Cancelled') {
                homeCount++;
            }
        });

        statActive.textContent = activeCount;
        statHome.textContent = homeCount;
        statCancelled.textContent = cancelledCount;
    }

    // Bind Reschedule Logic
    window.openReschedule = function(id) {
        document.getElementById('reschedule-id').value = id;
        document.getElementById('modal-booking-id').textContent = id.toString().slice(-4);
        rescheduleModal.style.display = 'flex';
    };

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        rescheduleModal.style.display = 'none';
        document.getElementById('reschedule-form').reset();
    });

    document.getElementById('reschedule-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('reschedule-id').value;
        const newDate = document.getElementById('new-date').value;
        const newTime = document.getElementById('new-time').value;

        let bookings = JSON.parse(localStorage.getItem('jbraids_bookings') || '[]');
        const index = bookings.findIndex(b => b.id.toString() === id.toString());
        
        if (index > -1) {
            bookings[index].date = newDate;
            bookings[index].time = newTime;
            bookings[index].status = 'Rescheduled';
            localStorage.setItem('jbraids_bookings', JSON.stringify(bookings));
        }

        rescheduleModal.style.display = 'none';
        document.getElementById('reschedule-form').reset();
        loadAndRenderBookings();
    });

    // Bind Cancel Logic
    window.openCancel = function(id) {
        document.getElementById('cancel-id').value = id;
        cancelModal.style.display = 'flex';
    };

    document.getElementById('close-cancel-btn').addEventListener('click', () => {
        cancelModal.style.display = 'none';
    });

    document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
        const id = document.getElementById('cancel-id').value;
        let bookings = JSON.parse(localStorage.getItem('jbraids_bookings') || '[]');
        const index = bookings.findIndex(b => b.id.toString() === id.toString());
        
        if (index > -1) {
            bookings[index].status = 'Cancelled';
            bookings[index].cancelTimestamp = Date.now();
            localStorage.setItem('jbraids_bookings', JSON.stringify(bookings));
        }

        cancelModal.style.display = 'none';
        loadAndRenderBookings();
    });

    // Handle Manual Refresh
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadAndRenderBookings();
    });

    // Initial Load
    loadAndRenderBookings();
});
