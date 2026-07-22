'use client';
import { Component, type ReactNode, type ErrorInfo } from 'react';
import Button from './Button';
interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('ErrorBoundary:', error, info); }
  render() { if (this.state.hasError) { return this.props.fallback || <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center"><h2 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h2><p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p><Button onClick={() => this.setState({ hasError: false, error: null })}>Try Again</Button></div>; } return this.props.children; }
}
