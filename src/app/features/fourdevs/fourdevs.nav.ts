import type { PageKey } from '../../core/types'

export interface FourdevsItem {
  key: PageKey
  label: string
}

export interface FourdevsGroup {
  id: string
  label: string
  items: FourdevsItem[]
}

export const FOURDEVS_GROUPS: FourdevsGroup[] = [
  {
    id: 'docs',
    label: 'Documentos',
    items: [
      { key: 'cpf', label: 'CPF' },
      { key: 'cnpj', label: 'CNPJ' },
      { key: 'rg', label: 'RG' },
      { key: 'pis', label: 'PIS/PASEP' },
      { key: 'titulo', label: 'Título de eleitor' },
      { key: 'cnh', label: 'CNH' },
      { key: 'cep', label: 'CEP' },
      { key: 'validate-docs', label: 'Validador CPF/CNPJ' },
    ],
  },
  {
    id: 'finance',
    label: 'Financeiro',
    items: [
      { key: 'credit-card', label: 'Cartão de crédito' },
      { key: 'bank-account', label: 'Conta bancária' },
      { key: 'currency', label: 'Conversor de moedas' },
    ],
  },
  {
    id: 'text',
    label: 'Texto',
    items: [
      { key: 'person-name', label: 'Nome de pessoa' },
      { key: 'fake-email', label: 'E-mail fictício' },
      { key: 'lorem', label: 'Lorem Ipsum' },
      { key: 'text-counter', label: 'Contador de texto' },
      { key: 'text-case', label: 'Maiúscula / slug' },
      { key: 'password', label: 'Senha' },
    ],
  },
  {
    id: 'web',
    label: 'Web / Tech',
    items: [
      { key: 'uuid', label: 'UUID' },
      { key: 'hash', label: 'Hash' },
      { key: 'base64', label: 'Base64 / URL' },
      { key: 'json-tools', label: 'JSON formatter' },
      { key: 'user-agent', label: 'User-Agent' },
    ],
  },
  {
    id: 'numbers',
    label: 'Números / Datas',
    items: [
      { key: 'number-gen', label: 'Número aleatório' },
      { key: 'percentage', label: 'Porcentagem' },
      { key: 'date-diff', label: 'Diferença de datas' },
      { key: 'unit-convert', label: 'Conversor de unidades' },
    ],
  },
]

export const FOURDEVS_KEYS = new Set<PageKey>(
  FOURDEVS_GROUPS.flatMap((g) => g.items.map((i) => i.key)),
)

export function isFourdevsPage(page: PageKey): boolean {
  return FOURDEVS_KEYS.has(page)
}
