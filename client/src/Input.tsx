import './Input.css';

interface InputProps {
    searchQuery: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch: () => void;
    isLoading: boolean;
}

const Input: React.FC<InputProps> = ({ searchQuery, onInputChange, onSearch, isLoading }) => {

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch();
    }
  };

    const handleClear = () => {
        onInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchQuery}
        onChange={onInputChange}
        onKeyDown={handleKeyDown}

        placeholder="Enter YouTube video URL"
        disabled={isLoading}
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
      {isLoading ? (
          <svg className="icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" fill="none" />
            <path d="M12 2a10 10 0 0110 10h-2a8 8 0 10-8 8v2a10 10 0 010-20z" fill="red">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        ) : (
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M16.296 16.996a8 8 0 11.707-.708l3.909 3.91-.707.707-3.909-3.909zM18 11a7 7 0 00-14 0 7 7 0 1014 0z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default Input;
