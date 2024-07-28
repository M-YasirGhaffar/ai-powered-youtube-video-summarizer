import './Input.css';

interface InputProps {
    searchQuery: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch: () => void;
}

const Input: React.FC<InputProps> = ({ searchQuery, onInputChange, onSearch }) => {

    const handleClear = () => {
        onInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchQuery}
        onChange={onInputChange}
        placeholder="Paste youtube video URL here..."
        className="search-input"
      />
      {searchQuery && (
        <button className="clear-button" onClick={handleClear} aria-label="Clear search query">
          <svg className="clear-icon" viewBox="0 0 24 24">
            <path d="M12.71 12 20.86 3.85l-.71-.71L12 11.29l-8.15-8.15-.71.71L11.29 12 3.15 20.15l.71.71L12 12.71 20.15 20.86l.71-.71L12.71 12z" />
          </svg>
        </button>
      )}
      <button className="search-button" onClick={onSearch} aria-label="Search">
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M16.296 16.996a8 8 0 11.707-.708l3.909 3.91-.707.707-3.909-3.909zM18 11a7 7 0 00-14 0 7 7 0 1014 0z" />
        </svg>
      </button>
    </div>
  );
};

export default Input;
