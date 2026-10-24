/**
 * Типографика на странице: неразрывные пробелы в видимом тексте.
 * Делается над готовыми текстовыми узлами, поэтому словарь, журнал, тесты и aria-подписи остаются с обычными пробелами.
 * Русский: предлоги, союзы и «не/ни» крепятся к следующему слову; «же/ли/бы» и тире — к предыдущему.
 * Английский: короткие предлоги и союзы крепятся к следующему слову (артикли не трогаем, чтобы не склеивать длинные цепочки).
 * Число и единица измерения не разрываются.
 */
const NB = ' '
const RU_SHORT = '(?:в|во|на|с|со|к|ко|о|об|от|до|из|за|по|при|про|для|без|над|под|у|и|а|но|да|не|ни|что|как|или)'
const EN_SHORT = '(?:in|on|at|to|of|by|or|and|is|as|it|if|no|so|up|my)'
const RU_RE = new RegExp(`(^|[\\s(«„${NB}])(${RU_SHORT}) (?=\\S)`, 'gi')
const EN_RE = new RegExp(`(^|[\\s(“"${NB}])(${EN_SHORT}) (?=\\S)`, 'gi')

export function typo(text: string): string {
  let s = text
  if (/[а-яё]/i.test(s)) {
    s = s.replace(RU_RE, `$1$2${NB}`).replace(RU_RE, `$1$2${NB}`) // второй проход — для цепочек «и в», «не на»
    s = s.replace(/ (же|ли|бы|—|–)(?=[\s.,;:!?)»”]|$)/g, `${NB}$1`)
  } else {
    s = s.replace(EN_RE, `$1$2${NB}`)
    s = s.replace(/ (—|–)(?=\s|$)/g, `${NB}$1`)
  }
  return s.replace(/(\d) (?=(?:°|%|[a-zа-яё]{1,4}(?![a-zа-яё])))/gi, `$1${NB}`)
}

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE'])

function fix(node: Text) {
  const p = node.parentElement
  if (!p || SKIP.has(p.tagName) || !node.nodeValue || !node.nodeValue.includes(' ')) return
  const next = typo(node.nodeValue)
  if (next !== node.nodeValue) node.nodeValue = next
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) return fix(root as Text)
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = w.nextNode(); n; n = w.nextNode()) fix(n as Text)
}

/** Запускается один раз при старте приложения. */
export function startTypography(root: HTMLElement = document.body) {
  walk(root)
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') fix(m.target as Text)
      else m.addedNodes.forEach(walk)
    }
  }).observe(root, { childList: true, subtree: true, characterData: true })
}
