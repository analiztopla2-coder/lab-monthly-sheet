# GitHub'a Yükleme Talimatları

## 1. GitHub'da Yeni Repository Oluşturma

### Adım 1: GitHub'a Giriş Yapın
1. https://github.com adresine gidin
2. Hesabınıza giriş yapın
3. Sağ üst köşede **+** ikonuna tıklayın
4. **New repository** seçin

### Adım 2: Repository Ayarlarını Yapın
- **Repository name**: `lab-monthly-sheet` (veya istediğiniz isim)
- **Description**: `EMAA Laboratuvar Aylık Takip Sistemi - Laboratory data tracking with admin panel, activity logs, and Excel export`
- **Visibility**: 
  - ✅ **Public** (herkese açık) veya
  - 🔒 **Private** (sadece siz)
- ⚠️ **Initialize repository with** bölümünü boş bırakın (README, .gitignore eklemeyin!)
- **Create repository** butonuna tıklayın

## 2. Yerel Repository'yi GitHub'a Bağlama

Repository oluşturduktan sonra GitHub size komutlar gösterecek. Aşağıdaki komutu çalıştırın:

### PowerShell'de:

```powershell
# GitHub repository URL'inizi buraya yazın (HTTPS veya SSH)
# Örnek: https://github.com/YOUR_USERNAME/lab-monthly-sheet.git

# Remote ekleyin (YOUR_USERNAME kısmını değiştirin!)
git remote add origin https://github.com/YOUR_USERNAME/lab-monthly-sheet.git

# Ana branch adını main olarak ayarlayın
git branch -M main

# İlk push'u yapın
git push -u origin main
```

### Örnek Komut Sırası:

```powershell
# 1. Remote ekle
git remote add origin https://github.com/sonsuz-dongu/lab-monthly-sheet.git

# 2. Branch adını main yap
git branch -M main

# 3. Push yap
git push -u origin main
```

## 3. GitHub Authentication

### Seçenek A: Personal Access Token (Önerilen)

Eğer username/password soruyorsa:

1. **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)** butonuna tıklayın
3. Token adı girin: `lab-monthly-sheet-token`
4. Scope'ları seçin:
   - ✅ `repo` (full control)
   - ✅ `workflow` (opsiyonel)
5. **Generate token** butonuna tıklayın
6. Token'ı kopyalayın (bir daha gösterilmeyecek!)
7. Git push yaparken:
   - **Username**: GitHub kullanıcı adınız
   - **Password**: Kopyaladığınız token (şifre değil!)

### Seçenek B: GitHub CLI

```powershell
# GitHub CLI kurulumu (opsiyonel)
winget install GitHub.cli

# Giriş yapın
gh auth login

# Repository oluşturun ve push yapın
gh repo create lab-monthly-sheet --public --source=. --remote=origin --push
```

### Seçenek C: SSH Key (İleri Seviye)

```powershell
# SSH key oluştur
ssh-keygen -t ed25519 -C "your_email@example.com"

# Public key'i kopyala
cat ~/.ssh/id_ed25519.pub

# GitHub Settings → SSH and GPG keys → New SSH key
# Kopyaladığınız key'i yapıştırın

# SSH URL kullanın
git remote add origin git@github.com:YOUR_USERNAME/lab-monthly-sheet.git
git push -u origin main
```

## 4. Push Doğrulama

Push başarılı olduysa:

```powershell
git status
# Output: "Your branch is up to date with 'origin/main'"
```

GitHub repository sayfanızı yenileyin:
- https://github.com/YOUR_USERNAME/lab-monthly-sheet

Tüm dosyalarınızı görmelisiniz! 🎉

## 5. Gelecekteki Güncellemeler İçin

Kod değişikliği yaptıktan sonra:

```powershell
# Değişiklikleri ekle
git add .

# Commit yap
git commit -m "feat: add new feature"

# GitHub'a push et
git push origin main
```

### Yaygın Git Komutları:

```powershell
# Durumu kontrol et
git status

# Değişiklikleri göster
git diff

# Log'ları görüntüle
git log --oneline

# Belirli dosyaları ekle
git add app/page.tsx lib/auth.ts

# Son commit mesajını değiştir (henüz push edilmediyse)
git commit --amend -m "New message"

# Remote repository'yi kontrol et
git remote -v

# En son değişiklikleri çek (collaborator varsa)
git pull origin main

# Branch oluştur
git checkout -b feature/new-feature

# Branch değiştir
git checkout main

# Branch'leri listele
git branch
```

## 6. README Güncellemesi

GitHub repository'nizde README'yi güncelleyin:

1. GitHub'da `README.md` dosyasına tıklayın
2. Sağ üstte **Edit** (kalem ikonuna) tıklayın
3. Aşağıdaki bölümü ekleyin:

```markdown
## 🚀 Demo

Canlı demo: https://your-domain.com (eğer deploy ettiyseniz)

## 📦 GitHub Clone

\```bash
git clone https://github.com/YOUR_USERNAME/lab-monthly-sheet.git
cd lab-monthly-sheet
npm install
\```
```

## 7. AWS Linux'a Deploy

AWS sunucunuzda:

```bash
# Repository'yi klonlayın
git clone https://github.com/YOUR_USERNAME/lab-monthly-sheet.git

# Proje dizinine girin
cd lab-monthly-sheet

# Kurulum için AWS_DEPLOYMENT.md dosyasını takip edin
cat AWS_DEPLOYMENT.md
```

## 8. .gitignore Kontrolü

`.env.local` dosyanızın GIT'e eklenmediğinden emin olun:

```powershell
# Bu komut boş çıkmalı (env.local göstermemeli)
git ls-files | grep ".env.local"

# Eğer .env.local gözüküyorsa:
git rm --cached .env.local
git commit -m "fix: remove .env.local from tracking"
git push origin main
```

## 9. Repository Özellikleri

GitHub repository sayfanızda sağ tarafta **About** bölümüne tıklayın:

- **Description**: `EMAA Laboratuvar Aylık Takip Sistemi`
- **Website**: Uygulamanızın URL'i (varsa)
- **Topics**: `nextjs`, `typescript`, `supabase`, `laboratory`, `data-tracking`, `excel-export`

## 10. Güvenlik Notları

⚠️ **ÖNEMLİ**: `.env.local` dosyanızda hassas bilgiler var!

- ✅ `.gitignore` dosyasında `.env.local` olduğundan emin olun
- ✅ `.env.example` dosyasını push edin (placeholder'larla)
- ❌ Asla gerçek `SUPABASE_SERVICE_ROLE` key'ini push etmeyin
- ❌ Asla `APP_JWT_SECRET` gerçek değerini push etmeyin

### Kontrol:

```powershell
# .gitignore içeriğini kontrol et
cat .gitignore

# .env.local'in ignore edildiğini doğrula
git check-ignore .env.local
# Output: ".env.local" görmeli
```

## Yardım

Sorun yaşarsanız:

1. **Remote URL'i kontrol edin**:
   ```powershell
   git remote -v
   ```

2. **Authentication sorunları**:
   - Personal Access Token kullanın
   - SSH key kullanmayı deneyin
   - GitHub CLI kullanın

3. **Push reddedilirse**:
   ```powershell
   git pull origin main --rebase
   git push origin main
   ```

4. **Conflict durumunda**:
   ```powershell
   git status
   # Conflict'leri düzeltin
   git add .
   git rebase --continue
   git push origin main
   ```

## Faydalı Linkler

- [GitHub Docs - Adding an existing project](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github)
- [GitHub Authentication](https://docs.github.com/en/authentication)
- [Git Tutorial](https://git-scm.com/docs/gittutorial)
