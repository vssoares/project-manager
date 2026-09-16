import { Component, input } from '@angular/core'
import type { PageKey } from '../../../core/types'
import { BankAccountPage } from './pages/bank-account-page/bank-account-page'
import { Base64Page } from './pages/base64-page/base64-page'
import { CepPage } from './pages/cep-page/cep-page'
import { CnhPage } from './pages/cnh-page/cnh-page'
import { CnpjPage } from './pages/cnpj-page/cnpj-page'
import { CpfPage } from './pages/cpf-page/cpf-page'
import { CreditCardPage } from './pages/credit-card-page/credit-card-page'
import { CurrencyPage } from './pages/currency-page/currency-page'
import { DateDiffPage } from './pages/date-diff-page/date-diff-page'
import { FakeEmailPage } from './pages/fake-email-page/fake-email-page'
import { HashPage } from './pages/hash-page/hash-page'
import { JsonToolsPage } from './pages/json-tools-page/json-tools-page'
import { LoremPage } from './pages/lorem-page/lorem-page'
import { NumberGenPage } from './pages/number-gen-page/number-gen-page'
import { PasswordPage } from './pages/password-page/password-page'
import { PercentagePage } from './pages/percentage-page/percentage-page'
import { PersonNamePage } from './pages/person-name-page/person-name-page'
import { PisPage } from './pages/pis-page/pis-page'
import { RgPage } from './pages/rg-page/rg-page'
import { TextCasePage } from './pages/text-case-page/text-case-page'
import { TextCounterPage } from './pages/text-counter-page/text-counter-page'
import { TituloPage } from './pages/titulo-page/titulo-page'
import { UnitConvertPage } from './pages/unit-convert-page/unit-convert-page'
import { UserAgentPage } from './pages/user-agent-page/user-agent-page'
import { UuidPage } from './pages/uuid-page/uuid-page'
import { ValidateDocsPage } from './pages/validate-docs-page/validate-docs-page'

@Component({
  selector: 'app-fourdevs-host',
  imports: [
    CpfPage,
    CnpjPage,
    CepPage,
    PasswordPage,
    RgPage,
    PisPage,
    TituloPage,
    CnhPage,
    ValidateDocsPage,
    CreditCardPage,
    BankAccountPage,
    CurrencyPage,
    PersonNamePage,
    FakeEmailPage,
    LoremPage,
    TextCounterPage,
    TextCasePage,
    UuidPage,
    HashPage,
    Base64Page,
    JsonToolsPage,
    UserAgentPage,
    NumberGenPage,
    PercentagePage,
    DateDiffPage,
    UnitConvertPage,
  ],
  template: `
    @switch (tool()) {
      @case ('cpf') { <app-cpf-page /> }
      @case ('cnpj') { <app-cnpj-page /> }
      @case ('cep') { <app-cep-page /> }
      @case ('password') { <app-password-page /> }
      @case ('rg') { <app-rg-page /> }
      @case ('pis') { <app-pis-page /> }
      @case ('titulo') { <app-titulo-page /> }
      @case ('cnh') { <app-cnh-page /> }
      @case ('validate-docs') { <app-validate-docs-page /> }
      @case ('credit-card') { <app-credit-card-page /> }
      @case ('bank-account') { <app-bank-account-page /> }
      @case ('currency') { <app-currency-page /> }
      @case ('person-name') { <app-person-name-page /> }
      @case ('fake-email') { <app-fake-email-page /> }
      @case ('lorem') { <app-lorem-page /> }
      @case ('text-counter') { <app-text-counter-page /> }
      @case ('text-case') { <app-text-case-page /> }
      @case ('uuid') { <app-uuid-page /> }
      @case ('hash') { <app-hash-page /> }
      @case ('base64') { <app-base64-page /> }
      @case ('json-tools') { <app-json-tools-page /> }
      @case ('user-agent') { <app-user-agent-page /> }
      @case ('number-gen') { <app-number-gen-page /> }
      @case ('percentage') { <app-percentage-page /> }
      @case ('date-diff') { <app-date-diff-page /> }
      @case ('unit-convert') { <app-unit-convert-page /> }
    }
  `,
})
export class FourdevsHost {
  readonly tool = input.required<PageKey>()
}
