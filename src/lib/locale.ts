export const locales = {
  en: 'en',
  ko: 'ko',
} as const;

export const Locale = {
  en: {
    title: 'Idea Generator',
    placeholder: 'type your keyword...',
    button: {
      idea: 'Generate',
      XYZ: 'Turn to XYZ Hypothesis',
      xyz: 'Narrow it down',
      further: 'Make it narrower',
    },
  },
  ko: {
    title: '아이디어 생성기',
    placeholder: '키워드를 입력하세요...',
    button: {
      idea: '아이디어 생성',
      XYZ: 'XYZ 가설로 바꾸기',
      xyz: '축소하기',
      further: '더 축소하기',
    },
  },
} as const;
