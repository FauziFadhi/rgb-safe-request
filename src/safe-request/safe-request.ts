export class SafeRequestOptions {
  static log: (value: any) => void;
  static showLog: boolean;

  static logging(value: unknown) {
    if (!SafeRequestOptions.showLog) return;

    if (SafeRequestOptions.log) SafeRequestOptions.log(value);
  }
}
