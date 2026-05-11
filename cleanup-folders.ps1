# SkillRise India - Cleanup Old Folders
# This script removes the old backend folders that are no longer needed

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SkillRise India - Cleanup Old Folders" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will DELETE the following folders:" -ForegroundColor Yellow
Write-Host "  - agentic-chatbot/" -ForegroundColor Red
Write-Host "  - resume_analyser/" -ForegroundColor Red
Write-Host "  - new_mock/" -ForegroundColor Red
Write-Host ""
Write-Host "All code from these folders is already integrated into:" -ForegroundColor Green
Write-Host "  - backend/services/chatbot/" -ForegroundColor Green
Write-Host "  - backend/services/resume/" -ForegroundColor Green
Write-Host "  - backend/services/interview/" -ForegroundColor Green
Write-Host ""

$confirmation = Read-Host "Are you sure you want to DELETE these folders? (Type 'YES' to confirm)"

if ($confirmation -ne "YES") {
    Write-Host ""
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

Write-Host ""
Write-Host "Starting cleanup..." -ForegroundColor Cyan
Write-Host ""

# Function to safely delete a folder
function Remove-FolderSafely {
    param($folderPath, $folderName)
    
    if (Test-Path $folderPath) {
        try {
            Write-Host "Deleting $folderName..." -ForegroundColor Yellow
            Remove-Item -Path $folderPath -Recurse -Force -ErrorAction Stop
            Write-Host "✓ $folderName deleted successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Failed to delete $folderName" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "  Please close any programs using files in this folder and try again." -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⚠ $folderName not found (already deleted?)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Delete old folders
Remove-FolderSafely ".\agentic-chatbot" "agentic-chatbot/"
Remove-FolderSafely ".\resume_analyser" "resume_analyser/"
Remove-FolderSafely ".\new_mock" "new_mock/"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your project structure is now clean:" -ForegroundColor Green
Write-Host "  SkillRise_India/" -ForegroundColor White
Write-Host "  ├── backend/          (Consolidated backend)" -ForegroundColor Green
Write-Host "  ├── client/           (React frontend)" -ForegroundColor Green
Write-Host "  ├── screenshots/      (Documentation images)" -ForegroundColor Cyan
Write-Host "  └── *.md              (Documentation files)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  2. Test the frontend: cd client && npm run dev" -ForegroundColor White
Write-Host "  3. Verify all features work correctly" -ForegroundColor White
Write-Host ""
pause
