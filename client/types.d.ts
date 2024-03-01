/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

declare module '*.css?inline' {
  import { CSSResult } from 'lit';
  const css: CSSResult;
  export default css;
}
