let db;
const request = indexedDB.open('my_money', 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('new_money', { autoIncrement: true });
};

request.onsuccess = function(e) {
    db = e.target.result;

    if (navigator.onLine) {
        uploadTracker();
    }
};

request.onerror = function(e) {
    console.log(e.target.errorCode)
};

function saveRecord(record) {
    const transaction = db.transaction(['new_money'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_money');

    budgetObjectStore.add(record);
};

function uploadTracker() {
    const transaction = db.transaction(['new_money'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_money');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_money'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_tracker');
                budgetObjectStore.clear();

                alert('All money movement has been submitted!')
            })
            .catch(err => {
                console.log(err)
            });
        }
    };
};

window.addEventListener('online', uploadTracker);