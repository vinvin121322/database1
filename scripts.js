// scripts.js
let db;

// Initialize the database
function initDatabase() {
    const config = {
        locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${filename}`
    };

    initSqlJs(config).then(SQL => {
        db = new SQL.Database();
        createTables();
    });
}

// Create tables
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS VisualNovels (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Title TEXT NOT NULL,
            Developer TEXT NOT NULL,
            ReleaseDate TEXT,
            Description TEXT,
            GenreID INTEGER,
            FOREIGN KEY (GenreID) REFERENCES Genres(ID)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Characters (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            Role TEXT,
            VisualNovelID INTEGER,
            FOREIGN KEY (VisualNovelID) REFERENCES VisualNovels(ID)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Genres (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Reviews (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserName TEXT NOT NULL,
            Rating INTEGER CHECK (Rating >= 1 AND Rating <= 5),
            Comment TEXT,
            VisualNovelID INTEGER,
            FOREIGN KEY (VisualNovelID) REFERENCES VisualNovels(ID)
        )
    `);
}

// Show form based on action
function showForm(action) {
    let formHTML = '';
    switch (action) {
        case 'addNovel':
            const genres = db.exec('SELECT * FROM Genres');
            const genreOptions = genres.length > 0 ? genres[0].values.map(genre => `<option value="${genre[0]}">${genre[1]}</option>`).join('') : '';
            formHTML = `
                <h2>Add a Visual Novel</h2>
                <form id="form">
                    <label for="title">Title:</label>
                    <input type="text" id="title" required>
                    <label for="developer">Developer:</label>
                    <input type="text" id="developer" required>
                    <label for="releaseDate">Release Date:</label>
                    <input type="date" id="releaseDate" required>
                    <label for="description">Description:</label>
                    <textarea id="description" required></textarea>
                    <label for="genreID">Genre:</label>
                    <select id="genreID" required>
                        <option value="">Select a genre</option>
                        ${genreOptions}
                    </select>
                    <button type="submit">Add Novel</button>
                </form>
            `;
            break;
        case 'addGenre':
            formHTML = `
                <h2>Add a Genre</h2>
                <form id="form">
                    <label for="name">Genre Name:</label>
                    <input type="text" id="name" required>
                    <button type="submit">Add Genre</button>
                </form>
            `;
            break;
        case 'addCharacter':
            formHTML = `
                <h2>Add a Character</h2>
                <form id="form">
                    <label for="name">Name:</label>
                    <input type="text" id="name" required>
                    <label for="role">Role:</label>
                    <input type="text" id="role" required>
                    <label for="visualNovelID">Visual Novel ID:</label>
                    <input type="number" id="visualNovelID" required>
                    <button type="submit">Add Character</button>
                </form>
            `;
            break;
        case 'addReview':
            formHTML = `
                <h2>Add a Review</h2>
                <form id="form">
                    <label for="userName">User Name:</label>
                    <input type="text" id="userName" required>
                    <label for="rating">Rating (1-5):</label>
                    <input type="number" id="rating" min="1" max="5" required>
                    <label for="comment">Comment:</label>
                    <textarea id="comment" required></textarea>
                    <label for="visualNovelID">Visual Novel ID:</label>
                    <input type="number" id="visualNovelID" required>
                    <button type="submit">Add Review</button>
                </form>
            `;
            break;
        case 'updateNovel':
            formHTML = `
                <h2>Update a Visual Novel</h2>
                <form id="form">
                    <label for="id">Visual Novel ID:</label>
                    <input type="number" id="id" required>
                    <label for="title">New Title:</label>
                    <input type="text" id="title">
                    <label for="developer">New Developer:</label>
                    <input type="text" id="developer">
                    <label for="releaseDate">New Release Date:</label>
                    <input type="date" id="releaseDate">
                    <label for="description">New Description:</label>
                    <textarea id="description"></textarea>
                    <button type="submit">Update Novel</button>
                </form>
            `;
            break;
        case 'deleteNovel':
            formHTML = `
                <h2>Delete a Visual Novel</h2>
                <form id="form">
                    <label for="id">Visual Novel ID:</label>
                    <input type="number" id="id" required>
                    <button type="submit">Delete Novel</button>
                </form>
            `;
            break;
        case 'searchNovels':
            const allGenres = db.exec('SELECT * FROM Genres');
            const genreSearchOptions = allGenres.length > 0 ? allGenres[0].values.map(genre => `<option value="${genre[0]}">${genre[1]}</option>`).join('') : '';
            formHTML = `
                <h2>Search Visual Novels</h2>
                <form id="form">
                    <label for="searchTerm">Search Term:</label>
                    <input type="text" id="searchTerm">
                    <label for="genreID">Genre:</label>
                    <select id="genreID">
                        <option value="">All Genres</option>
                        ${genreSearchOptions}
                    </select>
                    <label for="developer">Developer:</label>
                    <input type="text" id="developer">
                    <button type="submit">Search</button>
                </form>
            `;
            break;
    }
    document.getElementById('content').innerHTML = formHTML;
    document.getElementById('form').addEventListener('submit', function(event) {
        event.preventDefault();
        handleFormSubmit(action);
    });
}

// Handle form submission
function handleFormSubmit(action) {
    switch (action) {
        case 'addNovel':
            const title = document.getElementById('title').value;
            const developer = document.getElementById('developer').value;
            const releaseDate = document.getElementById('releaseDate').value;
            const description = document.getElementById('description').value;
            const genreID = document.getElementById('genreID').value;
            db.run(`
                INSERT INTO VisualNovels (Title, Developer, ReleaseDate, Description, GenreID)
                VALUES (?, ?, ?, ?, ?)
            `, [title, developer, releaseDate, description, genreID]);
            alert('Visual novel added successfully!');
            break;
        case 'addGenre':
            const genreName = document.getElementById('name').value;
            db.run(`
                INSERT INTO Genres (Name)
                VALUES (?)
            `, [genreName]);
            alert('Genre added successfully!');
            break;
        case 'addCharacter':
            const name = document.getElementById('name').value;
            const role = document.getElementById('role').value;
            const visualNovelID = document.getElementById('visualNovelID').value;
            db.run(`
                INSERT INTO Characters (Name, Role, VisualNovelID)
                VALUES (?, ?, ?)
            `, [name, role, visualNovelID]);
            alert('Character added successfully!');
            break;
        case 'addReview':
            const userName = document.getElementById('userName').value;
            const rating = document.getElementById('rating').value;
            const comment = document.getElementById('comment').value;
            const reviewVisualNovelID = document.getElementById('visualNovelID').value;
            db.run(`
                INSERT INTO Reviews (UserName, Rating, Comment, VisualNovelID)
                VALUES (?, ?, ?, ?)
            `, [userName, rating, comment, reviewVisualNovelID]);
            alert('Review added successfully!');
            break;
        case 'updateNovel':
            const novelID = document.getElementById('id').value;
            const newTitle = document.getElementById('title').value;
            const newDeveloper = document.getElementById('developer').value;
            const newReleaseDate = document.getElementById('releaseDate').value;
            const newDescription = document.getElementById('description').value;
            let updates = [];
            if (newTitle) updates.push(`Title = '${newTitle}'`);
            if (newDeveloper) updates.push(`Developer = '${newDeveloper}'`);
            if (newReleaseDate) updates.push(`ReleaseDate = '${newReleaseDate}'`);
            if (newDescription) updates.push(`Description = '${newDescription}'`);
            if (updates.length > 0) {
                db.run(`
                    UPDATE VisualNovels
                    SET ${updates.join(', ')}
                    WHERE ID = ?
                `, [novelID]);
                alert('Visual novel updated successfully!');
            } else {
                alert('No changes made.');
            }
            break;
        case 'deleteNovel':
            const deleteNovelID = document.getElementById('id').value;
            db.run(`DELETE FROM VisualNovels WHERE ID = ?`, [deleteNovelID]);
            alert('Visual novel deleted successfully!');
            break;
        case 'searchNovels':
            const searchTerm = document.getElementById('searchTerm').value;
            const genreIDFilter = document.getElementById('genreID').value;
            const developerFilter = document.getElementById('developer').value;
            let query = `
                SELECT VisualNovels.*, Genres.Name AS GenreName
                FROM VisualNovels
                LEFT JOIN Genres ON VisualNovels.GenreID = Genres.ID
                WHERE 1=1
            `;
            if (searchTerm) query += ` AND (Title LIKE '%${searchTerm}%' OR Developer LIKE '%${searchTerm}%')`;
            if (genreIDFilter) query += ` AND GenreID = ${genreIDFilter}`;
            if (developerFilter) query += ` AND Developer LIKE '%${developerFilter}%'`;
            const results = db.exec(query);
            displayResults(results);
            break;
    }
}

// Display search results
function displayResults(results) {
    let content = '<h2>Search Results</h2>';
    if (results.length > 0) {
        const novels = results[0].values;
        content += '<table><tr><th>ID</th><th>Title</th><th>Developer</th><th>Release Date</th><th>Genre</th><th>Description</th></tr>';
        for (const novel of novels) {
            content += `<tr onclick="viewNovelDetails(${novel[0]})"><td>${novel[0]}</td><td>${novel[1]}</td><td>${novel[2]}</td><td>${novel[3]}</td><td>${novel[6] || 'N/A'}</td><td>${novel[4]}</td></tr>`;
        }
        content += '</table>';
    } else {
        content += '<p>No results found.</p>';
    }
    document.getElementById('content').innerHTML = content;
}

// View all visual novels
function viewNovels() {
    const results = db.exec('SELECT VisualNovels.*, Genres.Name AS GenreName FROM VisualNovels LEFT JOIN Genres ON VisualNovels.GenreID = Genres.ID');
    displayResults(results);
}

// View details of a specific visual novel
function viewNovelDetails(novelID) {
    const novel = db.exec(`SELECT VisualNovels.*, Genres.Name AS GenreName FROM VisualNovels LEFT JOIN Genres ON VisualNovels.GenreID = Genres.ID WHERE VisualNovels.ID = ${novelID}`)[0].values[0];
    const characters = db.exec(`SELECT * FROM Characters WHERE VisualNovelID = ${novelID}`)[0]?.values || [];
    const reviews = db.exec(`SELECT * FROM Reviews WHERE VisualNovelID = ${novelID}`)[0]?.values || [];

    let content = `
        <h2>${novel[1]}</h2>
        <div class="novel-details">
            <p><strong>Developer:</strong> ${novel[2]}</p>
            <p><strong>Release Date:</strong> ${novel[3]}</p>
            <p><strong>Genre:</strong> ${novel[6] || 'N/A'}</p>
            <p><strong>Description:</strong> ${novel[4]}</p>
            <h3>Characters</h3>
            <ul>
                ${characters.map(char => `<li>${char[1]} (${char[2]})</li>`).join('')}
            </ul>
            <h3>Reviews</h3>
            <ul>
                ${reviews.map(review => `<li>${review[1]} - ${review[2]}/5: ${review[3]}</li>`).join('')}
            </ul>
        </div>
    `;
    document.getElementById('content').innerHTML = content;
}

// Initialize the database when the page loads
window.onload = initDatabase;