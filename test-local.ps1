# test-local.ps1
Write-Host "🚀 TESTING LOCAL ENDPOINTS" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

# Test local server
$baseUrl = "http://localhost:5000"

try {
    # Test Health Check
    Write-Host "1️⃣ TESTING HEALTH CHECK" -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -TimeoutSec 10
        Write-Host "✅ Health check successful:" -ForegroundColor Green
        $healthResponse | ConvertTo-Json
    } catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test API Test Suite
    Write-Host "`n2️⃣ TESTING API TEST SUITE" -ForegroundColor Yellow
    try {
        $apiTestSuite = @{
            name = "Simple API Test"
            description = "Basic API test"
            testType = "API"
            toolId = "axios"
            baseUrl = "https://jsonplaceholder.typicode.com"
            steps = @(
                @{
                    name = "Get Posts"
                    type = "api"
                    description = "Get all posts"
                    config = @{
                        method = "GET"
                        url = "/posts"
                        validation = @{
                            statusCode = 200
                            responseTime = 5000
                        }
                    }
                }
            )
        }
        
        $apiResponse = Invoke-RestMethod -Uri "$baseUrl/api/execute-test-suite" -Method Post -Body ($apiTestSuite | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✅ API test suite response: 200" -ForegroundColor Green
        Write-Host "📊 API test result:" -ForegroundColor Cyan
        Write-Host "  Success: $($apiResponse.success)"
        Write-Host "  Total Steps: $($apiResponse.totalSteps)"
        Write-Host "  Passed Steps: $($apiResponse.passedSteps)"
        Write-Host "  Failed Steps: $($apiResponse.failedSteps)"
        Write-Host "  Total Time: $($apiResponse.totalTime)ms"
        
    } catch {
        Write-Host "❌ API test suite failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n======================================================================" -ForegroundColor Cyan
    Write-Host "🎯 LOCAL ENDPOINT TESTING COMPLETED" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}
