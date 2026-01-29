"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // Log error to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to error tracking service
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-black text-gray-900 mb-3">Something went wrong</h1>

                        <p className="text-gray-600 mb-8">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full btn btn-primary py-3 rounded-xl font-bold"
                            >
                                Refresh Page
                            </button>

                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full bg-white text-gray-700 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="text-sm font-bold text-gray-500 cursor-pointer hover:text-gray-700">
                                    Error Details (Dev Only)
                                </summary>
                                <pre className="mt-2 p-4 bg-gray-900 text-gray-100 text-xs rounded-xl overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
