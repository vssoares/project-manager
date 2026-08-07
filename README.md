# Project Manager

Aplicativo desktop (Electron + Angular) para desenvolvedores: gerencia versões de arquivos de configuração (`.env` e outros) **e** automatiza o fluxo de hotfix/branches do Git Flow, sem precisar abrir o terminal.

---

## Funcionalidades

### Editor de ambientes (env switcher)
- Rastreie qualquer arquivo de configuração e mantenha múltiplos "ambientes" (versões nomeadas e coloridas) dele.
- Histórico de versões por ambiente, com diff lado a lado (Monaco).
- Aplique um ambiente diretamente no arquivo vinculado no disco.

### Git Flow / Hotfix

| Ação | O que faz |
|------|-----------|
| **START** | Atualiza `master` e `develop`, depois inicia um hotfix com `git flow hotfix start <versão>` |
| **FINISH** | Atualiza `master` e `develop`, finaliza o hotfix com `git flow hotfix finish <versão>` e faz push automático |
| **DELETE** | Atualiza `master` e `develop`, remove o hotfix com `git flow hotfix delete <versão>` |

Também cria feature branches a partir de `develop` no formato `feature/<tipo>-[us]-<nome>` (tipos: `sustentacao`, `manutencao`, `votorantim`, `vcmonitoramento`), deleta branches locais, e abre `gitk master` para visualizar o histórico.

Outras funcionalidades da aba Git Flow:
- Seletor de projetos com suporte a projetos customizados (adicionar/remover)
- Console de saída em tempo real com todos os logs do Git
- Atualização automática — notifica quando há nova versão disponível e permite baixar e instalar sem sair do app

---

## Sobre os comandos executados (Git Flow)

> **Os comandos executados pelo app são 100% operações Git e não causam nenhum dano à máquina do usuário.**

O app executa internamente um script PowerShell (`hf.ps1`) que realiza exclusivamente:

- `git fetch --all` — busca atualizações remotas
- `git checkout` / `git pull` — troca de branch e atualização local
- `git flow hotfix start/finish/delete` — gerenciamento do fluxo de hotfix
- `git checkout -b` — criação de nova branch

Nenhum arquivo do sistema é modificado, nenhum dado é enviado para servidores externos (exceto o próprio repositório Git configurado no projeto), e nenhum processo é executado fora do contexto Git.

O script roda com `-ExecutionPolicy Bypass` apenas para permitir a execução do arquivo `.ps1` sem necessidade de assinar o script — isso é padrão em ferramentas de automação Git no Windows e **não altera a política de execução global do PowerShell** da máquina.

---

## Requisitos

- Windows 10 ou superior
- [Git](https://git-scm.com/) instalado e disponível no PATH
- [git-flow](https://github.com/nvie/gitflow) instalado (`git flow init` já configurado nos projetos que usarem a aba Git Flow)
- `gitk` instalado (geralmente incluído na instalação do Git para Windows)

---

## Release

Publicar uma nova versão (gera o instalador Windows e cria um GitHub Release, usado pelo auto-update):

**Via GitHub Actions (recomendado):**
```bash
npm version patch   # ou minor / major — atualiza a versão no package.json e cria a tag
git push && git push --tags
```
O workflow `.github/workflows/release.yml` builda e publica automaticamente ao detectar uma tag `vX.Y.Z`.

**Publicar direto da sua máquina (sem passar pelo Actions):**
```bash
$env:GH_TOKEN = "<personal access token com escopo repo>"
npm version patch
npm run dist:win:publish
git push && git push --tags
```
Precisa de um [personal access token](https://github.com/settings/tokens) com escopo `repo` na variável `GH_TOKEN` — é assim que o `electron-builder` se autentica pra criar o Release.

---

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Gerar build para Windows
npm run dist:win
```

---

## Tecnologias

- [Electron](https://www.electronjs.org/)
- [Angular](https://angular.dev/) (standalone, zoneless)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [electron-updater](https://www.electron.build/auto-update)
