function randDigit(): number {
  return Math.floor(Math.random() * 10)
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function calcDigit(nums: number[], factors: number[]): number {
  const sum = nums.reduce((acc, n, i) => acc + n * factors[i], 0)
  const mod = sum % 11
  return mod < 2 ? 0 : 11 - mod
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function formatCpf(digits: string): string {
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatCnpj(digits: string): string {
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

function formatCep(digits: string): string {
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function generateCpf(masked = true): string {
  const nums = Array.from({ length: 9 }, randDigit)
  const d1 = calcDigit(nums, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigit([...nums, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  const raw = [...nums, d1, d2].join('')
  return masked ? formatCpf(raw) : raw
}

export function generateCnpj(masked = true): string {
  const nums = Array.from({ length: 12 }, randDigit)
  const d1 = calcDigit(nums, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigit([...nums, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const raw = [...nums, d1, d2].join('')
  return masked ? formatCnpj(raw) : raw
}

export function generateCep(masked = true): string {
  const raw = Array.from({ length: 8 }, randDigit).join('')
  return masked ? formatCep(raw) : raw
}

export function formatCepDigits(digits: string, masked = true): string {
  const raw = onlyDigits(digits).padStart(8, '0').slice(0, 8)
  return masked ? formatCep(raw) : raw
}

export const SAMPLE_CEPS = [
  '01310100', '01310200', '04038001', '05407002', '20040020', '22041080',
  '30130100', '30112000', '80010000', '80250104', '90010150', '90619900',
  '70040902', '70390906', '40020000', '40140130', '50030230', '51020250',
  '60160230', '60175047', '69005040', '69020030', '66017000', '66053000',
  '74003010', '74110010', '29010001', '29055235', '88015020', '88015200',
  '59010000', '59020000', '57020000', '57025000', '64000040', '64001280',
  '76801100', '76801158', '69301000', '78005000', '79002000', '49010000',
  '58010000', '65010000',
] as const

export function pickSampleCep(): string {
  return pick(SAMPLE_CEPS)
}

export interface CepAddress {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  ddd: string
}

export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const digits = onlyDigits(cep)
  if (digits.length !== 8) return null
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  if (!res.ok) return null
  const data = (await res.json()) as CepAddress & { erro?: boolean }
  if (data.erro) return null
  return {
    cep: data.cep,
    logradouro: data.logradouro || '',
    complemento: data.complemento || '',
    bairro: data.bairro || '',
    localidade: data.localidade || '',
    uf: data.uf || '',
    ibge: data.ibge || '',
    ddd: data.ddd || '',
  }
}

export async function generateCepWithAddress(masked = true): Promise<CepAddress | null> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const cep = attempt < 5 ? pickSampleCep() : generateCep(false)
    const address = await lookupCep(cep)
    if (address) {
      return { ...address, cep: formatCepDigits(onlyDigits(address.cep), masked) }
    }
  }
  return null
}

export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const NUMS = '0123456789'
const SYMS = '!@#$%&*()_+-=[]{}'

export function generatePassword(opts: PasswordOptions): string {
  let pool = ''
  if (opts.uppercase) pool += UPPER
  if (opts.lowercase) pool += LOWER
  if (opts.numbers) pool += NUMS
  if (opts.symbols) pool += SYMS
  if (!pool) pool = LOWER

  const len = Math.max(4, Math.min(128, opts.length || 12))
  const chars: string[] = []
  if (opts.uppercase) chars.push(pick([...UPPER]))
  if (opts.lowercase) chars.push(pick([...LOWER]))
  if (opts.numbers) chars.push(pick([...NUMS]))
  if (opts.symbols) chars.push(pick([...SYMS]))
  while (chars.length < len) chars.push(pick([...pool]))
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

export function generateMany<T>(count: number, factory: () => T): T[] {
  const n = Math.max(1, Math.min(50, count || 1))
  return Array.from({ length: n }, factory)
}

/** RG SP-like (9 dígitos + DV módulo 11). */
export function generateRg(masked = true): string {
  const nums = Array.from({ length: 8 }, randDigit)
  let sum = 0
  for (let i = 0; i < 8; i++) sum += nums[i] * (2 + i)
  const rest = sum % 11
  const dv = rest === 0 ? '0' : rest === 1 ? 'X' : String(11 - rest)
  const raw = nums.join('') + dv
  return masked ? raw.replace(/(\d{2})(\d{3})(\d{3})([\dX])/, '$1.$2.$3-$4') : raw
}

/** PIS/PASEP com dígito verificador. */
export function generatePis(masked = true): string {
  const nums = Array.from({ length: 10 }, randDigit)
  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const sum = nums.reduce((acc, n, i) => acc + n * weights[i], 0)
  const rest = sum % 11
  const dv = rest < 2 ? 0 : 11 - rest
  const raw = nums.join('') + dv
  return masked ? raw.replace(/(\d{3})(\d{5})(\d{2})(\d)/, '$1.$2.$3-$4') : raw
}

/** Título de eleitor (12 dígitos). */
export function generateTitulo(masked = true): string {
  const nums = Array.from({ length: 8 }, randDigit)
  const uf = randInt(1, 28)
  const seq = [...nums, Math.floor(uf / 10), uf % 10]
  const d1 = (() => {
    const w = [2, 3, 4, 5, 6, 7, 8, 9]
    const s = nums.reduce((a, n, i) => a + n * w[i], 0)
    const r = s % 11
    return r === 10 ? 0 : r
  })()
  const d2 = (() => {
    const w = [7, 8, 9]
    const base = [Math.floor(uf / 10), uf % 10, d1]
    const s = base.reduce((a, n, i) => a + n * w[i], 0)
    const r = s % 11
    return r === 10 ? 0 : r
  })()
  const raw = [...seq, d1, d2].join('')
  return masked ? raw.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : raw
}

/** CNH com dígitos verificadores. */
export function generateCnh(masked = true): string {
  const n = Array.from({ length: 9 }, randDigit)
  let s1 = 0
  for (let i = 0, j = 9; i < 9; i++, j--) s1 += n[i] * j
  let d1 = s1 % 11
  const firstDvSpecial = d1 >= 10
  if (firstDvSpecial) d1 = 0

  let s2 = 0
  for (let i = 0, j = 1; i < 9; i++, j++) s2 += n[i] * j
  let d2 = s2 % 11
  if (d2 >= 10) d2 = 0
  if (firstDvSpecial) d2 = d2 - 2 < 0 ? d2 + 9 : d2 - 2

  const raw = [...n, d1, d2].join('')
  return masked ? raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1 $2 $3 $4') : raw
}

export function validateCpf(value: string): boolean {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  const nums = cpf.split('').map(Number)
  const d1 = calcDigit(nums.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigit(nums.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return nums[9] === d1 && nums[10] === d2
}

export function validateCnpj(value: string): boolean {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
  const nums = cnpj.split('').map(Number)
  const d1 = calcDigit(nums.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigit(nums.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return nums[12] === d1 && nums[13] === d2
}

function luhnCheckDigit(payload: string): number {
  let sum = 0
  let alt = true
  for (let i = payload.length - 1; i >= 0; i--) {
    let n = Number(payload[i])
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return (10 - (sum % 10)) % 10
}

export type CardBrand = 'visa' | 'mastercard' | 'amex'

export function generateCreditCard(brand: CardBrand = 'visa', masked = true): string {
  const prefixes: Record<CardBrand, string[]> = {
    visa: ['4'],
    mastercard: ['51', '52', '53', '54', '55'],
    amex: ['34', '37'],
  }
  const length = brand === 'amex' ? 15 : 16
  let number = pick(prefixes[brand])
  while (number.length < length - 1) number += String(randDigit())
  number += String(luhnCheckDigit(number))
  if (!masked) return number
  if (brand === 'amex') return number.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
  return number.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

const BANKS = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itaú' },
  { code: '260', name: 'Nubank' },
  { code: '077', name: 'Inter' },
] as const

export function generateBankAccount(): string {
  const bank = pick(BANKS)
  const agency = String(randInt(1, 9999)).padStart(4, '0')
  const account = String(randInt(1, 99999999)).padStart(8, '0')
  const digit = randDigit()
  return `${bank.code} ${bank.name} | Ag ${agency} | Cc ${account}-${digit}`
}

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Henrique',
  'Isabela', 'João', 'Karina', 'Lucas', 'Marina', 'Nicolas', 'Olivia', 'Pedro',
  'Rafaela', 'Samuel', 'Tatiane', 'Vitor', 'Yasmin', 'Caio', 'Beatriz', 'Eduardo',
]
const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa',
]

export function generatePersonName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${pick(LAST_NAMES)}`
}

export function generateFakeEmail(): string {
  const name = generatePersonName()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '.')
  const domains = ['example.com', 'mail.test', 'dev.local', 'teste.com.br']
  return `${name}${randInt(1, 99)}@${pick(domains)}`
}

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

export function generateLorem(paragraphs = 1): string {
  const n = Math.max(1, Math.min(10, paragraphs))
  return Array.from({ length: n }, () => LOREM).join('\n\n')
}

export function countText(text: string) {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  const lines = text.length ? text.split(/\n/).length : 0
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
    words,
    lines,
  }
}

export function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateUuid(): string {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function hashText(text: string, algo: 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** MD5 compacto para uso em testes. */
export function md5(str: string): string {
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = (a + q + x + t) | 0
    return (((a << s) | (a >>> (32 - s))) + b) | 0
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t)
  }
  function md5blk(s: string) {
    const blks: number[] = []
    for (let i = 0; i < 64; i += 4) {
      blks[i >> 2] =
        s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
    }
    return blks
  }
  function rhex(n: number) {
    let s = ''
    for (let j = 0; j < 4; j++) s += ((n >> (j * 8)) & 0xff).toString(16).padStart(2, '0')
    return s
  }

  const utf8 = unescape(encodeURIComponent(str))
  const n = utf8.length
  const tail = [0x80]
  while ((n + tail.length) % 64 !== 56) tail.push(0)
  const total = n + tail.length + 8
  let bits = ''
  for (let i = 0; i < n; i++) bits += utf8[i]
  for (const t of tail) bits += String.fromCharCode(t)
  const bitLen = n * 8
  for (let i = 0; i < 8; i++) bits += String.fromCharCode((bitLen >>> (i * 8)) & 0xff)

  let a = 1732584193
  let b = -271733879
  let c = -1732584194
  let d = 271733878
  for (let i = 0; i < total; i += 64) {
    const x = md5blk(bits.substring(i, i + 64))
    const aa = a
    const bb = b
    const cc = c
    const dd = d
    a = ff(a, b, c, d, x[0], 7, -680876936)
    d = ff(d, a, b, c, x[1], 12, -389564586)
    c = ff(c, d, a, b, x[2], 17, 606105819)
    b = ff(b, c, d, a, x[3], 22, -1044525330)
    a = ff(a, b, c, d, x[4], 7, -176418897)
    d = ff(d, a, b, c, x[5], 12, 1200080426)
    c = ff(c, d, a, b, x[6], 17, -1473231341)
    b = ff(b, c, d, a, x[7], 22, -45705983)
    a = ff(a, b, c, d, x[8], 7, 1770035416)
    d = ff(d, a, b, c, x[9], 12, -1958414417)
    c = ff(c, d, a, b, x[10], 17, -42063)
    b = ff(b, c, d, a, x[11], 22, -1990404162)
    a = ff(a, b, c, d, x[12], 7, 1804603682)
    d = ff(d, a, b, c, x[13], 12, -40341101)
    c = ff(c, d, a, b, x[14], 17, -1502002290)
    b = ff(b, c, d, a, x[15], 22, 1236535329)
    a = gg(a, b, c, d, x[1], 5, -165796510)
    d = gg(d, a, b, c, x[6], 9, -1069501632)
    c = gg(c, d, a, b, x[11], 14, 643717713)
    b = gg(b, c, d, a, x[0], 20, -373897302)
    a = gg(a, b, c, d, x[5], 5, -701558691)
    d = gg(d, a, b, c, x[10], 9, 38016083)
    c = gg(c, d, a, b, x[15], 14, -660478335)
    b = gg(b, c, d, a, x[4], 20, -405537848)
    a = gg(a, b, c, d, x[9], 5, 568446438)
    d = gg(d, a, b, c, x[14], 9, -1019803690)
    c = gg(c, d, a, b, x[3], 14, -187363961)
    b = gg(b, c, d, a, x[8], 20, 1163531501)
    a = gg(a, b, c, d, x[13], 5, -1444681467)
    d = gg(d, a, b, c, x[2], 9, -51403784)
    c = gg(c, d, a, b, x[7], 14, 1735328473)
    b = gg(b, c, d, a, x[12], 20, -1926607734)
    a = hh(a, b, c, d, x[5], 4, -378558)
    d = hh(d, a, b, c, x[8], 11, -2022574463)
    c = hh(c, d, a, b, x[11], 16, 1839030562)
    b = hh(b, c, d, a, x[14], 23, -35309556)
    a = hh(a, b, c, d, x[1], 4, -1530992060)
    d = hh(d, a, b, c, x[4], 11, 1272893353)
    c = hh(c, d, a, b, x[7], 16, -155497632)
    b = hh(b, c, d, a, x[10], 23, -1094730640)
    a = hh(a, b, c, d, x[13], 4, 681279174)
    d = hh(d, a, b, c, x[0], 11, -358537222)
    c = hh(c, d, a, b, x[3], 16, -722521979)
    b = hh(b, c, d, a, x[6], 23, 76029189)
    a = hh(a, b, c, d, x[9], 4, -640364487)
    d = hh(d, a, b, c, x[12], 11, -421815835)
    c = hh(c, d, a, b, x[15], 16, 530742520)
    b = hh(b, c, d, a, x[2], 23, -995338651)
    a = ii(a, b, c, d, x[0], 6, -198630844)
    d = ii(d, a, b, c, x[7], 10, 1126891415)
    c = ii(c, d, a, b, x[14], 15, -1416354905)
    b = ii(b, c, d, a, x[5], 21, -57434055)
    a = ii(a, b, c, d, x[12], 6, 1700485571)
    d = ii(d, a, b, c, x[3], 10, -1894986606)
    c = ii(c, d, a, b, x[10], 15, -1051523)
    b = ii(b, c, d, a, x[1], 21, -2054922799)
    a = ii(a, b, c, d, x[8], 6, 1873313359)
    d = ii(d, a, b, c, x[15], 10, -30611744)
    c = ii(c, d, a, b, x[6], 15, -1560198380)
    b = ii(b, c, d, a, x[13], 21, 1309151649)
    a = ii(a, b, c, d, x[4], 6, -145523070)
    d = ii(d, a, b, c, x[11], 10, -1120210379)
    c = ii(c, d, a, b, x[2], 15, 718787259)
    b = ii(b, c, d, a, x[9], 21, -343485551)
    a = (a + aa) | 0
    b = (b + bb) | 0
    c = (c + cc) | 0
    d = (d + dd) | 0
  }
  return rhex(a) + rhex(b) + rhex(c) + rhex(d)
}

export function encodeBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)))
}

export function decodeBase64(text: string): string {
  return decodeURIComponent(escape(atob(text.trim())))
}

export function encodeUrl(text: string): string {
  return encodeURIComponent(text)
}

export function decodeUrl(text: string): string {
  return decodeURIComponent(text.trim())
}

export function formatJson(text: string, pretty = true): string {
  const parsed = JSON.parse(text)
  return pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed)
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
]

export function generateUserAgent(): string {
  return pick(USER_AGENTS)
}

export function generateNumber(min: number, max: number, decimals = 0): string {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  if (decimals <= 0) return String(randInt(Math.ceil(lo), Math.floor(hi)))
  const n = lo + Math.random() * (hi - lo)
  return n.toFixed(decimals)
}

export function calcPercentage(mode: 'of' | 'is' | 'change', a: number, b: number): string {
  if (mode === 'of') return ((a / 100) * b).toFixed(4).replace(/\.?0+$/, '')
  if (mode === 'is') return b === 0 ? '—' : `${((a / b) * 100).toFixed(2)}%`
  return b === 0 ? '—' : `${(((a - b) / b) * 100).toFixed(2)}%`
}

export function dateDiff(from: string, to: string): { days: number; hours: number; minutes: number; label: string } {
  const start = new Date(from)
  const end = new Date(to)
  const ms = Math.abs(end.getTime() - start.getTime())
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return {
    days,
    hours,
    minutes,
    label: `${days} dia(s), ${hours} hora(s), ${minutes} minuto(s)`,
  }
}

export type UnitKind = 'length' | 'mass' | 'temp'

const LENGTH_TO_M: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  ft: 0.3048,
  in: 0.0254,
}

const MASS_TO_KG: Record<string, number> = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.45359237,
  oz: 0.0283495231,
}

export function convertUnit(kind: UnitKind, value: number, from: string, to: string): number {
  if (kind === 'temp') {
    let c = value
    if (from === 'F') c = ((value - 32) * 5) / 9
    if (from === 'K') c = value - 273.15
    if (to === 'C') return c
    if (to === 'F') return (c * 9) / 5 + 32
    if (to === 'K') return c + 273.15
    return value
  }
  if (kind === 'length') {
    const meters = value * (LENGTH_TO_M[from] ?? 1)
    return meters / (LENGTH_TO_M[to] ?? 1)
  }
  const kg = value * (MASS_TO_KG[from] ?? 1)
  return kg / (MASS_TO_KG[to] ?? 1)
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`)
  if (!res.ok) throw new Error('Falha ao consultar cotação')
  const data = (await res.json()) as { rates: Record<string, number> }
  return data.rates[to]
}
