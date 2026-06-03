@echo off
cd /d "%~dp0"
echo ============================================
echo    CANVA CLONER - PLR PRO
echo ============================================
echo.
echo Se abrira Chrome. Inicia sesion en Canva.
echo El script continuara automaticamente.
echo.
echo ============================================
node scripts\canva-cloner.js
echo.
echo ============================================
echo    COMPLETADO
echo    Revisa scripts\canva-results.json
echo ============================================
pause
