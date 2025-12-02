import { Token } from "../../authentication-api/models/Token";

export class TokenUtils {
  /**
   * Checks if the given token is expired.
   * @param token - The token object conforming to the Root interface.
   * @returns `true` if expired, `false` otherwise.
   */
  static isTokenExpired(token: Token): boolean {
    const issuedAtTime = new Date(token.IssuedAt).getTime(); // ms
    const currentTime = Date.now(); // ms
    const expirationTime = issuedAtTime + token.expires_in * 1000; // ms

    return currentTime >= expirationTime;
  }

  /**
   * Returns the remaining time (in seconds) before token expiration.
   * @param token - The token object.
   */
  static getRemainingTime(token: Token): number {
    const issuedAtTime = new Date(token.IssuedAt).getTime();
    const currentTime = Date.now();
    const expirationTime = issuedAtTime + token.expires_in * 1000;

    return Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
  }
}
