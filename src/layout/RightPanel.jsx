function RightPanel({ isOpen, toggle }) {
  return (
    <aside className={`right-panel ${isOpen ? "open" : "collapsed"}`}>
      <div className="right-panel-toggle" onClick={toggle}>
        {isOpen ? "❯" : "❮"}
      </div>

      {isOpen && (
        <>
          <h3>AI Assistant</h3>
          <p>This panel will host:</p>
          <ul>
            <li>🤖 Chatbot</li>
            <li>📝 Notes</li>
            <li>📊 Insights</li>
          </ul>
        </>
      )}
    </aside>
  );
}

export default RightPanel;
