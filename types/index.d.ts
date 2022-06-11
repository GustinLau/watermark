export = Watermark;
declare class Watermark {
  /**
   * @param {WatermarkOptions} [options]
   */
  constructor(options?: WatermarkOptions);
  /**
   * 加载水印
   */
  load(): void;
  /**
   * 更新水印
   * @param {WatermarkOptions} options
   */
  update(options: WatermarkOptions): void;
  /**
   * 移除水印
   */
  remove(): void;
  #private;
}
declare namespace Watermark {
  export { WatermarkOptions };
}
type WatermarkOptions = {
  /**
   * 水印的内容
   */
  text?: string | string[];
  /**
   * 水印字体颜色
   */
  font?: string;
  /**
   * 水印字体大小
   */
  fontSize?: string;
  /**
   * 水印字体粗细
   */
  fontWeight?: number | string;
  /**
   * 水印字体对齐方式
   */
  textAlign?: "left" | "center" | "right";
  /**
   * 水印字体颜色
   */
  color?: string;
  /**
   * 水印字体行高
   */
  lineHeight?: string;
  /**
   * 水印透明度
   */
  alpha?: number;
  /**
   * 水印间距
   */
  padding?: string;
  /**
   * 水印倾斜度数
   */
  angle?: number;
  /**
   * 层级大小
   */
  zIndex?: number;
  /**
   * 水印插件挂载的父元素elementId,不输入则默认挂在body上
   */
  container?: string | null;
  /**
   * monitor 是否监控， true: 不可删除水印; false: 可删水印
   */
  monitor?: boolean;
};
