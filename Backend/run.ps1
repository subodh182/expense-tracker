# Load environment variables from .env file and run the application
Write-Host "Loading environment variables from .env file..." -ForegroundColor Green

# Read .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Loaded: $name" -ForegroundColor Cyan
        }
    }
    Write-Host "`nStarting Spring Boot application..." -ForegroundColor Green
    mvn spring-boot:run
} else {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}
