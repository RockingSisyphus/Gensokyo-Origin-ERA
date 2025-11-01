# 错误报告

**症状**

* 控制台报：`SyntaxError: missing ) after argument list`（多见于 `about:srcdoc`、XHTML/XML、模板引擎环境）。
* 出错行常见形态：`out.replace(/'/g, '&#39;');` → 被上游**先**把 `&#39;` 解成 `'`，变成 `out.replace(/'/g, '');`，字符串提前闭合。

**根因**

* 某些容器在把脚本交给 JS 引擎前，会对脚本文本做 **HTML/XML 实体解码**。源码中只要出现 `&...;`，就可能被提前还原成符号。

**硬性规则（记住这 3 条就不踩）**

1. **不要**在 JS 源码里直接写 `&lt; &gt; &amp; &quot; &#39;` 等实体文本。
2. 需要这些字符串时，用**运行时拼接/转义**生成，别让源码里出现 `&`：

   ```js
   const AMP='&'+'amp;', LT='&'+'lt;', GT='&'+'gt;', QUOT='&'+'quot;', SQT='&'+'#39;';
   // 或：const AMP = '\x26' + 'amp;';
   ```

3. 做 HTML 转义时，**先替换 `&`，再替换 `< > " '`**（顺序很重要）。

**安全范例**

```js
function escHtml(s){
  const AMP='&'+'amp;', LT='&'+'lt;', GT='&'+'gt;', QUOT='&'+'quot;', SQT='&'+'#39;';
  let out = String(s);
  out = out.replace(/&/g, AMP);
  out = out.replace(/</g, LT).replace(/>/g, GT);
  out = out.replace(/"/g, QUOT).replace(/'/g, SQT);
  return out;
}
```
