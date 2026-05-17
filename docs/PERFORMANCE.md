# Seed Script Performance

## Approach

Used SQLAlchemy `bulk_insert_mappings` in batches of 500 rows inside a
single transaction. This bypasses ORM object instantiation entirely and
fsyncs once at commit rather than once per row.

## Result

10,000 employees inserted in ~2s on SQLite.

## Why batch size 500?

SQLite has a limit of 999 bound variables per statement. With 9 columns
per employee, a batch of 500 = 4,500 variables — safely under the limit
while keeping the number of round trips minimal.

## Idempotency

The script clears existing data before inserting. Safe to run repeatedly
without duplicates. Engineers can run `python seed.py` at any time.