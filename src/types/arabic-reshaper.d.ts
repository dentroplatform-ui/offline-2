declare module 'arabic-reshaper' {
  interface ArabicReshaper {
    reshape(text: string): string;
  }
  const reshaper: ArabicReshaper;
  export default reshaper;
}

declare module 'arabic-persian-reshaper' {
  interface ArabicPersianReshaper {
    reshape(text: string): string;
  }
  const reshaper: ArabicPersianReshaper;
  export default reshaper;
}
