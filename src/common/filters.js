import * as Valide from './valide'

// 将值为0转换为文字'否' 1转换为'是'
export function YesNoToText(val) {
  if (!Valide.isNumber(val)) {
    return 'invalid'
  }
  let text = ''
  switch (val) {
    case 0:
      text = '否'
      break
    case 1:
      text = '是'
      break
    default:
      text = ''
  }
  return text
}

// 将金额从分转换为元
export function CentToDollars(val) {
  if (!val) {
    return 0
  }
  if (!Valide.isNumber(val)) {
    return 'invalid'
  }
  if (val !== 0) {
    let tVal = val / 100;
    return tVal.toFixed(2)
  } else {
    return val
  }
}

// 手续费转换
export function brokerageConvert(val) {
  if (!val) {
    return 0
  }
  if (!Valide.isNumber(val)) {
    return 'invalid'
  }
  if (val > 0) {
    return val / 1000
  } else if (val === 0) {
    return val
  } else if (val < 0) {
    return 'invalid'
  }
}
