export const chunk = (array: any[], subGroupLength: number) => {
  let index = 0
  const newArray = []

  while (index < array.length) {
    newArray.push(array.slice(index, (index += subGroupLength)))
  }

  return newArray
}

export const pick = <T extends object, K extends keyof T>(
  object: {[K: string]: string},
  array: string[]
): {[K: string]: string} => {
  let obj: {[K: string]: string} = {}
  array.forEach(key => {
    obj[key] = object[key]
  })

  return obj
}

// From https://github.com/MartinKolarik/dedent-js/blob/master/src/index.ts - MIT © 2015 Martin Kolárik
export const dedent = function (templateStrings: any, ...values: any) {
  const matches = []
  const strings =
    typeof templateStrings === 'string'
      ? [templateStrings]
      : templateStrings.slice()
  strings[strings.length - 1] = strings[strings.length - 1].replace(
    /\r?\n([\t ]*)$/,
    ''
  )
  for (let i = 0; i < strings.length; i++) {
    let match
    // eslint-disable-next-line no-cond-assign
    if ((match = strings[i].match(/\n[\t ]+/g))) {
      matches.push(...match)
    }
  }
  if (matches.length) {
    const size = Math.min(...matches.map(value => value.length - 1))
    const pattern = new RegExp(`\n[\t ]{${size}}`, 'g')
    for (let i = 0; i < strings.length; i++) {
      strings[i] = strings[i].replace(pattern, '\n')
    }
  }
  strings[0] = strings[0].replace(/^\r?\n/, '')
  let string = strings[0]
  for (let i = 0; i < values.length; i++) {
    string += values[i] + strings[i + 1]
  }
  return string
}
