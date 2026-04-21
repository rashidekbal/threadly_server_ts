$lines = Get-ChildItem .\src -Recurse -Filter *.js |
    Get-Content |
    Measure-Object -Line

Write-Host "Total JavaScript lines:" $lines.Lines
Read-Host "`nPress Enter to exit"

