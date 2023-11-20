set -e
ML_DRAUGHTS_API_URL="$(echo "$ML_DRAUGHTS_API_URL" | sed -r 's/([:;])/\\\1/g')"
ML_DRAUGHTS_SOCKET_URL="$(echo "$ML_DRAUGHTS_SOCKET_URL" | sed -r 's/([:;])/\\\1/g')"
echo $ML_DRAUGHTS_API_URL
sed -ri "s:^(\s*window.API_URL\s*=)\s*.+:\1 '${ML_DRAUGHTS_API_URL}':g" /var/www/html/index.html
sed -ri "s:^(\s*window.SOCKET_URL\s*=)\s*.+:\1 '${ML_DRAUGHTS_API_URL}':g" /var/www/html/index.html