mkdir -p benchmark

for c in 100 500 1000 5000 10000
do
  echo "===== CONCURRENCY $c ====="
  oha -z 30s -c $c \
  http://127.0.0.1:3000/api/version \
  > benchmark/$c.txt
done