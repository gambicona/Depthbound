Set-Location -LiteralPath $PSScriptRoot

$port = 8000
$hostUrl = "http://127.0.0.1:$port/index.html?playtest=host"
$localStatusUrl = "http://127.0.0.1:$port/playtest-status"
$lanAddresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object {
    $_.IPAddress -notlike "127.*" -and
    $_.IPAddress -notlike "169.254.*" -and
    $_.IPAddress -notlike "0.*" -and
    $_.IPAddress -notlike "25.*" -and
    $_.PrefixOrigin -ne "WellKnown"
  } |
  Sort-Object InterfaceAlias, IPAddress

if (-not $lanAddresses) {
  $lanAddresses = ipconfig |
    Select-String -Pattern "IPv4.*?:\s*([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)" |
    ForEach-Object { $_.Matches[0].Groups[1].Value } |
    Where-Object { $_ -notlike "127.*" -and $_ -notlike "169.254.*" -and $_ -notlike "0.*" -and $_ -notlike "25.*" } |
    Sort-Object -Unique |
    ForEach-Object {
      [PSCustomObject]@{
        InterfaceAlias = "Detected LAN"
        IPAddress = $_
      }
    }
}

Write-Host "Starting Depthbound playtest server on http://127.0.0.1:$port/"
Write-Host ""
Write-Host "Host on this PC:"
Write-Host "  $hostUrl"
Write-Host ""
Write-Host "For Hamachi guests:"
Write-Host "  http://YOUR_HAMACHI_IP:$port/index.html?playtest=guest"
Write-Host ""
Write-Host "For local house/LAN guests:"
if ($lanAddresses) {
  foreach ($address in $lanAddresses) {
    Write-Host ("  {0}: http://{1}:{2}/index.html?playtest=guest" -f $address.InterfaceAlias, $address.IPAddress, $port)
  }
} else {
  Write-Host "  No LAN IPv4 address found. Run ipconfig and look for your Wi-Fi/Ethernet IPv4 address."
}
Write-Host ""
Write-Host "Status/diagnostics:"
Write-Host "  $localStatusUrl"
Write-Host ""
Write-Host "Watch this window for WARN lines:"
Write-Host "- Large snapshot accepted = sync payload may be too big and cause guest delay"
Write-Host "- Socket write backpressure = browser/network is not keeping up"
Write-Host "- ECONNRESET = a browser/socket disconnected while the server wrote to it"
Write-Host ""
Write-Host "Keep this window open while playtesting. Press Ctrl+C to stop the server."
Write-Host ""
node playtest-server.js $port
