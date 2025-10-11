import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  rerenders: number;
  memoryUsage?: number;
}

export function usePerformance(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    rerenders: 0,
  });
  
  const renderStartTime = useRef<number>(0);
  const mountCount = useRef<number>(0);
  const rerenderCount = useRef<number>(0);

  useEffect(() => {
    mountCount.current += 1;
    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        componentMounts: mountCount.current,
        rerenders: rerenderCount.current,
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
      }));
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance [${componentName}]:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          mounts: mountCount.current,
          rerenders: rerenderCount.current,
        });
      }
    };
  });

  useEffect(() => {
    rerenderCount.current += 1;
  });

  return metrics;
}

export function useApiPerformance() {
  const [apiMetrics, setApiMetrics] = useState<Record<string, number>>({});

  const trackApiCall = async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setApiMetrics(prev => ({
        ...prev,
        [apiName]: duration,
      }));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Performance [${apiName}]: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setApiMetrics(prev => ({
        ...prev,
        [`${apiName}_error`]: duration,
      }));
      
      throw error;
    }
  };

  return { apiMetrics, trackApiCall };
}
