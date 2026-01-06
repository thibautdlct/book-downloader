import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '../types';
import { getDownloadedBooks, getThumbnailUrl, deleteDownloadedFile } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ToastContainer } from '../components/ToastContainer';

interface DownloadedBooksPageProps {
  config: any;
  authRequired: boolean;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const DownloadedBooksPage = ({
  config,
  authRequired,
  isAuthenticated,
  onLogout,
}: DownloadedBooksPageProps) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toasts, showToast } = useToast();

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const downloadedBooks = await getDownloadedBooks();
      setBooks(downloadedBooks);
    } catch (error) {
      console.error('Failed to load downloaded books:', error);
      showToast('Failed to load downloaded books', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete || !bookToDelete.download_path) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteDownloadedFile(bookToDelete.download_path);
      showToast('Livre supprimé avec succès', 'success');
      // Remove book from list
      setBooks(books.filter((b: Book) => b.id !== bookToDelete.id));
      setBookToDelete(null);
    } catch (error) {
      console.error('Failed to delete book:', error);
      showToast('Erreur lors de la suppression du livre', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setBookToDelete(null);
  };

  // Filter books based on search query
  const filteredBooks = books.filter((book) => {
    if (!searchQuery.trim()) {
      return true;
    }
    const query = searchQuery.toLowerCase();
    const title = (book.title || '').toLowerCase();
    const author = (book.author || '').toLowerCase();
    const year = (book.year || '').toString();
    const format = (book.format || '').toLowerCase();
    
    return (
      title.includes(query) ||
      author.includes(query) ||
      year.includes(query) ||
      format.includes(query)
    );
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header
        calibreWebUrl={config?.calibre_web_url || ''}
        logoUrl="/logo.png"
        showSearch={false}
        searchInput=""
        onSearchChange={() => {}}
        onDownloadsClick={() => navigate('/')}
        onBooksClick={() => navigate('/downloaded-books')}
        statusCounts={{ ongoing: 0, completed: 0, errored: 0 }}
        onLogoClick={() => navigate('/')}
        authRequired={authRequired}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
        onSearch={() => {}}
        onAdvancedToggle={() => {}}
        isLoading={false}
        downloadsButtonLabel="Accueil"
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un livre (titre, auteur, année, format)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-color)',
              }}
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              style={{ color: 'var(--text-muted)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover-action"
                aria-label="Effacer la recherche"
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={loadBooks}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded border text-sm hover-action transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--border-muted)' }}
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Actualiser
          </button>
          <div className="text-sm opacity-70" style={{ color: 'var(--text-muted)' }}>
            {searchQuery ? (
              <>
                {filteredBooks.length} / {books.length} {books.length === 1 ? 'livre' : 'livres'}
              </>
            ) : (
              <>
                {books.length} {books.length === 1 ? 'livre' : 'livres'}
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--text)' }}></div>
            <p className="mt-4 text-sm opacity-70" style={{ color: 'var(--text-muted)' }}>
              Chargement...
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm opacity-70" style={{ color: 'var(--text-muted)' }}>
              {searchQuery ? 'Aucun livre ne correspond à votre recherche' : 'Aucun livre téléchargé pour le moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="relative rounded-lg border hover:shadow-md transition-shadow overflow-hidden"
                style={{ borderColor: 'var(--border-muted)', background: 'var(--bg-soft)' }}
              >
                {/* Delete Button - top right corner */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(book);
                  }}
                  className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
                  title="Supprimer le livre"
                  aria-label="Supprimer le livre"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>

                <div className="flex flex-col sm:flex-col max-sm:flex-row h-full">
                  {/* Book Thumbnail */}
                  <div className="flex-shrink-0 w-full sm:w-full max-sm:w-[120px] max-sm:h-auto" style={{ aspectRatio: '2/3' }}>
                    {book.preview ? (
                      <img
                        src={getThumbnailUrl(book.preview)}
                        alt={book.title || 'Book cover'}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'top' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-book.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm opacity-50" style={{ background: 'var(--border-muted)' }}>
                        No Cover
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 flex flex-col justify-between p-4 max-sm:flex-1 max-sm:min-w-0 max-sm:pr-10">
                    <div className="mb-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2" title={book.title} style={{ color: 'var(--text)' }}>
                        {book.title || 'Unknown Title'}
                      </h3>
                      <p className="text-xs opacity-70 line-clamp-1" title={book.author} style={{ color: 'var(--text-muted)' }}>
                        {book.author || 'Unknown Author'}
                      </p>
                      {book.year && (
                        <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--text-muted)' }}>
                          {book.year}
                        </p>
                      )}
                    </div>

                    {/* Details Row */}
                    <div className="mb-3">
                      <div className="text-xs opacity-70" style={{ color: 'var(--text-muted)' }}>
                        {book.format && <span className="uppercase">{book.format}</span>}
                        {book.format && book.size && <span> • </span>}
                        {book.size && <span>{book.size}</span>}
                      </div>
                    </div>

                    {/* Download Button */}
                    {book.download_path && (
                      <a
                        href={`/api/downloaded-file?path=${encodeURIComponent(book.download_path)}`}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded text-white text-sm font-medium transition-colors"
                        style={{ background: '#3b82f6', border: '1px solid #3b82f6' }}
                      >
                        <svg
                          className="w-4 h-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                        Télécharger
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <ToastContainer toasts={toasts} />

      {/* Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border-muted)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Confirmer la suppression
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Êtes-vous sûr de vouloir supprimer <strong>{bookToDelete.title}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 rounded border text-sm font-medium transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--border-muted)' }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: '#ef4444', border: '1px solid #ef4444' }}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

