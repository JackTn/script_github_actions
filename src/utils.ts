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
