export class DerivAPI {
  private ws: WebSocket | null = null;
  private token: string;
  private callbacks: Map<string, (data: any) => void> = new Map();

  constructor(token: string) {
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

        this.ws.onopen = () => {
          this.authorize()
            .then(() => resolve())
            .catch(reject);
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          const msgType = this.getMsgType(data);
          const callback = this.callbacks.get(msgType);
          if (callback) callback(data);
        };

        this.ws.onerror = () => {
          reject(new Error('Error de conexión WebSocket'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private authorize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error('WebSocket no conectado'));

      const authRequest = {
        authorize: this.token,
      };

      this.callbacks.set('authorize', (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve();
        }
      });

      this.ws.send(JSON.stringify(authRequest));
    });
  }

  async getBalance(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error('WebSocket no conectado'));

      const request = {
        balance: 1,
        subscribe: 1,
      };

      this.callbacks.set('balance', (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.balance.balance);
        }
      });

      this.ws.send(JSON.stringify(request));
    });
  }

  async buyContract(symbol: string, type: 'CALL' | 'PUT', amount: number, duration: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error('WebSocket no conectado'));

      const request = {
        buy: 1,
        price: amount,
        parameters: {
          contract_type: type === 'CALL' ? 'CALL' : 'PUT',
          symbol: symbol,
          duration: duration,
          duration_unit: 'm',
          basis: 'stake',
          currency: 'USD',
        },
      };

      this.callbacks.set('buy', (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.buy);
        }
      });

      this.ws.send(JSON.stringify(request));
    });
  }

  subscribeToTicks(symbol: string, callback: (data: any) => void): void {
    if (!this.ws) throw new Error('WebSocket no conectado');

    const request = {
      ticks: symbol,
      subscribe: 1,
    };

    this.callbacks.set('tick', callback);
    this.ws.send(JSON.stringify(request));
  }

  async ticks_history(symbol: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error('WebSocket no conectado'));

      const request = {
        ticks_history: symbol,
        ...params
      };

      const msgType = 'history';
      this.callbacks.set(msgType, (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response);
        }
      });

      this.ws.send(JSON.stringify(request));
    });
  }

  subscribe(params: any): any {
    if (!this.ws) throw new Error('WebSocket no conectado');

    const request = {
      ...params,
      subscribe: 1
    };

    this.ws.send(JSON.stringify(request));
    return {
      forEach: (callback: (data: any) => void) => {
        this.callbacks.set('candle', callback);
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.callbacks.clear();
    }
  }

  private getMsgType(data: any): string {
    if (data.authorize) return 'authorize';
    if (data.balance) return 'balance';
    if (data.tick) return 'tick';
    if (data.history) return 'history';
    if (data.candle) return 'candle';
    if (data.buy) return 'buy';
    return 'unknown';
  }
}