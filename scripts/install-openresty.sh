#!/usr/bin/env bash
set -euo pipefail

CORES=$(sysctl -n hw.ncpu 2>/dev/null || nproc)

echo "Detected macOS. Installing GeoIP library into /opt/homebrew/geoip..."
curl -LO https://github.com/maxmind/geoip-api-c/releases/download/v1.6.12/GeoIP-1.6.12.tar.gz

tar zxvf GeoIP-1.6.12.tar.gz
cd GeoIP-1.6.12
./configure --prefix=/opt/homebrew/geoip
make -j"${CORES}"
sudo make install
cd ..
rm -rf GeoIP-1.6.12 GeoIP-1.6.12.tar.gz

echo "Trying Homebrew build of OpenResty with GeoIP..."
if ! CPPFLAGS="-I/opt/homebrew/geoip/include" \
   LDFLAGS="-L/opt/homebrew/geoip/lib" \
   brew install --build-from-source openresty/brew/openresty; then
  echo "Homebrew failed, falling back to manual source build..."
  curl -LO https://openresty.org/download/openresty-1.27.1.2.tar.gz
  tar zxvf openresty-1.27.1.2.tar.gz
  cd openresty-1.27.1.2
  ./configure \
    --prefix=/opt/homebrew/openresty \
    --with-http_geoip_module \
    --with-cc-opt="-I/opt/homebrew/geoip/include" \
    --with-ld-opt="-L/opt/homebrew/geoip/lib"
  make -j"${CORES}"
  sudo make install
  cd ..
  rm -rf openresty-1.27.1.2 openresty-1.27.1.2.tar.gz
fi
