import axios from 'axios';
import { CircuitBreakerState } from '../enums/CircuitBrekaerState.enum';

export class CircuitBreaker {
  public state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successThreshold = 5;
  private failureThreshold = 5;
  private timeout = 500;
  private nextAttempt = Date.now();

  constructor(private url: string) { }

  async call(method: string, route?: string, data?: any) {
    console.log('Circuit Breaker Call Attempted', method, route);

    if (this.state === CircuitBreakerState.OPEN && Date.now() > this.nextAttempt) {
      console.log('Circuit Breaker Moving to HALF-OPEN State');
      this.state = CircuitBreakerState.HALF_OPEN;
    }

    if (this.state === CircuitBreakerState.OPEN) {
      console.log('Circuit Breaker is OPEN, Call Rejected');
    }

    try {
      const response: any = await this.makeRequest(method, route, data);
      console.log(response);
      if (response.status >= 400) {
        console.error(`HTTP error! Status: ${response.status}`);
        this.onFailure();
        return response;
      } else {
        // 201, 202
        this.onSuccess(response);
        return response;
      }
    } catch (error) {
      this.onFailure();
    }
  }

  private onFailure() {
    this.failureCount += 1;
    console.log('Request Failed, Circuit Breaker Handling Failure', this.failureCount);

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
    }
  }


  private async makeRequest(method: string, route?: string, data?: any) {
    let fullUrl;

    if (this.url.includes('http://localhost:8000')) {
      fullUrl = `${this.url}${route}`;
    } else {
      fullUrl = this.url;
    }

    try {
      const config = { timeout: 10000 };
      let response: any;

      if (method === 'GET') {
        response = await axios.get(fullUrl, config);
      } else if (method === 'POST') {
        response = await axios.post(fullUrl, data, config);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error in makeRequest:', error.message);
      throw error;
    }
  }

  private onSuccess(response: any) {
    this.failureCount = 0;
    console.log('Request Successful, Circuit Breaker Handling Success');
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successThreshold -= 1;

      if (this.successThreshold <= 0) {
        this.state = CircuitBreakerState.CLOSED;
        this.successThreshold = 5;
        return response.data;
      }
    }
  }
}

export default CircuitBreaker;
