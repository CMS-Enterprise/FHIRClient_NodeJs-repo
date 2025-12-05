export class GuidGenerator {
  static generate(): string {
    return crypto.randomUUID();
  }
}
