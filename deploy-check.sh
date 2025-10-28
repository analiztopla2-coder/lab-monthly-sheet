#!/bin/bash

# AWS Linux Sunucu Deployment Kontrol Scripti
# Bu script'i sunucunuzda çalıştırarak sorunları tespit edebilirsiniz

echo "========================================="
echo "Lab Monthly Sheet - Deployment Kontrolü"
echo "========================================="
echo ""

# 1. .env.local kontrolü
echo "1️⃣  .env.local dosyası kontrolü..."
if [ -f .env.local ]; then
    echo "✅ .env.local dosyası mevcut"
    echo ""
    echo "📋 .env.local içeriği:"
    cat .env.local | grep -v "SUPABASE_SERVICE_ROLE" | grep -v "ANON_KEY"
    echo ""
else
    echo "❌ .env.local dosyası bulunamadı!"
    echo "   Lütfen .env.example'dan kopyalayın:"
    echo "   cp .env.example .env.local"
    echo "   nano .env.local"
    exit 1
fi

# 2. Node.js sürümü
echo "2️⃣  Node.js sürümü..."
node --version
echo ""

# 3. npm paketleri
echo "3️⃣  node_modules kontrolü..."
if [ -d node_modules ]; then
    echo "✅ node_modules klasörü mevcut"
else
    echo "❌ node_modules bulunamadı! npm install çalıştırın"
fi
echo ""

# 4. Build kontrolü
echo "4️⃣  Next.js build kontrolü..."
if [ -d .next ]; then
    echo "✅ .next build klasörü mevcut"
else
    echo "❌ Build bulunamadı! npm run build çalıştırın"
fi
echo ""

# 5. PM2 kontrolü
echo "5️⃣  PM2 durumu..."
pm2 status
echo ""

# 6. Port kontrolü
echo "6️⃣  Port 3000 kontrolü..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Port 3000 dinleniyor"
    echo "   Process:"
    lsof -i :3000 | grep LISTEN
else
    echo "❌ Port 3000'de hiçbir şey çalışmıyor!"
fi
echo ""

# 7. Log kontrolü
echo "7️⃣  PM2 Log'ları (son 20 satır)..."
pm2 logs lab-sheet --lines 20 --nostream
echo ""

# 8. Supabase bağlantı testi
echo "8️⃣  Supabase bağlantı testi..."
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL bulunamadı!"
else
    echo "   Supabase URL: $SUPABASE_URL"
    curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" "$SUPABASE_URL/rest/v1/"
fi
echo ""

# 9. Veritabanı tabloları kontrolü
echo "9️⃣  Veritabanı tabloları kontrolü..."
echo "   ⚠️  Manuel kontrol gerekli:"
echo "   1. Supabase Dashboard → SQL Editor"
echo "   2. SELECT * FROM app_users LIMIT 1;"
echo "   3. SELECT * FROM monthly_sheets LIMIT 1;"
echo "   4. SELECT * FROM user_activity_logs LIMIT 1;"
echo ""

echo "========================================="
echo "✅ Kontrol tamamlandı!"
echo "========================================="
echo ""
echo "🔧 Sorun Giderme:"
echo ""
echo "1. Login çalışmıyorsa:"
echo "   - Supabase'de app_users tablosunu kontrol edin"
echo "   - Seed endpoint'ini çağırın: curl http://localhost:3000/api/seed"
echo "   - PM2 loglarını inceleyin: pm2 logs lab-sheet"
echo ""
echo "2. .env.local yoksa veya hatalıysa:"
echo "   - Yerel .env.local'i sunucuya kopyalayın"
echo "   - APP_JWT_SECRET'ın aynı olduğundan emin olun"
echo ""
echo "3. Build hatası varsa:"
echo "   - npm run build tekrar çalıştırın"
echo "   - pm2 restart lab-sheet"
echo ""
