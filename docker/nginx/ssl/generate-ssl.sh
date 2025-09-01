#!/bin/bash

# ========================================
# ГЕНЕРАЦІЯ SSL СЕРТИФІКАТІВ
# ========================================
# Скрипт для створення самопідписаних сертифікатів

set -e

# Конфігурація
CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_NAME="skillklan"
COUNTRY="UA"
STATE="Kyiv"
CITY="Kyiv"
ORG="SkillKlan"
ORG_UNIT="IT Department"
COMMON_NAME="37.57.209.201"
EMAIL="admin@skillklan.com"
DAYS_VALID=365

echo "🔐 Генерація SSL сертифікатів для SkillKlan..."

# Перевіряємо наявність OpenSSL
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL не знайдено. Встановіть OpenSSL спочатку."
    exit 1
fi

# Створюємо директорію для сертифікатів
mkdir -p "$CERT_DIR"

# Генеруємо приватний ключ
echo "📝 Генерація приватного ключа..."
openssl genrsa -out "$CERT_DIR/${CERT_NAME}.key" 2048

# Створюємо конфігурацію для сертифіката
cat > "$CERT_DIR/${CERT_NAME}.conf" << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = ${COUNTRY}
ST = ${STATE}
L = ${CITY}
O = ${ORG}
OU = ${ORG_UNIT}
CN = ${COMMON_NAME}
emailAddress = ${EMAIL}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${COMMON_NAME}
DNS.2 = localhost
IP.1 = ${COMMON_NAME}
IP.2 = 127.0.0.1
EOF

# Генеруємо сертифікат
echo "📜 Генерація сертифіката..."
openssl req -new -x509 -key "$CERT_DIR/${CERT_NAME}.key" \
    -out "$CERT_DIR/${CERT_NAME}.crt" \
    -days $DAYS_VALID \
    -config "$CERT_DIR/${CERT_NAME}.conf"

# Встановлюємо правильні права доступу
chmod 600 "$CERT_DIR/${CERT_NAME}.key"
chmod 644 "$CERT_DIR/${CERT_NAME}.crt"

# Очищаємо тимчасові файли
rm "$CERT_DIR/${CERT_NAME}.conf"

echo "✅ SSL сертифікати успішно створені!"
echo "📁 Розташування: $CERT_DIR"
echo "🔑 Приватний ключ: ${CERT_NAME}.key"
echo "📜 Сертифікат: ${CERT_NAME}.crt"
echo "⏰ Дійсність: $DAYS_VID days"
echo ""
echo "⚠️  УВАГА: Це самопідписаний сертифікат для тестування!"
echo "   Для продакшну використовуйте Let's Encrypt або інші CA."
echo ""
echo "🚀 Для активації HTTPS розкоментуйте HTTPS блок в nginx.conf"




