@echo off
REM SkillRise India - Cleanup Script
REM This script archives the old backend directories that are no longer needed

echo ========================================
echo SkillRise India - Cleanup Script
echo ========================================
echo.
echo This script will:
echo 1. Create an 'archive' folder
echo 2. Move old backend directories to archive
echo 3. Keep only the consolidated backend
echo.
echo Old directories to be archived:
echo - agentic-chatbot/
echo - resume_analyser/
echo - new_mock/
echo.

set /p confirm="Do you want to continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cleanup cancelled.
    exit /b
)

echo.
echo Creating archive folder...
if not exist "archive" mkdir archive

echo.
echo Moving old directories...

if exist "agentic-chatbot" (
    echo Moving agentic-chatbot/ to archive/...
    move "agentic-chatbot" "archive\agentic-chatbot"
    echo ✓ agentic-chatbot moved
) else (
    echo ⚠ agentic-chatbot not found
)

if exist "resume_analyser" (
    echo Moving resume_analyser/ to archive/...
    move "resume_analyser" "archive\resume_analyser"
    echo ✓ resume_analyser moved
) else (
    echo ⚠ resume_analyser not found
)

if exist "new_mock" (
    echo Moving new_mock/ to archive/...
    move "new_mock" "archive\new_mock"
    echo ✓ new_mock moved
) else (
    echo ⚠ new_mock not found
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Old directories have been moved to: archive/
echo.
echo Current structure:
echo SkillRise_India/
echo ├── backend/          (Consolidated backend)
echo ├── client/           (React frontend)
echo └── archive/          (Old backends)
echo.
echo You can now safely delete the archive/ folder
echo after verifying everything works correctly.
echo.
pause
