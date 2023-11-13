import { CircuitBreakerState } from '../enums/CircuitBrekaerState.enum';
import axios from 'axios';

export class CircuitBreaker {
  public state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successThreshold = 5;
  private failureThreshold = 3;
  private timeout = 60000; // 60 segundos
  private nextAttempt = Date.now();

  constructor(private url: string) {}

  async call() {
    // Start
    console.log('Circuit Breaker Call Attempted');

    if (this.state === CircuitBreakerState.OPEN && Date.now() > this.nextAttempt) {
      console.log('Circuit Breaker Moving to HALF-OPEN State');
      this.state = CircuitBreakerState.HALF_OPEN;
    }

    if (this.state === CircuitBreakerState.OPEN) {
      console.log('Circuit Breaker is OPEN, Call Rejected');
      throw new Error('Circuit is currently open');
    }

    try {
      await this.makeRequest(this.url);
      this.onSuccess();
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async makeRequest(url: any) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Error making request: ${error}`);
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    console.log('Request Successful, Circuit Breaker Handling Success');
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successThreshold -= 1;

      if (this.successThreshold <= 0) {
        this.state = CircuitBreakerState.CLOSED;
        this.successThreshold = 5;
      }
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
}

export default CircuitBreaker;
