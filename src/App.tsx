import React, { useState, useEffect } from 'react';
import './App.css';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { auth } from './FirebaseConfig';

function App() {
  const [books, setBooks] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showInputFields, setShowInputFields] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const [bookData, setBookData] = useState({
    titolo: '',
    autore: '',
    genere: '',
    quantita: '',
    scaffale: '',
    possessore: '',
    armadio: '',
    nominativoS: '',
    classeS: '',
    dataP: '',
  });

  const [editingBookData, setEditingBookData] = useState({
    titolo: '',
    autore: '',
    genere: '',
    quantita: '',
    scaffale: '',
    possessore: '',
    armadio: '',
    nominativoS: '',
    classeS: '',
    dataP: '',
  });

  const updateBook = async (firestore, bookId, updatedData) => {
    const bookRef = doc(collection(firestore, 'listalibra'), bookId);
    await updateDoc(bookRef, updatedData);
  };

  const handleEditBook = (book) => {
    setEditingBookId(book.id);
    setEditingBookData({
      titolo: book.titolo,
      autore: book.autore,
      genere: book.genere,
      quantita: book.quantita,
      scaffale: book.scaffale,
      possessore: book.possessore,
      armadio: book.armadio,
      nominativoS: book.nominativoS,
      classeS: book.classeS,
      dataP: book.dataP,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const firestore = getFirestore();
    try {
      await updateBook(firestore, editingBookId, editingBookData);
      setEditingBookId(null);
      setIsEditing(false);
      loadBooks();
    } catch (error) {
      console.error('Errore durante il salvataggio delle modifiche:', error);
    }
  };

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      setUser(JSON.parse(userFromLocalStorage));
    }

    const loginFromLocalStorage = localStorage.getItem('isUserLoggedIn');
    if (loginFromLocalStorage) {
      setIsUserLoggedIn(JSON.parse(loginFromLocalStorage));
    }

    const showInputFieldsFromLocalStorage = localStorage.getItem('showInputFields');
    if (showInputFieldsFromLocalStorage) {
      setShowInputFields(JSON.parse(showInputFieldsFromLocalStorage));
    }
  }, []);

  useEffect(() => {
    const isDataComplete =
      bookData.titolo !== '' &&
      bookData.autore !== '' &&
      bookData.genere !== '' &&
      bookData.quantita !== '' &&
      bookData.scaffale !== '' &&
      bookData.possessore !== ''
      bookData.armadio !== '' &&
      bookData.nominativoS !== ''
      bookData.classeS !== '' &&
      bookData.dataP !== '' ;

    setIsSubmitDisabled(!isDataComplete);
  }, [bookData]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setShowInputFields(true);
      setIsUserLoggedIn(true);
      localStorage.setItem('showInputFields', JSON.stringify(true));
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('isUserLoggedIn', JSON.stringify(true));
    } catch (error) {
      console.error('Errore durante il login con Google:', error);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('showInputFields');
    localStorage.removeItem('isUserLoggedIn');
    setIsUserLoggedIn(false);
    try {
      await signOut(auth);
      setUser(null);
      setShowInputFields(false);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleBookSubmit = async () => {
    const firestore = getFirestore();
    try {
      await addDoc(collection(firestore, 'listalibra'), bookData);
      setBookData({
        titolo: '',
        autore: '',
        genere: '',
        quantita: '',
        scaffale: '',
        possessore: '',
        armadio: '',
        nominativoS: '',
        classeS: '',
        dataP: '',
      });
      loadBooks();
    } catch (error) {
      console.error('Errore durante il salvataggio su Firestore:', error);
    }
  };

  const loadBooks = async () => {
    const firestore = getFirestore();
    const booksQuery = query(
      collection(firestore, 'listalibra'),
      where('titolo', '>=', searchTerm)
    );

    const booksSnapshot = await getDocs(booksQuery);
    const booksData = [];

    booksSnapshot.forEach((doc) => {
      booksData.push({ id: doc.id, ...doc.data() });
    });

    setBooks(booksData);
  };

  const handleDeleteBook = (book) => {
    setBookToDelete(book);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    const firestore = getFirestore();
    try {
      const booksQuery = query(
        collection(firestore, 'listalibra'),
        where('titolo', '==', bookToDelete.titolo)
      );

      const booksSnapshot = await getDocs(booksQuery);

      booksSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Nascondi la conferma di eliminazione e resetta il libro da eliminare
      setShowDeleteConfirmation(false);
      setBookToDelete(null);

      loadBooks();
    } catch (error) {
      console.error('Errore durante l\'eliminazione del libro:', error);
    }
  };


  useEffect(() => {
    loadBooks();
  }, [searchTerm]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="google-login-container">
          {user ? (
            <div>
              <p>Benvenuto, {user.displayName} !</p>
              <p><img src="https://clipart.coolclips.com/480/vectors/tf05165/CoolClips_vc010169.png"/></p>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={handleGoogleLogin}>
              Login con Google
            </button>
          )}

          {showInputFields && (
            <div className="input-fields-container">
              <h1>Inserisci Libri</h1>
              <input
                type="text"
                name="titolo"
                placeholder="TITOLO"
                value={bookData.titolo}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                type="text"
                name="autore"
                placeholder="AUTORE"
                value={bookData.autore}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                type="text"
                name="genere"
                placeholder="GENERE"
                value={bookData.genere}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                type="number"
                name="quantita"
                placeholder="QUANTITA'"
                value={bookData.quantita}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                type="text"
                name="armadio"
                placeholder="ARMADIO"
                value={bookData.armadio}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                type="text"
                name="scaffale"
                placeholder="SCAFFALE"
                value={bookData.scaffale}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                type="text"
                name="possessore"
                placeholder="DISPONIBILE ?"
                value={bookData.possessore}
                onChange={handleInputChange}
                className="input-field"
              />
              <input
                type="text"
                name="nominativo"
                placeholder="NOMINATIVO STUDENTE"
                value={bookData.nominativoS}
                onChange={handleInputChange}
                className="input-field"
                id="nominativoStudente"
              />
              <input
                type="text"
                name="classe"
                placeholder="CLASSE STUDENTE"
                value={bookData.classeS}
                onChange={handleInputChange}
                className="input-field"
                id="classe"
              />
              <input
                type="text"
                name="data"
                placeholder="DATA DEL PRESTITO"
                value={bookData.dataP}
                onChange={handleInputChange}
                className="input-field"
                id="data"
              />
              <button
                onClick={handleBookSubmit}
                disabled={isSubmitDisabled}
                className="submit-button"
              >
                Invia
              </button>
            </div>
          )}
        </div>
        {isUserLoggedIn && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Cerca libro"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}
        {isUserLoggedIn && (
          <table className="book-table">
            <thead>
              <tr>
                <th>TITOLO</th>
                <th>AUTORE</th>
                <th>GENERE</th>
                <th>QUANTITA'</th>
                <th>ARMADIO</th>
                <th>SCAFFALE</th>
                <th>DISPONIBILE ?</th>
                <th>NOMINATIVO</th>
                <th>CLASSE</th>
                <th>DATA PRESTITO</th>
                <th>Modifica</th>
                <th>Elimina</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, index) => (
                <tr key={book.id}>
                  <td>{book.titolo}</td>
                  <td>{book.autore}</td>
                  <td>{book.genere}</td>
                  <td>
                    {isEditing && editingBookId === book.id ? (
                      <input
                        type="number"
                        name="quantita"
                        value={editingBookData.quantita}
                        onChange={(e) =>
                          setEditingBookData({
                            ...editingBookData,
                            quantita: e.target.value,
                          })
                        }
                      />
                    ) : (
                      book.quantita
                    )}
                  </td>
                  <td>
                    {isEditing && editingBookId === book.id ? (
                      <input
                        type="text"
                        name="armadio"
                        value={editingBookData.armadio}
                        onChange={(e) =>
                          setEditingBookData({
                            ...editingBookData,
                            armadio: e.target.value,
                          })
                        }
                      />
                    ) : (
                      book.armadio
                    )}
                  </td>
                  <td>
                    {isEditing && editingBookId === book.id ? (
                      <input
                        type="text"
                        name="scaffale"
                        value={editingBookData.scaffale}
                        onChange={(e) =>
                          setEditingBookData({
                            ...editingBookData,
                            scaffale: e.target.value,
                          })
                        }
                      />
                    ) : (
                      book.scaffale
                    )}
                  </td>
                  <td>
                    {isEditing && editingBookId === book.id ? (
                      <input
                        type="text"
                        name="possessore"
                        value={editingBookData.possessore}
                        onChange={(e) =>
                          setEditingBookData({
                            ...editingBookData,
                            possessore: e.target.value,
                          })
                        }
                      />
                    ) : (
                      book.possessore
                    )}
                  </td>
                  <td>
                    {isEditing && editingBookId === book.id ? (
                      <input
                        type="text"
                        name="nominativo"
                        value={editingBookData.nominativoS}
                        onChange={(e) =>
                          setEditingBookData({
                            ...editingBookData,
                            nominativoS: e.target.value,
                          })
                        }
                      />
                    ) : (
                      book.nominativoS
                    )}
                  </td>
                  <td>
                    {isEditing && editingBookId === book.id ? (
                      <input
                        type="text"
                        name="classe"
                        value={editingBookData.classeS}
                        onChange={(e) =>
                          setEditingBookData({
                            ...editingBookData,
                            classeS: e.target.value,
                          })
                        }
                      />
                    ) : (
                      book.classeS
                    )}
                  </td>
                  <td>
                    {isEditing && editingBookId === book.id ? (
                      <input
                        type="text"
                        name="dataP"
                        value={editingBookData.dataP}
                        onChange={(e) =>
                          setEditingBookData({
                            ...editingBookData,
                            dataP: e.target.value,
                          })
                        }
                      />
                    ) : (
                      book.dataP
                    )}
                  </td>
                  <td>
                    {isEditing && editingBookId === book.id ? (
                      <button id="salva" onClick={handleSaveEdit}>Salva modifiche</button>
                    ) : (
                      <button id="modifica" onClick={() => handleEditBook(book)}>Modifica</button>
                    )}
                  </td>
                      <td>
                        {showDeleteConfirmation ? (
                          <div>
                            <button  className="delete-button" onClick={handleConfirmDelete}>Conferma eliminazione</button>
                            <button id="salva" onClick={() => setShowDeleteConfirmation(false)}>Annulla</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteBook(book)}
                            className="delete-button"
                          >
                            Elimina
                          </button>
                        )}
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </header>
      <h6>Copyright@2023/24 -  All right are reserved 
        </h6>
    </div>
  );
}

export default App;
