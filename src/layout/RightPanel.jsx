function RightPanel({ isOpen, toggle }) {
  return (
    /* 🔹 ADDED glass class */
    <aside className={`right-panel glass ${isOpen ? "open" : "collapsed"}`}>
      
      {/* Toggle Button */}
      <div className="right-panel-toggle" onClick={toggle}>
        {isOpen ? "❯" : "❮"}
      </div>

      {/* Panel Content */}
      {isOpen && (
        <>
          {/* 🔹 ADDED gradient-text */}
          <h3 className="gradient-text">AI Assistant</h3>

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
