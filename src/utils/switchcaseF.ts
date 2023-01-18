const executeIfFunction = (f: () => any) =>
  typeof f === 'function' ? f() : f

export const switchcase = (cases: { [x: string]: any; hasOwnProperty: (arg0: any) => any }) => (defaultCase: any) => (key: string | number) =>
  cases.hasOwnProperty(key) ? cases[key] : defaultCase

export const switchcaseF = (cases: any) => (defaultCase: any) => (key: any) =>
  executeIfFunction(switchcase(cases)(defaultCase)(key))