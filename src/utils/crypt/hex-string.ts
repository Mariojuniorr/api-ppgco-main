import { compareHexStrings } from './compare-hex-strings';

export class HexString {
  constructor(private hexText: string) {}

  public compare(toCompareHex: string) {
    return compareHexStrings(toCompareHex, this.hexText);
  }

  public toString() {
    return this.hexText;
  }
}
