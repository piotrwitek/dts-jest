export {};

declare const string_to_any: (v: string) => any;

// @dts-jest:fail
string_to_any('');

// @dts-jest:fail
string_to_any(0);