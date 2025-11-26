// Main App Entry Point
const { GymScheduler } = window;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md text-center border border-gray-800">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-6">We're sorry, but something unexpected happened.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render App
function App() {
  return (
    <ErrorBoundary>
      <GymScheduler />
    </ErrorBoundary>
  );
}

// Wait for DOM and dependencies to load
window.addEventListener('load', () => {
  const root = document.getElementById('root');
  if (root && window.React && window.ReactDOM) {
    ReactDOM.render(<App />, root);
  } else {
    console.error('Failed to initialize app: Missing dependencies');
    document.getElementById('error-fallback').classList.remove('hidden');
  }
});