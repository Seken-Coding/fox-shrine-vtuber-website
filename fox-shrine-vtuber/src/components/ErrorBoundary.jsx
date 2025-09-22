import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto my-10 p-6 bg-red-100 border-l-4 border-red-500 text-red-700">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 whitespace-pre-wrap">
              <summary>Error Details</summary>
              {!!this.state.error && this.state.error.toString()}
              <br />
              {!!this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
