export default function Filters({
  searchValue,
  tagFilterValue,
  hasActiveFilters,
  isLoading,
  onSearchChange,
  onTagFilterChange,
  onApply,
  onReset
}) {
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onApply();
    }
  }

  return (
    <section className="filters-panel" aria-label="Фильтры заметок">
      <div className="field compact-field">
        <label htmlFor="notes-search">Поиск</label>
        <input
          id="notes-search"
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="field compact-field">
        <label htmlFor="notes-tag-filter">Тег</label>
        <input
          id="notes-tag-filter"
          type="text"
          value={tagFilterValue}
          onChange={(event) => onTagFilterChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="filters-actions">
        <button className="button primary-button" type="button" onClick={onApply} disabled={isLoading}>
          Найти
        </button>
        {hasActiveFilters ? (
          <button className="button subtle-button" type="button" onClick={onReset} disabled={isLoading}>
            Сбросить
          </button>
        ) : null}
      </div>
    </section>
  );
}
