#!/bin/sh
# echo "Replacing environment variables in JS files..."
# replace_env_vars() {
#     local file=$1
#     sed -i "s|src=\"\(/assets/\|assets/\)|\1=\"$APP_ASSETS_URL/assets/|g" "$file"
#     sed -i "s|href=\"\(/assets/\|assets/\)|\1=\"$APP_ASSETS_URL/assets/|g" "$file"
#     sed -i "s|url(\"/\(assets/\|url(\"$APP_ASSETS_URL/assets/|g" "$file"
# }
# find /usr/share/nginx/html -type f -name "*.html" | while read -r file; do
#     replace_env_vars "$file"
# done

# echo "Replacing environment variables in JS files..."
# replace_env_vars() {
#     local file=$1
#     sed -i "s|\(src\|href\|url\)(\?\"\?\)\(/assets/\|assets/\)|\1\2$APP_ASSETS_URL/assets/|g" "$file"
# }
# find /usr/share/nginx/html -type f \( -name "*.html" -o -name "*.js" \) | while read -r file; do
#     replace_env_vars "$file"
# done

echo "Replacing environment variables in JS files..."
replace_env_vars() {
    local file=$1
    sed -i "s|src=\"/assets/|src=\"$APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|href=\"/assets/|href=\"$APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|src=\"assets/|src=\"$APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|href=\"assets/|href=\"$APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|url(\"/assets/|url(\"$APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|url(\"assets/|url(\"$APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|url(/assets/|url($APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|url(assets/|url($APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|\"/assets/|\"$APP_ASSETS_URL/assets/|g" "$file"
    sed -i "s|\"assets/|\"$APP_ASSETS_URL/assets/|g" "$file"
}

find /usr/share/nginx/html -type f \( -name "*.html" -o -name "*.js" \) | while read -r file; do
    replace_env_vars "$file"
done

echo replacing nginx template...
envsubst '$APP_ASSETS_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting Nginx..."
exec "$@"

