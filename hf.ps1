param(
    [string]$action,
    [string]$version,
    [string]$branchType,
    [string]$branchUs,
    [string]$branchName,
    [switch]$force
)

if (-not $action) {
    Write-Host "Uso: hf [start|finish|delete] [versao]" -ForegroundColor Yellow
    exit 1
}

function Invoke-GitCmd {
    param([Parameter(Mandatory = $true)][string[]]$GitArgs)
    $cmd = "git " + ($GitArgs -join " ")
    Write-Host "> $cmd" -ForegroundColor DarkCyan
    & git @GitArgs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

function Update-MainBranches {
    Write-Host "--- Fazendo fetch ---" -ForegroundColor Yellow
    Invoke-GitCmd -GitArgs @("fetch", "--all")

    Write-Host "--- Atualizando master ---" -ForegroundColor Yellow
    Invoke-GitCmd -GitArgs @("checkout", "master")
    Invoke-GitCmd -GitArgs @("pull", "origin", "master")

    Write-Host "--- Atualizando develop ---" -ForegroundColor Yellow
    Invoke-GitCmd -GitArgs @("checkout", "develop")
    Invoke-GitCmd -GitArgs @("pull", "origin", "develop")
}

switch ($action) {
    "start" {
        if (-not $version) {
            Write-Host "Erro: informe a versão. Exemplo: hf start 3.13.4" -ForegroundColor Red
            exit 1
        }
        Update-MainBranches
        Write-Host "=== Iniciando hotfix $version... ===" -ForegroundColor Cyan
        Invoke-GitCmd -GitArgs @("flow", "hotfix", "start", $version)
    }

    "finish" {
        if (-not $version) {
            Write-Host "Erro: informe a versão. Exemplo: hf finish 3.13.4" -ForegroundColor Red
            exit 1
        }
        Update-MainBranches
        Write-Host "=== Finalizando hotfix $version... ===" -ForegroundColor Green
        Invoke-GitCmd -GitArgs @("flow", "hotfix", "finish", $version, "-m", "v$version", "-p")
    }

    "delete" {
        if (-not $version) {
            Write-Host "Erro: informe a versão. Exemplo: hf delete 3.13.4" -ForegroundColor Red
            exit 1
        }
        Update-MainBranches
        Write-Host "=== Deletando hotfix $version... ===" -ForegroundColor Magenta
        if ($force) {
            Invoke-GitCmd -GitArgs @("flow", "hotfix", "delete", $version, "-f")
        } else {
            Invoke-GitCmd -GitArgs @("flow", "hotfix", "delete", $version)
        }
        Write-Host "=== Hotfix $version deletado ===" -ForegroundColor Magenta
    }

    "new-branch" {
        if (-not $branchType) {
            Write-Host "Erro: tipo do branch é obrigatório." -ForegroundColor Red
            exit 1
        }
        if (-not $branchName) {
            Write-Host "Erro: nome do branch é obrigatório." -ForegroundColor Red
            exit 1
        }
        if ($branchUs) {
            $fullBranch = "feature/$branchType-$branchUs-$branchName"
        } else {
            $fullBranch = "feature/$branchType-$branchName"
        }
        Write-Host "=== Criando branch '$fullBranch' a partir de develop... ===" -ForegroundColor Cyan
        Invoke-GitCmd -GitArgs @("checkout", "develop")
        Invoke-GitCmd -GitArgs @("pull", "origin", "develop")
        Invoke-GitCmd -GitArgs @("checkout", "-b", $fullBranch)
        Write-Host "=== Branch '$fullBranch' criado com sucesso! ===" -ForegroundColor Green
    }

    "delete-branch" {
        if (-not $branchName) {
            Write-Host "Erro: nome do branch é obrigatório." -ForegroundColor Red
            exit 1
        }
        Write-Host "=== Deletando branch local '$branchName'... ===" -ForegroundColor Magenta
        Invoke-GitCmd -GitArgs @("branch", "-D", $branchName)
        Write-Host "=== Branch '$branchName' deletado ===" -ForegroundColor Magenta
    }

    default {
        Write-Host "Comando inválido. Use: hf [start|finish|delete] [versao]" -ForegroundColor Yellow
    }
}
