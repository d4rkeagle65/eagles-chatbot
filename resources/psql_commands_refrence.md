These are just some commands I have used for psql that I wanted to have a note of:

```
# Dump 1 database table to another
psql -d ecb -c 'DELETE FROM userlist' && pg_dump -a -t userlist ecb_test | psql ecb

# Save database table to csv file
sudo -u ecb_test_user psql -d ecb_test -c "\\copy bsrqueue FROM '/data/bsrqueue_test.csv' WITH CSV HEADER DELIMITER ','"

# Restore csv formatted file to database table
sudo -u ecb_test_user psql -d ecb_test -c "DELETE FROM bsrqueue" && sudo -u ecb_test_user psql -d ecb_test -c "\\copy bsrqueue FROM '/data/bsrqueue_test.csv' WITH CSV HEADER DELIMITER ','"


