document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Fetch user data
        const userResponse = await fetch('/api/auth/me', {
            headers: {
                'x-auth-token': token
            }
        });
        const userData = await userResponse.json();
        document.getElementById('userName').textContent = userData.name;

        // Fetch user's donations
        const donationsResponse = await fetch('/api/donations/my-donations', {
            headers: {
                'x-auth-token': token
            }
        });
        const donations = await donationsResponse.json();

        // Update stats
        updateDashboardStats(donations);

        // Update donations table
        updateDonationsTable(donations);

    } catch (error) {
        console.error('Error:', error);
        alert('Error loading dashboard data');
    }
});

function updateDashboardStats(donations) {
    const totalDonations = donations.length;
    const foodDonations = donations.filter(d => d.type === 'food').length;
    const moneyDonations = donations.filter(d => d.type === 'money')
        .reduce((total, d) => total + (d.moneyDetails?.amount || 0), 0);
    const peopleHelped = donations.reduce((total, d) => total + (d.impact?.peopleHelped || 0), 0);

    document.querySelector('.stat-card:nth-child(1) .number').textContent = totalDonations;
    document.querySelector('.stat-card:nth-child(2) .number').textContent = peopleHelped;
    // Update other stats as needed
}

function updateDonationsTable(donations) {
    const tbody = document.querySelector('.donations-table tbody');
    tbody.innerHTML = donations.map(donation => `
        <tr>
            <td>${new Date(donation.createdAt).toLocaleDateString()}</td>
            <td>${donation.type}</td>
            <td>${getDonationAmount(donation)}</td>
            <td><span class="status-badge status-${donation.status.toLowerCase()}">${donation.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewDonationDetails('${donation._id}')">
                    View Details
                </button>
            </td>
        </tr>
    `).join('');
}

function getDonationAmount(donation) {
    if (donation.type === 'money') {
        return `₹${donation.moneyDetails.amount}`;
    } else {
        return `${donation.foodDetails.quantity} ${donation.foodDetails.unit}`;
    }
}

function viewDonationDetails(donationId) {
    // Implement donation details view
    window.location.href = `/donation-details.html?id=${donationId}`;
} 