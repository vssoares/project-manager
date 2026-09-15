function randDigit(): number {
  return Math.floor(Math.random() * 10)
}

function calcDigit(nums: number[], factors: number[]): number {
  const sum = nums.reduce((acc, n, i) => acc + n * factors[i], 0)
  const mod = sum % 11
  return mod < 2 ? 0 : 11 - mod
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

/** Gera CPF válido (algoritmo dos dígitos verificadores). */
export function generateCpf(masked = true): string {
  const nums = Array.from({ length: 9 }, randDigit)
  const d1 = calcDigit(nums, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigit([...nums, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  const raw = [...nums, d1, d2].join('')
  return masked ? formatCpf(raw) : raw
}

/** Gera CNPJ válido (algoritmo dos dígitos verificadores). */
export function generateCnpj(masked = true): string {
  const nums = Array.from({ length: 12 }, randDigit)
  const d1 = calcDigit(nums, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = calcDigit([...nums, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const raw = [...nums, d1, d2].join('')
  return masked ? formatCnpj(raw) : raw
}

/** Gera CEP no formato brasileiro (aleatório). */
export function generateCep(masked = true): string {
  const raw = Array.from({ length: 8 }, randDigit).join('')
  return masked ? formatCep(raw) : raw
}

export function formatCepDigits(digits: string, masked = true): string {
  const raw = digits.replace(/\D/g, '').padStart(8, '0').slice(0, 8)
  return masked ? formatCep(raw) : raw
}

/** CEPs reais espalhados pelo Brasil — usados para garantir endereço via ViaCEP. */
export const SAMPLE_CEPS = [
  '01310100', // São Paulo - Av. Paulista
  '01310200',
  '04038001',
  '05407002',
  '20040020', // Rio de Janeiro
  '22041080',
  '30130100', // Belo Horizonte
  '30112000',
  '80010000', // Curitiba
  '80250104',
  '90010150', // Porto Alegre
  '90619900',
  '70040902', // Brasília
  '70390906',
  '40020000', // Salvador
  '40140130',
  '50030230', // Recife
  '51020250',
  '60160230', // Fortaleza
  '60175047',
  '69005040', // Manaus
  '69020030',
  '66017000', // Belém
  '66053000',
  '74003010', // Goiânia
  '74110010',
  '29010001', // Vitória
  '29055235',
  '88015020', // Florianópolis
  '88015200',
  '59010000', // Natal
  '59020000',
  '57020000', // Maceió
  '57025000',
  '64000040', // Teresina
  '64001280',
  '76801100', // Porto Velho
  '76801158',
  '69301000', // Boa Vista
  '78005000', // Cuiabá
  '79002000', // Campo Grande
  '49010000', // Aracaju
  '58010000', // João Pessoa
  '65010000', // São Luís
] as const

export function pickSampleCep(): string {
  return SAMPLE_CEPS[Math.floor(Math.random() * SAMPLE_CEPS.length)]
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
  const digits = cep.replace(/\D/g, '')
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
      return {
        ...address,
        cep: formatCepDigits(address.cep.replace(/\D/g, ''), masked),
      }
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

  // Garante pelo menos um de cada tipo selecionado
  if (opts.uppercase) chars.push(UPPER[Math.floor(Math.random() * UPPER.length)])
  if (opts.lowercase) chars.push(LOWER[Math.floor(Math.random() * LOWER.length)])
  if (opts.numbers) chars.push(NUMS[Math.floor(Math.random() * NUMS.length)])
  if (opts.symbols) chars.push(SYMS[Math.floor(Math.random() * SYMS.length)])

  while (chars.length < len) {
    chars.push(pool[Math.floor(Math.random() * pool.length)])
  }

  // Fisher–Yates
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
