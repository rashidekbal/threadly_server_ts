$lines = Get-ChildItem .\src -Recurse -Filter *.ts |
    Get-Content |
    Measure-Object -Line

Write-Host "Total JavaScript lines:" $lines.Lines
Read-Host "`nPress Enter to exit"

