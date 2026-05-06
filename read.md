# Портал для бд
ssh -L 5444:127.0.0.1:5433 root@138.68.129.175

# Подключись к серверу:
ssh root@138.68.129.175
cd poly_record_data

# Выгрузи CSV:
docker compose exec db psql -U poly polymarket -c "COPY (SELECT s.token, s.slug, s.outcome, o.best_bid_up, o.best_bid_up_size, o.best_bid_down, o.best_bid_down_size, o.best_ask_up, o.best_ask_up_size, o.best_ask_down, o.best_ask_down_size, o.ws_time, o.created_at FROM orderbook_snapshots o JOIN sessions s ON o.session_id = s.id WHERE s.token = 'btc' ORDER BY o.id) TO '/tmp/btc.csv' WITH CSV HEADER"
docker compose exec db psql -U poly polymarket -c "COPY (SELECT s.token, s.slug, s.outcome, o.best_bid_up, o.best_bid_up_size, o.best_bid_down, o.best_bid_down_size, o.best_ask_up, o.best_ask_up_size, o.best_ask_down, o.best_ask_down_size, o.ws_time, o.created_at FROM orderbook_snapshots o JOIN sessions s ON o.session_id = s.id WHERE s.token = 'eth' ORDER BY o.id) TO '/tmp/eth.csv' WITH CSV HEADER"
docker compose exec db psql -U poly polymarket -c "COPY (SELECT s.token, s.slug, s.outcome, o.best_bid_up, o.best_bid_up_size, o.best_bid_down, o.best_bid_down_size, o.best_ask_up, o.best_ask_up_size, o.best_ask_down, o.best_ask_down_size, o.ws_time, o.created_at FROM orderbook_snapshots o JOIN sessions s ON o.session_id = s.id WHERE s.token = 'sol' ORDER BY o.id) TO '/tmp/sol.csv' WITH CSV HEADER"
docker compose exec db psql -U poly polymarket -c "COPY (SELECT s.token, s.slug, s.outcome, o.best_bid_up, o.best_bid_up_size, o.best_bid_down, o.best_bid_down_size, o.best_ask_up, o.best_ask_up_size, o.best_ask_down, o.best_ask_down_size, o.ws_time, o.created_at FROM orderbook_snapshots o JOIN sessions s ON o.session_id = s.id WHERE s.token = 'xrp' ORDER BY o.id) TO '/tmp/xrp.csv' WITH CSV HEADER"

# Скопируй из контейнера:
docker cp poly_record_data-db-1:/tmp/btc.csv ./btc.csv
docker cp poly_record_data-db-1:/tmp/eth.csv ./eth.csv
docker cp poly_record_data-db-1:/tmp/sol.csv ./sol.csv
docker cp poly_record_data-db-1:/tmp/xrp.csv ./xrp.csv
exit

# Скачай на мак:
scp root@138.68.129.175:~/poly_record_data/btc.csv ~/Downloads/
scp root@138.68.129.175:~/poly_record_data/eth.csv ~/Downloads/
scp root@138.68.129.175:~/poly_record_data/sol.csv ~/Downloads/
scp root@138.68.129.175:~/poly_record_data/xrp.csv ~/Downloads/

# Удалить рынки
npx tsx ~/Downloads/remove-markets.ts ~/Downloads/btc.csv btc-updown-5m-1777724700 btc-updown-5m-1777982400 btc-updown-5m-1777982700 btc-updown-5m-1777983000
npx tsx ~/Downloads/remove-markets.ts ~/Downloads/eth.csv eth-updown-5m-1777724700 eth-updown-5m-1777982400 eth-updown-5m-1777982700 eth-updown-5m-1777983000
npx tsx ~/Downloads/remove-markets.ts ~/Downloads/sol.csv sol-updown-5m-1777724700 sol-updown-5m-1777982400 sol-updown-5m-1777982700 sol-updown-5m-1777983000
npx tsx ~/Downloads/remove-markets.ts ~/Downloads/xrp.csv xrp-updown-5m-1777724700 xrp-updown-5m-1777982400 xrp-updown-5m-1777982700 xrp-updown-5m-1777983000

# Конвертируй в JSON:
npx tsx ~/Downloads/csv-to-json.ts ~/Downloads/btc.csv
npx tsx ~/Downloads/csv-to-json.ts ~/Downloads/eth.csv
npx tsx ~/Downloads/csv-to-json.ts ~/Downloads/sol.csv
npx tsx ~/Downloads/csv-to-json.ts ~/Downloads/xrp.csv



# Подключись к серверу:
ssh root@138.68.129.175
cd poly_record_data

# Очисти базу:
docker compose exec db psql -U poly polymarket -c "TRUNCATE orderbook_snapshots, sessions RESTART IDENTITY CASCADE;"

# Перезапусти приложение:
docker compose restart app