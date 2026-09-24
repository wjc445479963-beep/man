param(
  [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
$root = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
  ".json" = "application/json; charset=utf-8"
}

try {
  $listener.Start()
  Write-Host "雾港来信已启动：http://127.0.0.1:$Port/"
  Write-Host "按 Ctrl+C 停止。"
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }

      $parts = $requestLine.Split(" ", 3)
      $method = $parts[0]
      $requestPath = if ($parts.Length -gt 1) { $parts[1].Split("?")[0] } else { "/" }
      while ($null -ne ($headerLine = $reader.ReadLine()) -and $headerLine.Length -gt 0) {}

      $status = 200
      $reason = "OK"
      $bytes = [byte[]]@()
      $contentType = "application/octet-stream"
      if ($method -notin @("GET", "HEAD")) {
        $status = 405
        $reason = "Method Not Allowed"
      } else {
        $relativePath = [System.Uri]::UnescapeDataString($requestPath.TrimStart("/"))
        if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = "index.html" }
        $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
        if (-not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
          $status = 404
          $reason = "Not Found"
        } else {
          $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
          if ($contentTypes.ContainsKey($extension)) { $contentType = $contentTypes[$extension] }
          $bytes = [System.IO.File]::ReadAllBytes($filePath)
        }
      }

      $crlf = [string][char]13 + [char]10
      $responseHeaders = "HTTP/1.1 " + $status + " " + $reason + $crlf + "Content-Type: " + $contentType + $crlf + "Content-Length: " + $bytes.Length + $crlf + "Connection: close" + $crlf + "X-Content-Type-Options: nosniff" + $crlf + $crlf
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($responseHeaders)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      if ($method -ne "HEAD" -and $bytes.Length -gt 0) { $stream.Write($bytes, 0, $bytes.Length) }
      $reader.Dispose()
    } catch {
      Write-Host $_.Exception.Message
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
