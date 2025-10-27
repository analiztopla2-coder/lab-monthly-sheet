# AWS Linux Deployment Kılavuzu

Bu doküman, lab-monthly-sheet uygulamasının AWS Linux sunucuya nasıl kurulacağını açıklar.

## Gereksinimler

- AWS EC2 Linux sunucu (Amazon Linux 2 veya Ubuntu 20.04+)
- Node.js 18+ ve npm
- Git
- PM2 (production process manager)
- Nginx (opsiyonel, reverse proxy için)

## 1. Sunucu Hazırlığı

### AWS EC2 Instance Oluşturma

1. AWS Console → EC2 → Launch Instance
2. **İşletim Sistemi**: Amazon Linux 2023 veya Ubuntu 22.04 LTS
3. **Instance Type**: t2.micro veya üzeri (minimum 1GB RAM)
4. **Security Group**: 
   - SSH (22) - Kendi IP'niz
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (3000) - 0.0.0.0/0 (geliştirme için)
5. Key pair oluşturun ve indirin

### SSH ile Bağlanma

```bash
# Windows PowerShell
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# Ubuntu için:
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

## 2. Node.js ve Gerekli Araçları Yükleme

### Amazon Linux 2023 için:

```bash
# Sistem güncelleme
sudo dnf update -y

# Node.js 18 LTS kurulumu
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Git kurulumu
sudo dnf install -y git

# PM2 kurulumu (global)
sudo npm install -g pm2

# Nginx kurulumu (opsiyonel)
sudo dnf install -y nginx
```

### Ubuntu için:

```bash
# Sistem güncelleme
sudo apt update && sudo apt upgrade -y

# Node.js 18 LTS kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Git kurulumu
sudo apt install -y git

# PM2 kurulumu (global)
sudo npm install -g pm2

# Nginx kurulumu (opsiyonel)
sudo apt install -y nginx
```

### Kurulumları Kontrol Edin:

```bash
node --version   # v18.x.x
npm --version    # 9.x.x
git --version    # 2.x.x
pm2 --version    # 5.x.x
```

## 3. Uygulamayı Klonlama ve Kurulum

```bash
# Ana dizine geçin
cd ~

# Repository'yi klonlayın
git clone https://github.com/YOUR_USERNAME/lab-monthly-sheet.git

# Proje dizinine girin
cd lab-monthly-sheet

# Bağımlılıkları yükleyin
npm install

# Production build alın
npm run build
```

## 4. Ortam Değişkenlerini Yapılandırma

```bash
# .env.local dosyasını oluşturun
cp .env.example .env.local

# Dosyayı düzenleyin
nano .env.local
```

**`.env.local` içeriği:**

```bash
# Supabase bilgilerinizi girin
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE=your-service-role-key-here

# Güvenli JWT secret oluşturun
APP_JWT_SECRET=your-secure-random-string-here

# Admin bilgileri
APP_DEFAULT_ADMIN=admin
APP_DEFAULT_PASSWORD=your-secure-admin-password
```

**Güvenli JWT Secret Oluşturma:**

```bash
# Linux/Mac için:
openssl rand -base64 32

# Çıktıyı APP_JWT_SECRET olarak kullanın
```

**Dosyayı kaydedin:** `Ctrl+O` → `Enter` → `Ctrl+X`

## 5. Supabase Veritabanı Kurulumu

1. https://supabase.com/dashboard adresine gidin
2. Projenize girin
3. **SQL Editor** → **New Query**
4. `supabase/migrations/001_init.sql` içeriğini çalıştırın
5. `supabase/migrations/002_activity_logs.sql` içeriğini çalıştırın

## 6. İlk Kullanıcı Oluşturma (Seed)

```bash
# Geliştirme modunda başlatın (arka planda)
npm run dev &

# Seed endpoint'ini çağırın
curl http://localhost:3000/api/seed

# Çıktıda admin kullanıcısı oluşturulduğunu göreceksiniz
# Process'i durdurun
pkill -f "next dev"
```

## 7. PM2 ile Production Başlatma

### PM2 Ecosystem Dosyası Oluşturma:

```bash
# ecosystem.config.js dosyası oluşturun
nano ecosystem.config.js
```

**Dosya içeriği:**

```javascript
module.exports = {
  apps: [{
    name: 'lab-monthly-sheet',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Uygulamayı Başlatın:

```bash
# PM2 ile başlat
pm2 start ecosystem.config.js

# Durumu kontrol et
pm2 status

# Logları görüntüle
pm2 logs

# Sistem başlangıcında otomatik başlat
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
pm2 save
```

### PM2 Komutları:

```bash
pm2 status              # Uygulamanın durumunu göster
pm2 logs                # Logları takip et
pm2 restart all         # Uygulamayı yeniden başlat
pm2 stop all            # Uygulamayı durdur
pm2 delete all          # Uygulamayı PM2'den kaldır
pm2 monit               # Gerçek zamanlı monitoring
```

## 8. Nginx Reverse Proxy (Opsiyonel)

Domain adı ile çalıştırmak için Nginx yapılandırması:

```bash
# Nginx config dosyası oluşturun
sudo nano /etc/nginx/conf.d/lab-monthly-sheet.conf
```

**Dosya içeriği:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Nginx'i başlatın:**

```bash
# Config'i test et
sudo nginx -t

# Nginx'i başlat
sudo systemctl start nginx
sudo systemctl enable nginx

# Durumu kontrol et
sudo systemctl status nginx
```

## 9. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu (Amazon Linux)
sudo dnf install -y certbot python3-certbot-nginx

# Certbot kurulumu (Ubuntu)
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

## 10. Güvenlik Duvarı Ayarları

```bash
# Firewalld (Amazon Linux)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 11. Uygulama Güncellemeleri

Kod güncellemesi için:

```bash
cd ~/lab-monthly-sheet

# En son kodu çek
git pull origin main

# Bağımlılıkları güncelle
npm install

# Yeniden build al
npm run build

# PM2'yi yeniden başlat
pm2 restart all
```

## 12. Yedekleme ve Monitoring

### Uygulama Logları:

```bash
# PM2 logları
pm2 logs --lines 100

# Nginx logları
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Veritabanı Yedeği:

Supabase otomatik yedekleme yapar, ancak manuel export için:
1. Supabase Dashboard → Database → Backups
2. Export işlemi yapın

### Disk Kullanımı:

```bash
df -h                    # Disk kullanımı
du -sh ~/lab-monthly-sheet   # Proje boyutu
```

## 13. Sorun Giderme

### Uygulama Çalışmıyor:

```bash
# PM2 durumunu kontrol et
pm2 status

# Logları kontrol et
pm2 logs --err

# Uygulamayı yeniden başlat
pm2 restart all

# Port 3000'i kullanan process
sudo lsof -i :3000
sudo kill -9 PID_NUMARASI
```

### Build Hataları:

```bash
# Node_modules'i temizle
rm -rf node_modules package-lock.json
npm install

# .next cache'i temizle
rm -rf .next
npm run build
```

### Bellek Sorunları:

```bash
# Swap alanı ekle (1GB)
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Kalıcı yap
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 14. Performans İyileştirmeleri

### Next.js Optimizasyonları:

`next.config.js` dosyasına ekleyin:

```javascript
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
}
```

### PM2 Cluster Mode:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'lab-monthly-sheet',
    script: 'npm',
    args: 'start',
    instances: 'max',  // CPU sayısı kadar instance
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};
```

## 15. Test ve Doğrulama

```bash
# Uygulama sağlık kontrolü
curl http://localhost:3000

# Nginx üzerinden
curl http://your-domain.com

# SSL kontrolü
curl https://your-domain.com
```

## Faydalı Linkler

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Supabase Dashboard](https://supabase.com/dashboard)

## Destek

Sorun yaşarsanız:
1. PM2 loglarını kontrol edin: `pm2 logs`
2. Nginx loglarını kontrol edin: `sudo tail -f /var/log/nginx/error.log`
3. `.env.local` dosyasının doğru yapılandırıldığından emin olun
4. Supabase bağlantısını test edin
