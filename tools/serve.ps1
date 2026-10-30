[CmdletBinding()]
param(
    [int]$Port = 8431,
    [string]$Root = ''
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($Root)) {
    $scriptPath = $MyInvocation.MyCommand.Path
    $Root = Split-Path -Parent (Split-Path -Parent $scriptPath)
}
$Root = [System.IO.Path]::GetFullPath($Root)

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.ico'  = 'image/x-icon'
    '.woff2' = 'font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try {
    $listener.Start()
} catch {
    Write-Host "Failed to bind port ${Port}: $($_.Exception.Message)"
    exit 1
}

Write-Host "Serving $Root on http://localhost:$Port/"

while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
    } catch {
        break
    }

    $res = $ctx.Response
    $res.Headers.Add('Cache-Control', 'no-store, no-cache, must-revalidate')

    try {
        $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/', '\')
        if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }

        $full = [System.IO.Path]::GetFullPath((Join-Path $Root $rel))

        # Keep requests inside the served root.
        if (-not $full.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
            $res.StatusCode = 403
            $body = [System.Text.Encoding]::UTF8.GetBytes('403 Forbidden')
        }
        elseif (Test-Path -LiteralPath $full -PathType Container) {
            $index = Join-Path $full 'index.html'
            if (Test-Path -LiteralPath $index -PathType Leaf) {
                $res.ContentType = $mime['.html']
                $body = [System.IO.File]::ReadAllBytes($index)
            } else {
                $res.StatusCode = 404
                $body = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            }
        }
        elseif (Test-Path -LiteralPath $full -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
            $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
            $body = [System.IO.File]::ReadAllBytes($full)
        }
        else {
            $res.StatusCode = 404
            $body = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
        }

        Write-Host "$($ctx.Request.HttpMethod) $($ctx.Request.Url.AbsolutePath) -> $($res.StatusCode)"
        $res.ContentLength64 = $body.Length
        $res.OutputStream.Write($body, 0, $body.Length)
    } catch {
        Write-Host "Error: $($_.Exception.Message)"
        try { $res.StatusCode = 500 } catch {}
    } finally {
        try { $res.OutputStream.Close() } catch {}
    }
}

$listener.Stop()
