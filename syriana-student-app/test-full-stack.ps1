# Syriana Student App - Full Stack Test Suite
# Tests Backend API, Frontend, and Integration

$backendUrl = 'http://localhost:5000'
$frontendUrl = 'http://localhost:3001'
$testsPassed = 0
$testsFailed = 0

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'SYRIANA STUDENT APP - FULL STACK TESTS' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

Write-Host '1. BACKEND API TESTS' -ForegroundColor Yellow
Write-Host '--------------------' -ForegroundColor Yellow
Write-Host ''

# Test 1: Admin Login
try {
    $admin = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -Body '{\"email\":\"admin@syriana.edu\",\"password\":\"admin123\"}' -ContentType 'application/json' -TimeoutSec 10
    Write-Host '  Admin Login: PASS' -ForegroundColor Green
    $testsPassed++
    $adminToken = $admin.data.token
} catch {
    Write-Host '  Admin Login: FAIL' -ForegroundColor Red
    $testsFailed++
}

# Test 2: Get Users (Admin)
if ($adminToken) {
    try {
        $users = Invoke-RestMethod -Uri "$backendUrl/api/users" -Headers @{Authorization=\"Bearer $adminToken\"} -TimeoutSec 10
        Write-Host \"  Get Users: PASS (Found $($users.data.users.Count) users)\" -ForegroundColor Green
        $testsPassed++
        $studentEmail = $users.data.users | Where-Object { $_.role -eq 'student' } | Select-Object -First 1 -ExpandProperty email
    } catch {
        Write-Host '  Get Users: FAIL' -ForegroundColor Red
        $testsFailed++
    }
}

# Test 3: Get Courses
if ($adminToken) {
    try {
        $courses = Invoke-RestMethod -Uri "$backendUrl/api/courses" -Headers @{Authorization=\"Bearer $adminToken\"} -TimeoutSec 10
        Write-Host \"  Get Courses: PASS (Found $($courses.data.courses.Count) courses)\" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host '  Get Courses: FAIL' -ForegroundColor Red
        $testsFailed++
    }
}

Write-Host ''
Write-Host '2. FRONTEND TESTS' -ForegroundColor Yellow
Write-Host '-----------------' -ForegroundColor Yellow
Write-Host ''

# Test 4: Frontend Server
try {
    $frontend = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 10
    Write-Host '  Frontend Server: PASS' -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host '  Frontend Server: FAIL' -ForegroundColor Red
    $testsFailed++
}

# Test 5: Frontend Login Page
try {
    $loginPage = Invoke-WebRequest -Uri \"$frontendUrl/login\" -UseBasicParsing -TimeoutSec 10
    Write-Host '  Frontend /login: PASS' -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host '  Frontend /login: FAIL' -ForegroundColor Red
    $testsFailed++
}

# Test 6: Frontend Register Page
try {
    $registerPage = Invoke-WebRequest -Uri \"$frontendUrl/register\" -UseBasicParsing -TimeoutSec 10
    Write-Host '  Frontend /register: PASS' -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host '  Frontend /register: FAIL' -ForegroundColor Red
    $testsFailed++
}

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'TEST SUMMARY' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
$total = $testsPassed + $testsFailed
$successRate = if ($total -gt 0) { [math]::Round(($testsPassed / $total) * 100, 2) } else { 0 }

Write-Host \"Total Tests: $total\" -ForegroundColor White
Write-Host \"Passed: $testsPassed\" -ForegroundColor Green
Write-Host \"Failed: $testsFailed\" -ForegroundColor 
Write-Host \"Success Rate: $successRate%\" -ForegroundColor 
Write-Host ''

if ($testsFailed -eq 0) {
    Write-Host 'ALL TESTS PASSED!' -ForegroundColor Green
} else {
    Write-Host 'SOME TESTS FAILED' -ForegroundColor Yellow
}
