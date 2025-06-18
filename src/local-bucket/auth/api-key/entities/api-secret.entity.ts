export class ApiSecretKey {
  constructor(private readonly value: string) {}

  toString(): string {
    return this.value;
  }

  isValid(): boolean {
    return Boolean(this.value);
  }
}
