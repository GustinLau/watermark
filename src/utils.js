const I64BIT_TABLE = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefgijklm'.split('')

/**
 * 字符串Hash
 * @param {string} input
 * @return {string}
 */
module.exports.hash = function hash(input) {
  let hash = 131313
  let i = input.length - 1
  if (typeof input == 'string') {
    for (; i > -1; i--) hash += (hash << 5) + input.charCodeAt(i)
  } else {
    for (; i > -1; i--) hash += (hash << 5) + input[i]
  }
  let value = hash & 0x7FFFFFFF
  let retValue = ''
  do {
    retValue += I64BIT_TABLE[value & 0x3F]
  } while ((value >>= 6))
  return retValue
}

/**
 * 生成UUID
 * @return {string}
 */
module.exports.uuid = function uuid() {
  let d = new Date().getTime() + ~~(Math.random() * Math.pow(10, 8))
  if (window.performance && typeof window.performance.now === 'function') {
    d += performance.now()
  }
  const tpl = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return tpl.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}


/**
 * @typedef {Object} ComputeSizeOptions
 * @property {string} text
 * @property {string} font
 * @property {string} fontSize
 * @property {string} [lineHeight]
 */

/**
 * @typedef {Object} ComputeSizeResult
 * @property {number} width
 * @property {number} height
 */

/**
 * 计算字体大小
 * @param {ComputeSizeOptions} options
 * @return {ComputeSizeResult}
 */
module.exports.computeFontSize = function computeFontSize(options) {
  const {text, font, fontSize, lineHeight} = options
  let div = document.createElement('div')
  div.style.fontSize = fontSize
  div.style.display = 'inline-block'
  div.style.fontFamily = font
  div.style.lineHeight = lineHeight ?? '1'
  div.style.opacity = '0'
  let line
  if (text instanceof Array) {
    line = text
  } else {
    line = [text]
  }
  for (const str of line) {
    const span = document.createElement('span')
    span.style.display = 'block'
    span.innerText = str
    div.appendChild(span)
  }
  document.body.appendChild(div)
  const res = {
    width: div.offsetWidth,
    height: div.offsetHeight
  }
  div.parentNode.removeChild(div)
  div = null
  return res
}
