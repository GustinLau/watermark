/**
 * @typedef {Object} WatermarkOptions
 * @property {string | string[]} [text]  水印的内容
 * @property {string} [font] 水印字体
 * @property {string} [fontSize] 水印字体大小
 * @property {number|string} [fontWeight] 水印字体粗细
 * @property {'left'|'center'|'right'} [textAlign] 水印字体对齐方式
 * @property {string} [color] 水印字体颜色
 * @property {string} [lineHeight] 水印字体行高
 * @property {number} [alpha] 水印透明度
 * @property {string} [padding] 水印间距 "16px [16px]"
 * @property {number} [angle] 水印倾斜度数
 * @property {number} [zIndex] 层级大小
 * @property {string|null} [container] 水印插件挂载的父元素elementId,不输入则默认挂在body上
 * @property {boolean} [monitor] monitor 是否监控， true: 不可删除水印; false: 可删水印
 */

const {uuid, hash, computeFontSize} = require('./utils')

class Watermark {
  /**
   * 水印标记属性名
   * @type {string}
   */
  #attributeTagName = 'wm-tag'
  /**
   * 当前配置
   * @type {WatermarkOptions}
   */
  #options
  /**
   * 是否支持节点监听
   * @type {boolean}
   */
  #observerSupport = false
  /**
   * 节点监听器
   * @type {MutationObserver}
   */
  #mutationObserver = null
  /**
   * 水印标签
   * @type {string | null}
   */
  #tag
  /**
   * 水印挂载节点
   * @type {HTMLElement | HTMLBodyElement}
   */
  #watermarkParentDom
  /**
   * 父节原有display属性
   */
  #watermarkParentDomPosition
  /**
   * 水印容器节点
   * @type {HTMLElement | null}
   */
  #watermarkContainerDom
  /**
   * 水印节点
   * @type {HTMLElement | null}
   */
  #watermarkDom
  /**
   * 信息缓存
   * @type {{width:number,height:number,url:string,ratio:number}|null}
   */
  #cache
  /**
   * 默认配置
   * @type {WatermarkOptions}
   */
  #defaultOptions = {
    text: '测试水印',                                                      // 水印的内容
    font: `'Microsoft YaHei','Arial','黑体','宋体',sans-serif`,            // 水印字体
    color: 'black',                                                       // 水印字体颜色
    fontSize: '14px',                                                     // 水印字体大小
    fontWeight: 'normal',                                                 // 水印字体粗细
    lineHeight: '1.4',                                                    // 水印字体行高
    textAlign: 'center',                                                  // 水印字体对齐方式
    alpha: 0.12,                                                          // 水印透明度
    angle: -22,                                                           // 水印倾斜度数
    padding: '16px',                                                      // 水印间距
    zIndex: 99999,                                                        // 层级大小
    container: null,                                                      // 水印插件挂载的父元素element,不输入则默认挂在body上
    monitor: true,                                                        // monitor 是否监控， true: 不可删除水印; false: 可删水印。
  }

  /**
   * @param {WatermarkOptions} [options]
   */
  constructor(options = {}) {
    options = {
      ...this.#defaultOptions,
      ...options
    }
    this.#options = options
    this.#observerSupport = (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver) !== undefined
    this.#tag = hash(uuid())
  }

  /**
   * （私）制作水印
   * @return {Promise<{ratio:number,width:number,height:number,url:string}>}
   */
  #createWatermarkImage() {
    return new Promise(async resolve => {
      if (this.#cache) {
        resolve(this.#cache)
        return
      }

      const options = this.#options
      const {angle, color, text, font, fontSize, textAlign, fontWeight, alpha} = options
      // 计算文本大小
      const size = computeFontSize({text, font, fontSize, lineHeight: options.lineHeight})
      let strs = options.padding.split(' ')
      const ratio = window.devicePixelRatio || 1
      const paddings = new Array(2)
      if (strs.length === 1) {
        if (isNaN(+options.padding)) {
          paddings[0] = paddings[1] = +(strs[0].replace('px', '')) * ratio
        } else {
          paddings[0] = paddings[1] = +strs[0] * ratio
        }
      } else {
        for (let i = 0; i < 2; i++) {
          if (isNaN(+strs[i])) {
            paddings[i] = +(strs[i].replace('px', '')) * ratio
          } else {
            paddings[i] = +(strs[i]) * ratio
          }
        }
      }
      const width = size.width * ratio
      const height = size.height * ratio
      // 角度转弧度
      const radian = (Math.PI / 180 * (angle + 360)) % 360
      // 计算旋转后所需矩形大小
      const finalWidth = Math.abs(Math.sin(radian)) * height + Math.abs(Math.cos(radian)) * width
      const finalHeight = Math.abs(Math.cos(radian)) * height + Math.abs(Math.sin(radian)) * width
      // 创建画布
      const canvas = document.createElement('canvas')
      canvas.width = (finalWidth + paddings[1] * 2)
      canvas.height = (finalHeight + paddings[0] * 2)
      // 旋转偏移量
      const offset_x = ((finalWidth - width) / 2 + paddings[1])
      const offset_y = ((finalHeight - height) / 2 + paddings[0])
      // 源矩形中心
      const rectCenterPoint = {x: offset_x + width / 2, y: offset_y + height / 2}
      const ctx = canvas.getContext('2d')
      // 旋转画布
      ctx.translate(rectCenterPoint.x, rectCenterPoint.y)
      ctx.rotate(radian)
      ctx.translate(-rectCenterPoint.x, -rectCenterPoint.y)
      ctx.scale(ratio, ratio)
      // 颜色
      ctx.fillStyle = color
      // 透明度
      ctx.globalAlpha = alpha
      // 对齐方式
      ctx.textAlign = textAlign
      // 字体
      ctx.font = `${fontWeight} ${fontSize} ${font}`
      // 行高
      let lineHeight
      if (options.lineHeight) {
        if (isNaN(+options.lineHeight)) {
          lineHeight = +options.lineHeight.replace('px', '')
        } else {
          lineHeight = +(fontSize.replace('px', '')) * options.lineHeight
        }
      } else {
        lineHeight = +(fontSize.replace('px', ''))
      }
      let line
      if (text instanceof Array) {
        line = text
      } else {
        line = [text]
      }
      const align = ['left', 'center', 'right']
      const x = (offset_x + align.indexOf(textAlign) * width / 2) / ratio
      let y = (+(fontSize.replace('px', '')) + lineHeight) / 2 + offset_y / ratio
      for (const str of line) {
        ctx.fillText(str, x, y)
        y += lineHeight
      }
      let url
      if (typeof canvas.toBlob === 'function') {
        url = await new Promise(resolve => canvas.toBlob(blob => resolve(URL.createObjectURL(blob))))
      } else if (typeof canvas.msToBlob === 'function') {
        url = URL.createObjectURL(canvas.msToBlob())
      }
      this.#cache = {ratio, width: canvas.width, height: canvas.height, url}
      resolve(this.#cache)
    })
  }

  /**
   * （私）判断是否需要重新生成水印
   * @param {MutationRecord} mutation
   * @return {boolean}
   */
  #needRerender(mutation) {
    if (mutation.type === 'attributes') {
      if (this.#watermarkParentDom !== document.body) {
        // 不是挂在到body节点的水印，内容变化，高度都可能变化
        return true
      }
      if (mutation.attributeName.startsWith(`data-${this.#attributeTagName}-${this.#tag}`)) {
        return true
      }
      if (
        [`${this.#attributeTagName}-${this.#tag}`, `${this.#attributeTagName}-${this.#tag}-container`]
          // 转换为dataset的写法
          .map(str => str.replace(/-[a-zA-Z]/g, s => s.substring(1).toUpperCase()))
          // 存在这个dataset的值，说明修改的节点是水印节点
          .some(str => mutation.target.dataset[str] === '')
      ) {
        return true
      }
    }
    if (mutation.type === 'childList') {
      if (this.#watermarkParentDom !== document.body) {
        // 不是挂在到body节点的水印，内容变化，高度都可能变化
        return true
      }
      if (mutation.removedNodes.length > 0) {
        if (Array.prototype.some.bind(mutation.removedNodes)(node => node === this.#watermarkContainerDom || node === this.#watermarkDom)) {
          return true
        }
      }
    }
    return false
  }

  /**
   * （私）销毁 MutationObserver
   */
  #destroyObserver() {
    if (this.#mutationObserver) {
      this.#mutationObserver.takeRecords()
      this.#mutationObserver.disconnect()
      this.#mutationObserver = null
    }
  }

  /**
   * （私）加载水印
   */
  async #render() {
    // 销毁旧的监听器
    this.#destroyObserver()
    const options = this.#options
    if (!this.#watermarkParentDom) {
      if (options.container) {
        const dom = document.getElementById(options.container)
        if (dom) {
          this.#watermarkParentDom = dom
        } else {
          console.warn(`未找到水印挂载节点#${options.container}，默认挂在到body`)
        }
      }
      if (!this.#watermarkParentDom) {
        this.#watermarkParentDom = document.body
      }
      if (this.#watermarkParentDom !== document.body) {
        this.#watermarkParentDomPosition = this.#watermarkParentDom.style.position
      }
    }

    // 删除已有水印
    if (this.#watermarkContainerDom) {
      this.#watermarkContainerDom?.parentNode?.removeChild(this.#watermarkContainerDom)
      this.#watermarkContainerDom = null
    }

    let shadowRoot
    const watermarkContainerDom = document.createElement('div')
    watermarkContainerDom.setAttribute(`data-${this.#attributeTagName}-${this.#tag}-container`, '')
    // 创建shadow dom
    watermarkContainerDom.style.pointerEvents = 'none'
    // 判断浏览器是否支持attachShadow方法
    if (typeof watermarkContainerDom.attachShadow === 'function') {
      shadowRoot = watermarkContainerDom.attachShadow({mode: 'open'})
    } else {
      shadowRoot = watermarkContainerDom
    }

    const {ratio, width, height, url} = await this.#createWatermarkImage()
    const watermarkDom = document.createElement('div')
    watermarkDom.setAttribute(`data-${this.#attributeTagName}-${this.#tag}`, '')
    watermarkDom.style.overflow = 'hidden'
    watermarkDom.style.pointerEvents = 'none'
    watermarkDom.style.backgroundImage = `url(${url})`
    watermarkDom.style.backgroundColor = 'transparent'
    watermarkDom.style.backgroundRepeat = 'repeat'
    watermarkDom.style.backgroundPosition = `${(width / ratio / 2)}px ${height / ratio / 2}px, 0 0`
    watermarkDom.style.backgroundSize = `${width / ratio}px ${height / ratio}px`
    watermarkDom.style.left = '0'
    watermarkDom.style.right = '0'
    watermarkDom.style.top = '0'
    watermarkDom.style.bottom = '0'
    watermarkDom.style.zIndex = String(options.zIndex)
    if (this.#watermarkParentDom === document.body) {
      watermarkDom.style.position = 'fixed'
    } else {
      if (!this.#watermarkParentDom.style.position || this.#watermarkParentDom.style.position==='static') {
        this.#watermarkParentDom.style.position = 'relative'
      }
      watermarkDom.style.position = 'absolute'
      watermarkDom.style.height = Math.max(this.#watermarkParentDom.scrollHeight, this.#watermarkParentDom.clientHeight) + 'px'
    }
    shadowRoot.appendChild(watermarkDom)
    this.#watermarkDom = watermarkDom

    // 将水印插入到底部位置
    this.#watermarkParentDom.appendChild(watermarkContainerDom)
    this.#watermarkContainerDom = watermarkContainerDom

    // 开启监听
    if (options.monitor && this.#observerSupport) {
      this.#mutationObserver = new MutationObserver(mutations => {
        for (let i = 0; i < mutations.length; i++) {
          const mutation = mutations[i]
          if (this.#needRerender(mutation)) {
            this.#render()
            break
          }
        }
      })
      this.#mutationObserver.observe(this.#watermarkParentDom, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', `data-${this.#attributeTagName}-${this.#tag}-container`]
      })
      this.#mutationObserver.observe(shadowRoot, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', `data-${this.#attributeTagName}-${this.#tag}`]
      })
    }
  }

  /**
   * （私）移除水印
   */
  #removeWatermark() {
    // 销毁监听
    this.#destroyObserver()
    // 移除缓存
    if (this.#cache) {
      // 释放图片URL
      if (this.#cache.url) URL.revokeObjectURL(this.#cache.url)
      this.#cache = null
    }
    // 还原父节点position
    if (this.#watermarkParentDom && this.#watermarkParentDom !== document.body) {
      this.#watermarkParentDom.style.position = this.#watermarkParentDomPosition
      this.#watermarkParentDomPosition = undefined
      this.#watermarkParentDom = null
    }
    // 移除DOM
    if (this.#watermarkContainerDom) {
      this.#watermarkContainerDom?.parentNode?.removeChild(this.#watermarkContainerDom)
      this.#watermarkContainerDom = null
      this.#watermarkDom = null
    }
  }

  /**
   * 加载水印
   */
  load() {
    this.#render()
  }

  /**
   * 更新水印
   * @param {WatermarkOptions} options
   */
  update(options) {
    options = {
      ...this.#defaultOptions,
      ...options
    }
    this.#options = options
    this.remove()
    this.load()
  }

  /**
   * 移除水印
   */
  remove() {
    this.#removeWatermark()
  }
}

module.exports = Watermark
