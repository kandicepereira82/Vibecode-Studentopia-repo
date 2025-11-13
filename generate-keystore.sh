#!/bin/bash
# Script to generate Android keystore
# Run this on your local machine after installing Java JDK

echo "Generating Android Keystore..."
echo ""

keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore studentkeystore.jks \
  -alias studentopia \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass studentopia123 \
  -keypass studentopia123 \
  -dname "CN=Studentopia, OU=Development, O=KandicePereira, L=City, ST=State, C=US"

if [ -f "studentkeystore.jks" ]; then
  echo ""
  echo "✅ Keystore generated successfully!"
  echo "📁 File: studentkeystore.jks"
  echo ""
  echo "📝 Keystore Details:"
  echo "   Store Password: studentopia123"
  echo "   Key Alias: studentopia"
  echo "   Key Password: studentopia123"
  echo ""
  echo "⚠️  IMPORTANT: Keep these passwords safe!"
  echo ""
  echo "Next steps:"
  echo "1. Upload studentkeystore.jks to Expo dashboard"
  echo "2. Use the passwords above when prompted"
else
  echo "❌ Failed to generate keystore. Make sure Java JDK is installed."
fi

