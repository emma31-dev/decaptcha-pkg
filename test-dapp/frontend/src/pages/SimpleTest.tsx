const SimpleTest = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
      <div style={{ marginTop: '20px' }}>
        <a href="/test" style={{ color: '#007AFF', textDecoration: 'underline' }}>
          Go to Test Index (with Layout)
        </a>
        <br />
        <a href="/decap" style={{ color: '#007AFF', textDecoration: 'underline' }}>
          Go to DeCap Demo
        </a>
      </div>
    </div>
  );
};

export default SimpleTest;