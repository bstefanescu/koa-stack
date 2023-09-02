
if [ "$1" = "" ]; then
  echo "Usage ./set-version.sh version" 
  exit 1
fi

echo "Setting version to $1"

npm pkg set version=$1 --ws
npm pkg set version=$1
