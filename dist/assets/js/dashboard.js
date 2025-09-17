// Assumes Firebase is already initialized, for example in firebase-config.js

document.addEventListener('DOMContentLoaded', (event) => {
    // Firestore database instance
    const db = firebase.firestore();

    // Function to fetch and update the Total Users count
    const updateTotalUsers = async () => {
        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.get();
            const totalUsers = snapshot.size;

            const totalUsersElement = document.getElementById('totalUsersValue');
            if (totalUsersElement) {
                totalUsersElement.textContent = totalUsers;
            } else {
                console.error("Element with ID 'totalUsersValue' not found.");
            }
        } catch (error) {
            console.error("Error fetching users count: ", error);
        }
    };

    // Function to fetch and update the Total Transactions count
    const updateTotalTransactions = async () => {
        try {
            const transactionsRef = db.collection('transactions'); // Assuming a transactions collection
            const snapshot = await transactionsRef.get();
            const totalTransactions = snapshot.size;

            const totalTransactionsElement = document.getElementById('totalTransactionsValue');
            if (totalTransactionsElement) {
                totalTransactionsElement.textContent = totalTransactions;
            } else {
                console.error("Element with ID 'totalTransactionsValue' not found.");
            }
        } catch (error) {
            console.error("Error fetching transactions count: ", error);
        }
    };

    // Function to fetch and calculate total income
    const updateTotalIncome = async () => {
        try {
            let totalReceived = 0;
            const usersRef = db.collection('users');

            // Get all documents from the 'users' collection
            const snapshot = await usersRef.get();
            
            snapshot.forEach(doc => {
                // Get the data for each user
                const userData = doc.data();
                // Add the 'totalReceived' amount to the total, if it exists
                if (userData.totalReceived) {
                    totalReceived += userData.totalReceived;
                }
            });

            // Calculate the total income based on the formula: total received * 0.2
            const totalIncome = totalReceived * 0.2;

            // Find the HTML element to display the total income
            const totalIncomeElement = document.getElementById('totalIncomeValue');

            if (totalIncomeElement) {
                // Update the text content with the new value, formatted as currency
                totalIncomeElement.textContent = `₹${totalIncome.toFixed(2)}`;
            } else {
                console.error("Element with ID 'totalIncomeValue' not found.");
            }
        } catch (error) {
            console.error("Error fetching documents: ", error);
        }
    };

    // Call all the functions to update the dashboard cards when the page loads
    updateTotalUsers();
    updateTotalTransactions();
    updateTotalIncome();
});