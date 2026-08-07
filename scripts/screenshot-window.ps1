Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$sig = @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
    public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
}
"@
Add-Type -TypeDefinition $sig

$procs = Get-Process electron -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -ne "" -and $_.MainWindowTitle -notlike "*Developer Tools*" }
if (-not $procs) {
    Write-Output "NO_WINDOW_FOUND"
    exit 1
}
$proc = $procs | Select-Object -First 1
$h = $proc.MainWindowHandle
[Win32]::ShowWindow($h, 9) | Out-Null
[Win32]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 400

$rect = New-Object Win32+RECT
[Win32]::GetWindowRect($h, [ref]$rect) | Out-Null
$w = $rect.Right - $rect.Left
$hgt = $rect.Bottom - $rect.Top

$bmp = New-Object System.Drawing.Bitmap $w, $hgt
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($rect.Left, $rect.Top, 0, 0, (New-Object System.Drawing.Size($w, $hgt)))
$outPath = $args[0]
$bmp.Save($outPath)
Write-Output "SAVED:$outPath"
