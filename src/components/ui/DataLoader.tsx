export default function DataLoader() {
  return (
    <>
      {/* overlay to dim and block interaction */}
      <div className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-sm transition-opacity" />
      <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/60 backdrop-blur-sm rounded-full p-4 shadow-lg">
          <svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      </div>
    </>
  );
}