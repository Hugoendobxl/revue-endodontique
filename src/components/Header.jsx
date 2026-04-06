export default function Header({ totalCount }) {
  return (
    <header className="header">
      <div className="header-inner">
        <p className="header-subtitle">VEILLE SCIENTIFIQUE</p>
        <h1 className="header-title">Endodontic Literature Review</h1>
        <p className="header-count">{totalCount} article{totalCount !== 1 ? 's' : ''}</p>
      </div>
    </header>
  );
}
