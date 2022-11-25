export class FetchError extends Error {
  constructor(message: string, public readonly chainId: number, public readonly hostname: string) {
    super(message);
  }
}
