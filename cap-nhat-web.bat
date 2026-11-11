@echo off
chcp 65001 >nul
echo ========================================================
echo   TỰ ĐỘNG CẬP NHẬT WEB LÊN GITHUB ^& VERCEL / NETLIFY
echo ========================================================
git add .
git commit -m "Cap nhat giao dien va du lieu web Formosa Hoa Ngu"
git push origin main
echo.
echo [HOÀN TẤT] Đã đẩy thay đổi lên GitHub!
echo Vercel / Netlify sẽ tự động cập nhật trang web online sau 30-45 giây.
pause

